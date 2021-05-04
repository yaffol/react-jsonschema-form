process.env['GOOGLE_APPLICATION_CREDENTIALS'] = "/home/patrick/contracting/crossref/jsonschema/yaffol-react-jsonschema-form/GoogleCloudKey_form-runner_MyServiceAccount.json"
// import * as json from './data/translations.json';
// import { TranslationServiceClient } from '@google-cloud/translate';
const json = require('./data/translations.json');
const settings = require('./data/settings.json');

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = '548695940743';
const location = 'global';
const text = 'Crossref Article Deposit';

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
        throw `Invalid text to translate: ${text}`;
    }
    if (!targetLocale) {
        throw `Invalid target locale: ${targetLocale}`;
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
      setTranslation(text, trans, targetLocale, true);
      console.log(json);
    }
};

console.log(json);

// console.log(lookupText(text, 'fr'));
// console.log(lookupText(text, 'pt-br'));

settings.locales.forEach(locale => {
  console.log(lookupText(text, locale));
});