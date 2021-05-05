process.env['GOOGLE_APPLICATION_CREDENTIALS'] = "/home/patrick/contracting/crossref/jsonschema/yaffol-react-jsonschema-form/GoogleCloudKey_form-runner_MyServiceAccount.json"
// import * as json from './data/translations.json';
// import { TranslationServiceClient } from '@google-cloud/translate';
const fs = require('fs');
const yargs = require('yargs');
const { JSONPath } = require('jsonpath-plus');
const jsonpointer = require('jsonpointer');
const json = require('./data/translations.json');
const settings = require('./data/settings.json');
const template = require('./data/grant_template_translated_en.json');

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = '548695940743';
const location = 'global';

// Imports the Google Cloud Translation library
const { TranslationServiceClient } = require('@google-cloud/translate');

// Instantiates a client
const translationClient = new TranslationServiceClient();
const transateText = async function translateText(text = 'text to translate', targetLocale = 'fr') {
  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain', // mime types: text/plain, text/html
    sourceLanguageCode: 'en',
    targetLanguageCode: targetLocale,
  };

  // Run request
  const [response] = await translationClient.translateText(request);

  return response.translations[0].translatedText;
  // for (const translation of response.translations) {
  //   console.log(`Translation: ${translation.translatedText}`);
  // }
};

const setTranslation = function setTranslation(key = '', trans = '', targetLocale = '', isMachine = true){
  if (!key || !trans || !targetLocale) {
    throw `Invalid arguments: ${[...arguments]}`;
  }
  json[key] = json[key] || {
    machine: {},
    human: {}
  };
  json[key]['machine'][targetLocale] = json[key]['machine'][targetLocale] || trans;
};

const lookupText = async function lookupText(text='', targetLocale=''){
    if (!text ) {
        console.warn(`Invalid text to translate: ${text}`);
        return text;
    }
    if (!targetLocale) {
        console.warn(`Invalid target locale: ${targetLocale}`);
        return text;
    }
    try {
      console.log(json.default[targetLocale].machine);
      return json.default[targetLocale].human[text];
    }
    catch (error){
      console.log(`Error looking up human translation`);
    }
    try {
      return json.default[targetLocale].machine[text];
    }
    catch (error) {
      console.log(`Error looking up machine translation`);
      const trans = await transateText(text, targetLocale);
      return trans;
    }
};


// console.log(lookupText(text, 'fr'));
// console.log(lookupText(text, 'pt-br'));



async function translateTemplate(){
   
  // for (const locale of settings.locales) {
  //   for (const text of titles) {
  //     console.log(`Looking up ${text} for ${locale}`);
  //     lookupText(text, locale);
  //   }
  // }
}

const main = async function forLoop() {
  const argv = yargs
  .usage('Usage: $0 --file [string]')
  .demandOption('file')
  .argv;
  const templateName = argv.file.match(/(.+)_template.json/)[1];
  console.log(templateName[1])
  console.log('Start');
  const jspTitles = JSONPath( { 
    path: '$..title', resultType: 'all', json: template
  });
  const translatedTemplate = {};
  for (const locale of settings.locales) {
    const localisedTemplate = JSON.parse(JSON.stringify(template));
    for await (const item of jspTitles) {
      const trans = await lookupText(item.value, locale);
      console.log(trans);
      jsonpointer.set(localisedTemplate, item.pointer, trans);
    }
    console.log(localisedTemplate);
    translatedTemplate[locale] = localisedTemplate;
    fs.writeFileSync(
      `./data/${templateName}_${locale}.json`,
      JSON.stringify(localisedTemplate, null, 4)
      );
  }

  console.log(translatedTemplate);

  // for (const locale of settings.locales) {
  //   for (const text of titles.slice(0,2)) {
  //     console.log(`Looking up ${text} for ${locale}`);
  //     await lookupText(text, locale);
  //   }
  // }

  console.log('End');
  console.log(json);
};

main();

