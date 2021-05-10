# Crossref Deposit Form POC
Proof of Concept demonstration of the new Deposit UI framework, based on [React JSONSchema Form](https://github.com/rjsf-team/react-jsonschema-form).


## Run

To run the project in a docker container, execute `./run.sh` in the root of the project. 

Then open [http://localhost:8080](http://localhost:8080) in a browser.

## Configure

The `GOOGLE_APPLICATION_CREDENTIALS` environment variable should be the full path to a Google Cloud Service Account credentials file (json format) for an account with access to the translations API.

