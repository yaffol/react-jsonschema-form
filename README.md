# Crossref Deposit Form POC
Proof of Concept demonstration of the new Deposit UI framework, based on [React JSONSchema Form](https://github.com/rjsf-team/react-jsonschema-form).


## Run

To run the project in a docker container, execute `./run.sh` in the root of the project. 

Then open [http://localhost:8080](http://localhost:8080) in a browser.

## Configure

The `GOOGLE_APPLICATION_CREDENTIALS` environment variable should be the full path to a Google Cloud Service Account credentials file (json format) for an account with access to the translations API.

Data files are mounted into the container via the `data` directory in the root of the project.

Any file matching `*_template.json` will be processed by the pipeline:
- Dereferenced
- Translated
- Added to the manifest

Dereferenced and translated templates, and the application `manifest.json` are generated and stored in `data/dist`.

Application settings are stored in `data/settings.json` - you can set the locales to translate to, as well as the default locale.

Translations are stored in `data/translations.json`. You can set `human: { ... }` versions of the messages in here. New messages and new locales will persist across container runs (the file is loaded, added to if needed, and written out again on every run).

## Example data
Example templates for journal_article and grant are included within the `data` directory, as are translations and settings for the default locales.

