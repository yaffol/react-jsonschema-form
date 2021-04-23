import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import { samples } from "./samples";
import "react-app-polyfill/ie11";
import Form, { withTheme } from "@rjsf/core";
import DemoFrame from "./DemoFrame";
import { saveAs } from "file-saver";
import * as Loadfile4DOM from "loadfile4dom";
import FileReaderInput from 'react-file-reader-input';
import * as Manifest from './data/manifest.json';
// deepEquals and shouldRender and isArguments are copied from rjsf-core. TODO: unify these utility functions.

function isArguments(object) {
  return Object.prototype.toString.call(object) === "[object Arguments]";
}

function deepEquals(a, b, ca = [], cb = []) {
  // Partially extracted from node-deeper and adapted to exclude comparison
  // checks for functions.
  // https://github.com/othiym23/node-deeper
  if (a === b) {
    return true;
  } else if (typeof a === "function" || typeof b === "function") {
    // Assume all functions are equivalent
    // see https://github.com/rjsf-team/react-jsonschema-form/issues/255
    return true;
  } else if (typeof a !== "object" || typeof b !== "object") {
    return false;
  } else if (a === null || b === null) {
    return false;
  } else if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  } else if (a instanceof RegExp && b instanceof RegExp) {
    return (
      a.source === b.source &&
      a.global === b.global &&
      a.multiline === b.multiline &&
      a.lastIndex === b.lastIndex &&
      a.ignoreCase === b.ignoreCase
    );
  } else if (isArguments(a) || isArguments(b)) {
    if (!(isArguments(a) && isArguments(b))) {
      return false;
    }
    let slice = Array.prototype.slice;
    return deepEquals(slice.call(a), slice.call(b), ca, cb);
  } else {
    if (a.constructor !== b.constructor) {
      return false;
    }

    let ka = Object.keys(a);
    let kb = Object.keys(b);
    // don't bother with stack acrobatics if there's nothing there
    if (ka.length === 0 && kb.length === 0) {
      return true;
    }
    if (ka.length !== kb.length) {
      return false;
    }

    let cal = ca.length;
    while (cal--) {
      if (ca[cal] === a) {
        return cb[cal] === b;
      }
    }
    ca.push(a);
    cb.push(b);

    ka.sort();
    kb.sort();
    for (var j = ka.length - 1; j >= 0; j--) {
      if (ka[j] !== kb[j]) {
        return false;
      }
    }

    let key;
    for (let k = ka.length - 1; k >= 0; k--) {
      key = ka[k];
      if (!deepEquals(a[key], b[key], ca, cb)) {
        return false;
      }
    }

    ca.pop();
    cb.pop();

    return true;
  }
}

function shouldRender(comp, nextProps, nextState) {
  const { props, state } = comp;
  return !deepEquals(props, nextProps) || !deepEquals(state, nextState);
}

const log = type => console.log.bind(console, type);
const toJson = val => JSON.stringify(val, null, 2);
const liveSettingsSchema = {
  type: "object",
  properties: {
    validate: { type: "boolean", title: "Live validation" },
    disable: { type: "boolean", title: "Disable whole form" },
    omitExtraData: { type: "boolean", title: "Omit extra data" },
    liveOmit: { type: "boolean", title: "Live omit" },
  },
};

const monacoEditorOptions = {
  minimap: {
    enabled: false,
  },
  automaticLayout: true,
};

class GeoPosition extends Component {
  constructor(props) {
    super(props);
    this.state = { ...props.formData };
  }

  onChange(name) {
    return event => {
      this.setState({ [name]: parseFloat(event.target.value) });
      setImmediate(() => this.props.onChange(this.state));
    };
  }

  render() {
    const { lat, lon } = this.state;
    return (
      <div className="geo">
        <h3>Hey, I'm a custom component</h3>
        <p>
          I'm registered as <code>geo</code> and referenced in
          <code>uiSchema</code> as the <code>ui:field</code> to use for this
          schema.
        </p>
        <div className="row">
          <div className="col-sm-6">
            <label>Latitude</label>
            <input
              className="form-control"
              type="number"
              value={lat}
              step="0.00001"
              onChange={this.onChange("lat")}
            />
          </div>
          <div className="col-sm-6">
            <label>Longitude</label>
            <input
              className="form-control"
              type="number"
              value={lon}
              step="0.00001"
              onChange={this.onChange("lon")}
            />
          </div>
        </div>
      </div>
    );
  }
}

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = { valid: true, code: props.code };
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.setState({ valid: true, code: props.code });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.valid) {
      return (
        JSON.stringify(JSON.parse(nextProps.code)) !==
        JSON.stringify(JSON.parse(this.state.code))
      );
    }
    return false;
  }

  onCodeChange = code => {
    try {
      const parsedCode = JSON.parse(code);
      this.setState({ valid: true, code }, () =>
        this.props.onChange(parsedCode)
      );
    } catch (err) {
      this.setState({ valid: false, code });
    }
  };

  render() {
    const { title } = this.props;
    const icon = this.state.valid ? "ok" : "remove";
    const cls = this.state.valid ? "valid" : "invalid";
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <span className={`${cls} glyphicon glyphicon-${icon}`} />
          {" " + title}
        </div>
        <MonacoEditor
          language="json"
          value={this.state.code}
          theme="vs-light"
          onChange={this.onCodeChange}
          height={400}
          options={monacoEditorOptions}
        />
      </div>
    );
  }
}

class Selector extends Component {
  constructor(props) {
    super(props);
    this.state = { current: "Simple" };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldRender(this, nextProps, nextState);
  }

  onLabelClick = label => {
    return event => {
      event.preventDefault();
      this.setState({ current: label });
      setImmediate(() => this.props.onSelected(samples[label]));
    };
  };

  render() {
    return (
      <ul className="nav nav-pills">
        {Object.keys(samples).map((label, i) => {
          return (
            <li
              key={i}
              role="presentation"
              className={this.state.current === label ? "active" : ""}>
              <a href="#" onClick={this.onLabelClick(label)}>
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }
}

function LocaleSelector({ locale, locales, select }) {
  const schema = {
    type: "string",
    enum: Object.keys(locales),
  };
  const uiSchema = {
    "ui:placeholder": "Select locale",
  };
  return (
    <Form
      className="form_rjsf_localeSelector"
      idPrefix="rjsf_localeSelector"
      schema={schema}
      uiSchema={uiSchema}
      formData={locale}
      onChange={({ formData }) =>
        formData && select(formData, locales)
      }>
      <div />
    </Form>
  );
}

function ThemeSelector({ theme, themes, select }) {
  const schema = {
    type: "string",
    enum: Object.keys(themes),
  };
  const uiSchema = {
    "ui:placeholder": "Select theme",
  };
  return (
    <Form
      className="form_rjsf_themeSelector"
      idPrefix="rjsf_themeSelector"
      schema={schema}
      uiSchema={uiSchema}
      formData={theme}
      onChange={({ formData }) =>
        formData && select(formData, themes[formData])
      }>
      <div />
    </Form>
  );
}

function SubthemeSelector({ subtheme, subthemes, select }) {
  const schema = {
    type: "string",
    enum: Object.keys(subthemes),
  };
  const uiSchema = {
    "ui:placeholder": "Select subtheme",
  };
  return (
    <Form
      className="form_rjsf_subthemeSelector"
      idPrefix="rjsf_subthemeSelector"
      schema={schema}
      uiSchema={uiSchema}
      formData={subtheme}
      onChange={({ formData }) =>
        formData && select(formData, subthemes[formData])
      }>
      <div />
    </Form>
  );
}


class ReactFileReader extends React.Component {
  handleFileRead = e => {
    const content = this.fileReader.result;
    console.log(content);
    // … do something with the 'content' …
  };

  handleFileChosen = file => {
    this.fileReader = new ReactFileReader();
    this.fileReader.onloadend = this.handleFileRead;
    this.fileReader.readAsText(file);
  };

  handleChange = (e, results) => {
    results.forEach(result => {
      const [e, file] = result;
      // this.props.dispatch(uploadFile(e.target.result));
      console.log(`Successfully uploaded ${file.name}!${e}`);
      this.handleFileChosen(file);
    });
  }
  render() {
    return (
      <div>
        <label htmlFor="my-file-input">Upload a File:</label>
        <FileReaderInput as="text" id="my-file-input"
                         onChange={this.handleChange}>
          <button>Select a file!</button>
        </FileReaderInput>
      </div>
    );
  }
}

class ImportFromFileBodyComponent extends Component {
  constructor() {
    super();
    this.state = {
      fileReader: null,
    };
  }

  handleFileRead = e => {
    const content = this.fileReader.result;
    console.log(content);
    // … do something with the 'content' …
  };

  handleFileChosen = file => {
    this.fileReader = new ReactFileReader();
    this.fileReader.onloadend = this.handleFileRead;
    this.fileReader.readAsText(file);
  };

  render() {
    return (
      <div className="upload-expense">
        <input
          type="file"
          id="file"
          className="input-file"
          accept=".csv"
          onChange={e => this.handleFileChosen(e.target.files[0])}
        />
      </div>
    );
  }
}

class LoadLink extends Component {
  onLoadClick = event => {
    console.log("Load clicked...");
  };

  render() {
    const { onLoad } = this.props;
    return (
      <button className="btn btn-default" type="button" onClick={onLoad}>
        Load
      </button>
    );
  }
}

class SaveLink extends Component {
  onSaveClick = event => {
    console.log("Save clicked...");
  };

  render() {
    const { onSave } = this.props;
    return (
      <button className="btn btn-default" type="button" onClick={onSave}>
        Save
      </button>
    );
  }
}

class CopyLink extends Component {
  onCopyClick = event => {
    this.input.select();
    document.execCommand("copy");
  };

  render() {
    const { shareURL, onShare } = this.props;
    if (!shareURL) {
      return (
        <button className="btn btn-default" type="button" onClick={onShare}>
          Share
        </button>
      );
    }
    return (
      <div className="input-group">
        <input
          type="text"
          ref={input => (this.input = input)}
          className="form-control"
          defaultValue={shareURL}
        />
        <span className="input-group-btn">
          <button
            className="btn btn-default"
            type="button"
            onClick={this.onCopyClick}>
            <i className="glyphicon glyphicon-copy" />
          </button>
        </span>
      </div>
    );
  }
}

class Playground extends Component {
  constructor(props) {
    super(props);

    // set default theme
    const theme = "default";
    // initialize state with Simple data sample
    const { uiSchema, formData, validate } = samples.Simple;
    const { defaultLocale, locales } = Manifest;
    const schema = locales[defaultLocale].data;
    this.state = {
      form: false,
      defaultLocale,
      locales,
      schema,
      uiSchema,
      formData,
      validate,
      theme,
      subtheme: null,
      liveSettings: {
        validate: false,
        disable: false,
        omitExtraData: false,
        liveOmit: false,
      },
      shareURL: null,
      FormComponent: withTheme({}),
    };
  }

  componentDidMount() {
    const { themes } = this.props;
    const { theme } = this.state;
    const hash = document.location.hash.match(/#(.*)/);
    if (hash && typeof hash[1] === "string" && hash[1].length > 0) {
      try {
        this.load(JSON.parse(atob(hash[1])));
      } catch (err) {
        alert("Unable to load form setup data.");
      }
    } else {
      // initialize theme
      this.onThemeSelected(theme, themes[theme]);

      this.setState({ form: true });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldRender(this, nextProps, nextState);
  }

  load = data => {
    // Reset the ArrayFieldTemplate whenever you load new data
    const { ArrayFieldTemplate, ObjectFieldTemplate, extraErrors } = data;
    // uiSchema is missing on some examples. Provide a default to
    // clear the field in all cases.
    const { uiSchema = {} } = data;

    const { theme = this.state.theme } = data;
    const { themes } = this.props;
    this.onThemeSelected(theme, themes[theme]);

    // force resetting form component instance
    this.setState({ form: false }, () =>
      this.setState({
        ...data,
        form: true,
        ArrayFieldTemplate,
        ObjectFieldTemplate,
        uiSchema,
        extraErrors,
      })
    );
  };

  onSchemaEdited = schema => this.setState({ schema, shareURL: null });

  onUISchemaEdited = uiSchema => this.setState({ uiSchema, shareURL: null });

  onFormDataEdited = formData => this.setState({ formData, shareURL: null });

  onExtraErrorsEdited = extraErrors =>
    this.setState({ extraErrors, shareURL: null });

  onLocaleSelected = (
    locale,
    locales
  ) => {
    console.log(`Locale selected: ${locale}`);
    const localisedSchema = locales[locale].data;
    debugger;
    if (!localisedSchema) {
      console.warn(`No localised schema found for: ${locale}`)
      return;
    }
    this.setState({
      locale,
      schema: localisedSchema
    });
  };

  onThemeSelected = (
    theme,
    { subthemes, stylesheet, theme: themeObj } = {}
  ) => {
    this.setState({
      theme,
      subthemes,
      subtheme: null,
      FormComponent: withTheme(themeObj),
      stylesheet,
    });
  };

  onSubthemeSelected = (subtheme, { stylesheet }) => {
    this.setState({
      subtheme,
      stylesheet,
    });
  };

  setLiveSettings = ({ formData }) => this.setState({ liveSettings: formData });

  onFormDataChange = ({ formData = "" }) =>
    this.setState({ formData, shareURL: null });

  onShare = () => {
    const {
      formData,
      schema,
      uiSchema,
      liveSettings,
      errorSchema,
      theme,
    } = this.state;
    const {
      location: { origin, pathname },
    } = document;
    try {
      const hash = btoa(
        JSON.stringify({
          formData,
          schema,
          uiSchema,
          theme,
          liveSettings,
          errorSchema,
        })
      );
      this.setState({ shareURL: `${origin}${pathname}#${hash}` });
    } catch (err) {
      this.setState({ shareURL: null });
    }
  };



  onLoad = () => {
    console.log("Load clicked...");
    const lf4d = new Loadfile4DOM();
    const options = {
      debug: false, // if true, it will show the hidden <input type="file" ...> loaders in DOM
    };
    lf4d.init(document, options);
    //-----------------------------------------------
    //----- Create a new Loader "txtfile" -----------
    //-----------------------------------------------
    // with MIME type filter use type="text"
    //var txtfile = lf4d.get_loader_options("mytxtfile","text");

    // if arbitray files are allowed use type="all"
    const txtfile = lf4d.get_loader_options("mytxtfile", "text");
    // Define what to do with the loaded data
    txtfile.returntype = "file"; // data contains the file
    console.log("txtfile: " + JSON.stringify(txtfile));
    const onLoadCallback = (data, err) => {
      if (err) {
        // do something on error, perr contains error message
        console.error(err);
        alert("ERROR: " + err);
      } else {
        // do something with the file content in data e.g. store  in a HTML textarea (e.g. <textarea id="mytextarea" ...>
        console.log("CALL: txtfile.onload()");
        console.log(data);
        const parsedCode = JSON.parse(data);
        console.log(parsedCode);
        this.setState({
          schema: parsedCode.schema,
          uiSchema: parsedCode.uiSchema,
          formData: parsedCode.formData
        });
        // this.onSchemaEdited(parsedCode.schema);
        // document.getElementById("mytextarea").value = data;
      }
      return data;
    };

    txtfile.onload = onLoadCallback;

    // create the loader txtfile
    lf4d.create_load_dialog(txtfile);
    lf4d.open_dialog("mytxtfile");
  };

  onSave = () => {
    const {
      formData,
      schema,
      uiSchema,
      liveSettings,
      errorSchema,
      theme,
    } = this.state;
    const payload = {
      formData,
      schema,
      uiSchema,
      liveSettings,
      errorSchema,
      theme,
    };
    console.log(payload);
    const blob = new Blob([JSON.stringify(payload)], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "hello_world.json");
  };

  render() {
    const {
      schema,
      uiSchema,
      formData,
      locale,
      locales,
      extraErrors,
      liveSettings,
      validate,
      theme,
      subtheme,
      FormComponent,
      ArrayFieldTemplate,
      ObjectFieldTemplate,
      transformErrors,
    } = this.state;

    const { themes } = this.props;

    let templateProps = {};
    if (ArrayFieldTemplate) {
      templateProps.ArrayFieldTemplate = ArrayFieldTemplate;
    }
    if (ObjectFieldTemplate) {
      templateProps.ObjectFieldTemplate = ObjectFieldTemplate;
    }
    if (extraErrors) {
      templateProps.extraErrors = extraErrors;
    }

    return (
      <div className="container-fluid">
        <div className="page-header">
          <h1>react-jsonschema-form</h1>
          <div className="row">
            <div className="col-sm-8">
              <Selector onSelected={this.load} />
            </div>
            <div className="col-sm-2">
              <Form
                idPrefix="rjsf_options"
                schema={liveSettingsSchema}
                formData={liveSettings}
                onChange={this.setLiveSettings}>
                <div />
              </Form>
            </div>
            <div className="col-sm-2">
              <LocaleSelector
                locales={locales}
                locale={locale}
                select={this.onLocaleSelected}
              />
              <ThemeSelector
                themes={themes}
                theme={theme}
                select={this.onThemeSelected}
              />
              {themes[theme].subthemes && (
                <SubthemeSelector
                  subthemes={themes[theme].subthemes}
                  subtheme={subtheme}
                  select={this.onSubthemeSelected}
                />
              )}
              <CopyLink shareURL={this.state.shareURL} onShare={this.onShare} />
              <SaveLink onSave={this.onSave} />
              <LoadLink onLoad={this.onLoad} />
              {/*<ImportFromFileBodyComponent />*/}
              {/*<ReactFileReader/>*/}
            </div>
          </div>
        </div>
        <div className="col-sm-7">
          <Editor
            title="JSONSchema"
            code={toJson(schema)}
            onChange={this.onSchemaEdited}
          />
          <div className="row">
            <div className="col-sm-6">
              <Editor
                title="UISchema"
                code={toJson(uiSchema)}
                onChange={this.onUISchemaEdited}
              />
            </div>
            <div className="col-sm-6">
              <Editor
                title="formData"
                code={toJson(formData)}
                onChange={this.onFormDataEdited}
              />
            </div>
          </div>
          {extraErrors && (
            <div className="row">
              <div className="col">
                <Editor
                  title="extraErrors"
                  code={toJson(extraErrors || {})}
                  onChange={this.onExtraErrorsEdited}
                />
              </div>
            </div>
          )}
        </div>
        <div className="col-sm-5">
          {this.state.form && (
            <DemoFrame
              head={
                <React.Fragment>
                  <link
                    rel="stylesheet"
                    id="theme"
                    href={this.state.stylesheet || ""}
                  />
                  {theme === "antd" && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: document.getElementById("antd-styles-iframe")
                          .contentDocument.head.innerHTML,
                      }}
                    />
                  )}
                </React.Fragment>
              }
              style={{
                width: "100%",
                height: 1000,
                border: 0,
              }}
              theme={theme}>
              <FormComponent
                {...templateProps}
                liveValidate={liveSettings.validate}
                disabled={liveSettings.disable}
                omitExtraData={liveSettings.omitExtraData}
                liveOmit={liveSettings.liveOmit}
                schema={schema}
                uiSchema={uiSchema}
                formData={formData}
                onChange={this.onFormDataChange}
                noHtml5Validate={true}
                onSubmit={({ formData }, e) => {
                  console.log("submitted formData", formData);
                  console.log("submit event", e);
                }}
                fields={{ geo: GeoPosition }}
                validate={validate}
                onBlur={(id, value) =>
                  console.log(`Touched ${id} with value ${value}`)
                }
                onFocus={(id, value) =>
                  console.log(`Focused ${id} with value ${value}`)
                }
                transformErrors={transformErrors}
                onError={log("errors")}
              />
            </DemoFrame>
          )}
        </div>
        <div className="col-sm-12">
          <p style={{ textAlign: "center" }}>
            Powered by{" "}
            <a href="https://github.com/rjsf-team/react-jsonschema-form">
              react-jsonschema-form
            </a>
            .
            {process.env.SHOW_NETLIFY_BADGE === "true" && (
              <div style={{ float: "right" }}>
                <a href="https://www.netlify.com">
                  <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" />
                </a>
              </div>
            )}
          </p>
        </div>
      </div>
    );
  }
}

export default Playground;
