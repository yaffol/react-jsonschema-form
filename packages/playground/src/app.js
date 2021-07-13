import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import { samples } from "./samples";
import "react-app-polyfill/ie11";
import Form, { withTheme } from "@rjsf/core";
import DemoFrame from "./DemoFrame";
import { saveAs } from "file-saver";
import * as Loadfile4DOM from "loadfile4dom";
import FileReaderInput from 'react-file-reader-input';
import * as Manifest from './data/dist/manifest.json';
// import * as formDataDefaultsObj from './data/journal_article_data.json'
const Mustache = require('mustache')
const jsYaml = require('js-yaml')
// const Handlebars = require('handlebars')
const faker = require('faker')
const formDataDefaults = {}
formDataDefaults.doi_batch_id = faker.internet.password(10, false, /[0-9A-Z]/);
console.log(formDataDefaults)
import * as convert from 'xml-js';
import { PickerOverlay } from 'filestack-react';
import mustache from 'mustache/mustache.mjs'
// const journal_article2xml_tpl = require("ejs-compiled-loader!./journal_article2xml.ejs?with=false");
// const journal_article_xml_tpl = fs.readFileSync('./journal_article2xml.hb');
const FILESTACK_API_KEY = 'AKNfh0y4GTtKCMFGBD4ACz';
mustache.escape = function (value)
{
  return value;
};
const xml_templates = [];
const journal_article_xml_tpl =
  `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="4.3.7" xmlns="http://www.crossref.org/schema/4.3.7" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.crossref.org/schema/4.3.7 http://www.crossref.org/schema/deposit/crossref4.3.7.xsd">
 <head>
  <doi_batch_id>{{ faker.internet.password }}</doi_batch_id>
  <timestamp>{{ timestamp }}</timestamp>
  <depositor>
   <depositor_name>{{ depositor.depositor_name }}</depositor_name>
   <email_address>{{ depositor.email_address }}</email_address>
  </depositor>
  <registrant>WEB-FORM</registrant>
 </head>
 <body>
  <journal>
   <journal_metadata>
    <full_title>{{ journal.full_title }}</full_title>
    <abbrev_title>{{ journal.abbrev_title }}</abbrev_title>
    {{#journal.issns}}
        <issn media_type="print">{{.}}</issn>
    {{/journal.issns}}
   </journal_metadata>
   <journal_issue>
    <publication_date media_type="print">
     <month>{{ publication_date.month }}</month>
     <day>{{ publication_date.day }}</day>
     <year>{{ publication_date.year }}</year>
    </publication_date>
    <journal_volume>
     <volume>{{ journal.volume }}</volume>
    </journal_volume>
    <issue>{{ journal.issue }}</issue>
   </journal_issue>
   <!-- ====== This is the article's metadata ======== -->
   {{#articles}}
   <journal_article publication_type="full_text">
     <titles>
      {{#titles}}
        <!-- ====== added lang attribute here ====== -->
         <title lang="{{ title_language }}">{{ title_text }}</title>
      {{/titles}}
      </titles>
    <contributors>
     {{#contributors.people}}
     <person_name sequence="{{ -sequence }}" contributor_role="{{ -contributor_role }}">
      <given_name>{{ given_name }}</given_name>
      <surname>{{ surname }}</surname>
      <ORCID>{{ ORCID }}</ORCID>
      <!-- ====== added suffix tag ====== -->
      <suffix>{{ suffix }}</suffix>
     </person_name>
     {{/contributors.people}}
    </contributors>
    <publication_date media_type="print">
     <month>{{#monthFromDate}}{{ publication_date }}{{/monthFromDate}}</month>
     <day>{{#dayFromDate}}{{ publication_date }}{{/dayFromDate}}</day>
     <year>{{#yearFromDate}}{{ publication_date }}{{/yearFromDate}}</year>
    </publication_date>
    {{#article_location.number}}
      
    {{/article_location.number}}
    {{#article_location}}
    <pages>
     {{#first_page}}
     <first_page>{{first_page}}</first_page>
     {{/first_page}}
     {{#last_page}}
     <last_page>{{last_page}}</last_page>
     {{/last_page}}
    </pages>
    <!-- ====== TODO: handle article_location which is a number ====== -->
    {{/article_location}}
    {{#license}}
    {{#cc_url}}
    <cc_license>{{cc_url}}</cc_license>
    {{/cc_url}}
    {{#other_url}}
    <other_license>{{other_url}}</other_license>
    {{/other_url}}
    {{/license}}
    <doi_data>
     <doi>{{resolution_information.doi}}</doi>
     <resource>{{resolution_information.resource}}</resource>
    </doi_data>
    <!-- =========  Here is the list of references cited in the above article -->
    <citation_list>
    {{#references}}
    <!-- ====== TODO: handle key="refX" index ====== -->
     {{#DOI}}
     <citation key="ref2">
      <doi>{{DOI}}</doi>
     </citation>
     {{/DOI}}
     {{#reference}}
     <citation key="ref=3">
       <unstructured_citation>{{ reference }}</unstructured_citation>
     </citation>
     {{/reference}}
     {{#author}}
      <citation key="ref1">
        <journal_title>{{journal_title}}</journal_title>
        <author>{{author}}</author>
        <volume></volume>
        <first_page>{{first_page}}</first_page>
        <cYear>{{year}}</cYear>
     </citation>
     {{/author}}
     {{#index}}references{{/index}}
    {{/references}}
    </citation_list>
   </journal_article>
   {{/articles}}
  </journal>
 </body>
</doi_batch>

`;

xml_templates['journal_article'] = journal_article_xml_tpl;

const grant_xml_tpl = `
<?xml version="1.0" encoding="UTF-8"?>
<doi_batch xmlns="http://www.crossref.org/schema/1.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.crossref.org/schema/1.0 grantID.xsd">
    <head>
        <doi_batch_id>batch_000001</doi_batch_id>
        <timestamp>20180102030456</timestamp>
        <depositor>
            <depositor_name>{{ depositor.depositor_name }}</depositor_name>
            <email_address>{{ depositor.email_address }}</email_address>
        </depositor>
        <registrant>Crossref</registrant>
    </head>
    <body>
        
        <!-- a grant with one project -->
        <grant>
            <project>
                <project-title xml:lang="{{ grants[0].project.project-title[0].lang}}">{{ grants[0].project["project-title"][0]["title-text"] }}</project-title>
                    <person role="lead_investigator">
                        <givenName>Minerva</givenName>
                        <familyName>Reuland</familyName>
                        <alternateName>Minnie Cat</alternateName>
                        <affiliation>
                            <institution>University of Crossref</institution>
                        </affiliation>
                        <ORCID>https://orcid.org/0000-0002-4011-3590</ORCID>
                    </person>
                </investigators>
                <description xml:lang="en">This is an example of a project description or abstract. Multiple descriptions may be supplied to accommodate different description or abstract types, or to provide descriptions in multiple languages.</description>
                <description xml:lang="pt">Este é um exemplo de uma descrição ou resumo do projeto. Várias descrições podem ser fornecidas para acomodar diferentes descrições ou tipos abstratos, ou para fornecer descrições em vários idiomas.</description>
                <award_amount currency="USD">24.50</award_amount>
                <funding amount="24.50" currency="USD" funding-percentage="100"
                    funding-type="equipment">
                    <funder-name>Wellcome Trust</funder-name>
                    <funder-id>https://doi.org/10.13039/100004440</funder-id>
                    <funding-scheme>Sofa Lending Programme</funding-scheme>
                </funding>
                <award-dates start-date="2018-01-05" end-date="2023-02-01"/>
            </project>
            <award-number>CR-001x</award-number>
            <award-start-date>2018-01-01</award-start-date>
            <doi_data>
                <doi>10.32013/NI84HFx</doi>
                <resource>https://www.crossref.org/blog/wellcome-explains-the-benefits-of-developing-an-open-and-global-grant-identifier/</resource>
            </doi_data>
        </grant>
        <!--a grant with multiple projects -->
        <grant>
            <project>
                <project-title xml:lang="en">Registering identifiers for grants</project-title>
                <project-title xml:lang="ja">補助金の識別子を登録する</project-title>
                <project-title xml:lang="fr">Enregistrement d'identifiants pour des subventions</project-title>
                <investigators>
                    <person role="lead_investigator" start-date="2018-01-01">
                        <givenName>Elvis</givenName>
                        <familyName>Yausudder</familyName>
                        <alternateName>Elvis Slozzuffer</alternateName>
                        <affiliation>
                            <institution country="US">Crossref</institution>
                            <ROR>https://ror.org/02twcfp32</ROR>
                        </affiliation>
                        <affiliation>
                            <institution>University of Metadata</institution>
                        </affiliation>
                        <ORCID>https://orcid.org/0000-0002-4011-3590</ORCID>
                    </person>
                    <person role="co-lead_investigator" start-date="2019-01-01" end-date="2019-03-31">
                        <givenName>Valerie</givenName>
                        <familyName>Torf</familyName>
                        <affiliation>
                            <institution country="US">Crossref</institution>
                            <ROR>https://ror.org/02twcfp32</ROR>
                        </affiliation>
                    </person>
                </investigators>
                <description xml:lang="en">This is an example of a project description or abstract. Multiple descriptions may be supplied to accommodate different description or abstract types, or to provide descriptions in multiple languages.</description>
                <description xml:lang="fr">Ceci est un exemple de description de projet ou de résumé. Plusieurs descriptions peuvent être fournies pour prendre en charge différents types de description ou d’abrégés, ou pour fournir des descriptions dans plusieurs langues.</description>
                <award_amount currency="USD">1000000</award_amount>
                <funding amount="500000" currency="USD" funding-percentage="50"
                    funding-type="grant">
                    <funder-name>Wellcome Trust</funder-name>
                    <funder-id>https://doi.org/10.13039/100004440</funder-id>
                    <funding-scheme>Metadata quality initiative</funding-scheme>
                </funding>
                <funding amount="500000" currency="USD" funding-percentage="50"
                    funding-type="prize">
                    <funder-name>Wellcome Trust</funder-name>
                    <funder-id>https://doi.org/10.13039/100004440</funder-id>
                    <funding-scheme>Metadata is awesome prize</funding-scheme>
                </funding>
                <award-dates start-date="2018-01-05" end-date="2023-02-01"/>
            </project>
            <project>
                <project-title>Metadata outputs for grant identifiers</project-title>
                <investigators>
                    <person role="lead_investigator" start-date="2019-01-01" end-date="2019-03-31">
                        <givenName>Edana</givenName>
                        <familyName>Trolb</familyName>
                        <alternateName>Scarlet Zomb</alternateName>
                        <affiliation>
                            <institution country="US">Crossref</institution>
                            <ROR>https://ror.org/02twcfp32</ROR>
                        </affiliation>
                    </person>
                </investigators>
                <description xml:lang="en">This is an example of an abstract or project description. The length is unlimited.</description>
                <award_amount currency="USD">1000</award_amount>
                <funding funding-type="contract">
                    <funder-name>Wellcome Trust</funder-name>
                    <funder-id>https://doi.org/10.13039/100004440</funder-id>
                    <funding-scheme>Metadata quality initiative</funding-scheme>
                </funding>
            </project>
            <award-number>CR-567</award-number>
            <award-start-date>2018-01-01</award-start-date>
            <program xmlns="http://www.crossref.org/relations.xsd">
                <related_item>
                    <description>article funded by grant</description>
                    <inter_work_relation identifier-type="doi" relationship-type="finances">10.32013/12345678</inter_work_relation>
                </related_item>
                <related_item>
                    <description>article funded by grant</description>
                    <inter_work_relation identifier-type="doi" relationship-type="finances">10.32013/876543</inter_work_relation>
                </related_item>
            </program>
            <doi_data>
                <doi>10.32013/NIVFDJ34</doi>
                <resource>https://www.crossref.org/blog/wellcome-explains-the-benefits-of-developing-an-open-and-global-grant-identifier/</resource>
            </doi_data>
        </grant>

    </body>
</doi_batch>
`

xml_templates['grant'] = grant_xml_tpl;
xml_templates['journal_article_ur'] = journal_article_xml_tpl;
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

function getDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day =`${date.getDate()}`.padStart(2, '0');
  return `${year}${month}${day}`;
}

const log = type => console.log.bind(console, type);
const toJson = val => JSON.stringify(val, null, 2);
const toYaml = val => {
  try {
    const yaml = jsYaml.dump(val);
    return yaml
  }
  catch (e) {
    console.log('error dumping yaml: ',e,val)
  }
}
const liveSettingsSchema = {
  type: "object",
  properties: {
    proMode: { type: "boolean", title: "PRO Mode" },
    yamlMode: { type: "boolean", title: "YAML Mode" },
    validate: { type: "boolean", title: "Live validation" },
    verboseValidation: { type: "boolean", title: "Verbose validation" },
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
      event.preventDefault();
      return event.target.val;
    };
  }

  render() {
    const { lat, lon } = this.state;
    return (
      <div className="geo">
        <h3>DOI Input</h3>
        <p>
          A DOI Input
        </p>
        <div className="row">
          <div className="col-sm-6">
            <label>DOI Input</label>
            <input
              className="form-control"
              type="string"
              value={lat}
              onChange={this.onChange()}
            />
          </div>
        </div>
      </div>
    );
  }
}

class GeoPositionOrig extends Component {
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

class XMLEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { valid: true, code: props.code };
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.setState({ valid: true, code: props.code });
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.state.valid) {
  //     return (
  //       nextProps.code !== this.state.code
  //     );
  //   }
  //   return false;
  // }

  onCodeChange = code => {
    try {
      this.setState({ valid: true, code }, () =>
        this.props.onChange(code)
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
          language="xml"
          value={this.state.code}
          theme="vs-light"
          onChange={this.onCodeChange}
          height={600}
          options={monacoEditorOptions}
        />
      </div>
    );
  }
}

class YAMLEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { valid: true, code: props.code };
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.setState({ valid: true, code: props.code });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
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
      const parsedCode = jsYaml.load(code);
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
          language="yaml"
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
    return null;
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

function TemplateSelector({ template, templates, locale, select }) {
  const schema = {
    type: "string",
    enum: Object.keys(templates),
  };
  const uiSchema = {
    "ui:placeholder": "Select template",
  };
  return (
    <Form
      className="form_rjsf_templateSelector"
      idPrefix="rjsf_templateSelector"
      schema={schema}
      uiSchema={uiSchema}
      formData={template}
      onChange={({ formData }) =>
        formData && select(formData, templates, locale)
      }>
      <div />
    </Form>
  );
}

function LocaleSelector({ locale, locales, template, templates, select }) {
  const schema = {
    type: "string",
    enum: locales,
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
        formData && select(formData, locales, template, templates)
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
  return null;
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

class SubmitLink extends Component {
  render() {
    const { onSubmit } = this.props;
    return (
      <button className="btn btn-default" type="button" onClick={onSubmit}>
        Register
      </button>
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
    return null;
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
    this.setTitle = this.setTitle.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.toggleScaryTechincalDetails = this.toggleScaryTechincalDetails.bind(this);

    // set default theme
    // const theme = "default";
    const theme = "material-ui";
    // initialize state with Simple data sample
    // const { uiSchema, formData, validate } = samples.Simple;
    const {validate} = samples.Simple;
    const formData = {
    };
    const XML = '';
    const { defaultLocale, locales, defaultTemplate, templates } = Manifest;
    const template = defaultTemplate;
    const schema = templates[template]['locales'][defaultLocale].data;
    const uiSchema = templates[template]['uiSchema'];
    const md5 = templates[template]['md5'];
    let version = '';
    try {
      version = schema.self.version;
    }
    catch (e) {
      console.warn('No version defined in schema.self');
    }
    this.state = {
      scaryTechnicalDetails: false,
      form: false,
      defaultLocale,
      defaultTemplate,
      template,
      templates,
      locale: defaultLocale,
      locales,
      schema,
      version,
      uiSchema,
      md5,
      formData,
      formDataDefaults,
      XML,
      validate,
      transformErrors: this.transformErrors,
      theme,
      subtheme: null,
      liveSettings: {
        proMode: false,
        yamlMode: false,
        validate: false,
        verboseValidation: false,
        disable: false,
        omitExtraData: false,
        liveOmit: false,
      },
      shareURL: null,
      FormComponent: withTheme({}),
    };
  }

  validate(formData, errors){
    // debugger;
    console.log(formData);
    const e = {
      journal: {
        issns: {
          0: {
            errors: []
          }
        }
      }
    }
    return e;
  }

  toggleScaryTechincalDetails(){
    console.log('!!!TOGGLE SCARY TECHNICAL DETAILS!!!');
    this.setState({
      scaryTechnicalDetails: !this.state.scaryTechnicalDetails
    });
  }

  keydownHandler(e){
    if (e.key==='x' && e.ctrlKey) {
      this.toggleScaryTechincalDetails()
    }
  }

  componentWillUnmount () {

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
    window.addEventListener('setTitle', this.setTitle);
    window.addEventListener('toggleScaryTechnicalDetails', this.toggleScaryTechincalDetails);
    window.addEventListener('keydown', this.keydownHandler);
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

  transformErrors = errors => {
    if (errors){
      console.log(errors);
    }
    return errors;
  };

  onSchemaEdited = schema => this.setState({ schema, shareURL: null });

  onUISchemaEdited = uiSchema => this.setState({ uiSchema, shareURL: null });

  onFormDataEdited = formData => this.setState({ formData, shareURL: null });

  onExtraErrorsEdited = extraErrors =>
    this.setState({ extraErrors, shareURL: null });

  onTemplateSelected = (
    template,
    templates,
    locale
  ) => {
    console.log(`Template selected: ${template}`);
    const localisedSchema = templates[template]['locales'][locale].data;
    const version = localisedSchema.self.version;
    const uiSchema = templates[template]['uiSchema'];
    const md5 = templates[template]['md5'];
    // debugger
    // const localisedSchema = templates['locales'][locale].data;

    if (!localisedSchema) {
      console.warn(`No localised schema found for: ${locale}`);
      return;
    }
    this.setState({
      locale,
      template,
      schema: localisedSchema,
      uiSchema,
      md5,
      version
    });
  };

  onLocaleSelected = (
    locale,
    locales,
    template,
    templates
  ) => {
    console.log(`Locale selected: ${locale}`);
    const localisedSchema = templates[template]['locales'][locale].data;
    // debugger
    // const localisedSchema = templates['locales'][locale].data;

    if (!localisedSchema) {
      console.warn(`No localised schema found for: ${locale}`);
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

  onFormDataChange = ({ formData = "" }) => {
    const XML = this.renderXML(formData);
    console.log(XML)
    this.setState({
      formData, shareURL: null, XML
    });
  }

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

  renderXML = (formData) => {
    const data = {};
    console.log(formData);
    const stringFromDate = function(date, key){
      if (!date) {
        return '';
      }
      try {
        const pubDate = new Date(Date.parse(date));
        const publication_date = {
          year: pubDate.getUTCFullYear(),
          month: pubDate.getUTCMonth()+1,
          day: pubDate.getUTCDate()
        };
        return publication_date[key];
      }
      catch (e) {
        console.log('error parsing date: ', e);
      }
    };
    data.yearFromDate = function(){
      return function(timestamp, render) {
        return stringFromDate(this.publication_date, 'year');
      };
    };
    data.monthFromDate = function(){
      return function(timestamp, render) {
        return stringFromDate(this.publication_date, 'month');
      };
    };
    data.dayFromDate = function(){
      return function(timestamp, render) {
        return stringFromDate(this.publication_date, 'day');
      };
    };
    data.indexOf = function() {
      return function(array, render) {
        return formData[array].indexOf(this);
      };
    };
    try {
      for (const i of formData.articles) {

      }
    }
    catch (e) {
      console.log(e);
    }
    // const data = { formDataDefaults, ...formData };
    console.log(data);
    // const xml = journal_article2xml_tpl({ formDataDefaults, ...formData });
    // const xml = convert.js2xml(formData, { compact: true, spaces: 4 });
    const viewData = { faker: faker, timestamp: Date.now(), ...data, ...formData };
    console.log(viewData)
    const xml = mustache.render(xml_templates[this.state.template], viewData);
    return xml;
  }

  onSubmit = () => {
    console.log("Submit clicked...");
    const {
      formData,
      liveSettings
    } = this.state;
    const xml = this.renderXML(formData);
    console.log(xml);
    const XMLWindowEl = document.querySelector('.xml-window');
    if (liveSettings.proMode) {
      XMLWindowEl.scrollIntoView();
    }
    else {
      alert(xml);
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
          version: parsedCode.version,
          md5: parsedCode.md5,
          uiSchema: parsedCode.uiSchema,
          formData: parsedCode.formData,
          locales: parsedCode.locales,
          locale: parsedCode.locale,
          templates: parsedCode.templates,
          template: parsedCode.template
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

  setTitle = event => {
    let journal = this.state.formData.journal || {};
    journal = { ...journal, full_title: event.detail };
    this.setState({
      formData: { ...this.state.formData, journal: journal }
    });
  }

  onSave = () => {
    const {
      formData,
      schema,
      version,
      md5,
      uiSchema,
      liveSettings,
      errorSchema,
      theme,
      locale,
      locales,
      template,
      templates
    } = this.state;
    const payload = {
      transforms: {
        journal_article_xml: xml_templates['journal_article']
      },
      formData,
      schema,
      version,
      md5,
      uiSchema,
      liveSettings,
      errorSchema,
      theme,
      locale,
      locales,
      template,
      templates
    };
    console.log(payload);
    const blob = new Blob([JSON.stringify(payload)], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, `${template}-${getDateString()}.json`);
  };

  render() {
    const {
      schema,
      uiSchema,
      formData,
      formDataDefaults,
      XML,
      locale,
      locales,
      template,
      templates,
      extraErrors,
      scaryTechnicalDetails,
      liveSettings,
      validate,
      theme,
      subtheme,
      FormComponent,
      ArrayFieldTemplate,
      ObjectFieldTemplate,
      transformErrors
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

    // const schemaSelf = JSON.stringify(schema.self);

    return (
      <div className="container-fluid">
        <div className="page-header">
          <div className="row">
            <div className="col-sm-6">
              <img src={`https://assets.crossref.org/logo/crossref-logo-landscape-200.svg`} width={`200`} height={`68`} alt={`Crossref logo`}></img>
              <h1>Form Runner</h1>
              <Selector onSelected={this.load} />
            </div>
            <div className="col-sm-2">
              <pre style={liveSettings.proMode ? { display:'block' } : { display : 'none' } }>
                {JSON.stringify(schema.self, null, 4)}
              </pre>
            </div>
            <div className="col-sm-2 rjsf_options_form">
              <div style={scaryTechnicalDetails ? { display:'block' } : { display : 'none' } }>
                <Form
                  idPrefix="rjsf_options"
                  schema={liveSettingsSchema}
                  formData={liveSettings}
                  onChange={this.setLiveSettings}>
                </Form>
              </div>
            </div>
            <div className="col-sm-2">
              <TemplateSelector
                template={template}
                templates={templates}
                locale={locale}
                select={this.onTemplateSelected}
              />
              <LocaleSelector
                locales={locales}
                locale={locale}
                template={template}
                templates={templates}
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
              <SubmitLink onSubmit={this.onSubmit} />
              {/* <PickerOverlay
                apikey={FILESTACK_API_KEY}
                onSuccess={(res) => console.log(res)}
              /> */}
              {/*<ImportFromFileBodyComponent />*/}
              {/*<ReactFileReader/>*/}
            </div>
          </div>
        </div>
        <div className={liveSettings.proMode ? "col-sm-7" : ""} style={liveSettings.proMode ? { display:'block' } : { display : 'none' } }>
          <div style={!liveSettings.yamlMode ? { display:'block' } : { display : 'none' } }>
            <Editor
              title="JSONSchema"
              code={toJson(schema)}
              onChange={this.onSchemaEdited}
            />
          </div>
          <div style={liveSettings.yamlMode ? { display:'block' } : { display : 'none' } }>
            <YAMLEditor
              title="JSONSchema"
              code={toYaml(schema)}
              onChange={this.onSchemaEdited}
            />
          </div>
          <div className="row">
            <div className="">
              <div style={{ display : 'none' } }>
                <Editor
                  title="UISchema"
                  code={toJson(uiSchema)}
                  onChange={this.onUISchemaEdited}
                />
              </div>
              <div style={ { display : 'none' } }>
                <YAMLEditor
                  title="UISchema"
                  code={toYaml(uiSchema)}
                  onChange={this.onUISchemaEdited}
                />
              </div>
            </div>
            <div className="col-sm-12">
              <div style={!liveSettings.yamlMode ? { display:'block' } : { display : 'none' } }>
                <Editor
                  title="formData"
                  code={toJson(formData)}
                  onChange={this.onFormDataEdited}
                />
              </div>
              <div style={liveSettings.yamlMode ? { display:'block' } : { display : 'none' } }>
                <YAMLEditor
                  title="formData"
                  code={toYaml(formData)}
                  onChange={this.onFormDataEdited}
                />
              </div>
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
        <div className={liveSettings.proMode ? "col-sm-5" : "col-sm-6"}
             style={liveSettings.proMode ? {} : { float: "none", margin: "0 auto" }}>
          {this.state.form && (
            <DemoFrame
              head={
                <React.Fragment>
                  <link
                    rel="stylesheet"
                    id="theme"
                    href={this.state.stylesheet || ""}
                  />
                <style type={"text/css"} dangerouslySetInnerHTML={liveSettings.verboseValidation ? {__html: ``} : {__html: `.MuiFormHelperText-root.Mui-error {
    display: none !important;
}`} }></style>
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
                validate={this.validate}
                onBlur={(id, value) =>
                  console.log(`Touched ${id} with value ${value}`)
                }
                onFocus={(id, value) =>
                  console.log(`Focused ${id} with value ${value}`)
                }
                transformErrors={transformErrors}
                onError={log("errors")}
                showErrorList={liveSettings.verboseValidation}
              />
            </DemoFrame>
          )}
        </div>
        <div className="col-sm-12 mt-3 xml-window" style={liveSettings.proMode ? { display:'block' } : { display : 'none' } }>
          <XMLEditor
            title="xml"
            code={XML}
          />
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
