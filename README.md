# Crossref Form-Runner Prototype

Proof of Concept demonstration of the new Deposit UI framework.

Based on [React JSONSchema Form](https://github.com/rjsf-team/react-jsonschema-form), a project originally sponsored by Mozilla.

To run the project in a docker container, execute `./run.sh` in the root of the project. 

Then open [http://localhost:8080](http://localhost:8080) in a browser.

To enable the translation service, and get new translations (for new locales or changed messages), provide the full path to a Google Cloud Service Account credentials file (.json ormat) for an account with access to the translations API as the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.

