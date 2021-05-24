# Crossref Deposit Form POC
Proof of Concept demonstration of the new Deposit UI framework, based on [React JSONSchema Form](https://github.com/rjsf-team/react-jsonschema-form).

N.B. This is a proof of concept. Some modifications have been made directly to the underlying library to support eg the validation of specific data types, or enable custom functionality such as the lookup of title from ISSN. XML generation is based on a [handlebars template](https://github.com/yaffol/react-jsonschema-form/blob/e0d5238fb30c8034c42461c4cdbe3a90e985b09f/packages/playground/src/app.js#L29) which is not feature-complete.

## Run

To run the project on your local computer, first open a terminal and clone the repository:

`git clone git@github.com:yaffol/react-jsonschema-form.git`

Then change to the directory containing the project:

`cs react-jsonschema-form`

Then run the project by using the `run.sh` script in your terminal:

`./run.sh`

Success is indicated by `ℹ ｢wdm｣: Compiled successfully.`

Then open [http://localhost:8080](http://localhost:8080) in a browser.

You can also use the same script to create a compiled version of the project, which can be run by simply opening an `index.html` file in a web browser. To do, this pass the name of the folder you want it to create as the first argument to the `run.sh` script:

`./run.sh my-folder-name`

See also [build](#build) instructions.

When running the project in a browser, by default only the form is displayed. 

To enable the controls that allow you to display more elements, press `CTRL+x`. 

This will cause the display control checkboxes to appear in the top-right of the window.

- To display the form schema, form data and XML boxes, check `PRO Mode`. 
- To switch the form schema and form data boxes from JSON to YAML format, choose 'YAML mode'. 
- To enable live validation of form elements, tick 'Live validation'.

To edit the form schema, you can either edit the schema directly in the JSON Schema editor when `PRO Mode` is enabled, or you can edit the `*_template.json` file in the `data/` directory at the root of the project.

So to edit the journal article template, you would edit `journal_article_template.json`.

See also [configure](#configure).

~~`/run.sh` checks for a container tagged with the latest git commit hash. If you have newer commits but don't want to rebuild the container, alter the docker run command to target the `:latest` tag instead.~~

`./run.sh` targets `yaffol/deposit-ui-poc:latest` on Docker Hub. To build a new version of the container locally, use `./build.sh` which will tag the container `yaffol/deposit-ui-poc:GIT_COMMIT_HASH`.

## Build

To build the project to an `index.html` and associated javascript that can be run directly in a browser, pass a build name as the first argument to `run.sh`.

The built assets will be written out to `build/build_name` in the project root.

To run the built project, open the corresponding `index.html` in a browser.

## Configure

The `GOOGLE_APPLICATION_CREDENTIALS` environment variable MUST be the full path to a Google Cloud Service Account credentials file (json format) for an account with access to the translations API. If not set, the docker run command will fail with the message `docker: Error response from daemon: invalid mount config for type "bind": field Source must not be empty.`.

Data files are mounted into the container via the `data` directory in the root of the project.

Any file matching `*_template.json` will be processed by the pipeline:
- Dereferenced
- Translated
- Added to the manifest

Dereferenced and translated templates, and the application `manifest.json` are generated and stored in `data/dist`.

Any file matching `template_name_uischema.json` will be imported as the UISchema applicable to `template_name`.

Application settings are stored in `data/settings.json` - you can set the locales to translate to, as well as the default locale.

Translations are stored in `data/translations.json`. You can set `human: { ... }` versions of the messages in here. New messages and new locales will persist across container runs (the file is loaded, added to if needed, and written out again on every run).

## Example data
Example templates for journal_article and grant are included within the `data` directory, as are translations and settings for the default locales.

