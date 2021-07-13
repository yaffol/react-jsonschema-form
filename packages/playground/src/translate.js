// process.env['GOOGLE_APPLICATION_CREDENTIALS'] = "/creds/gcsa.json";
const fs = require('fs');
const glob = require('glob');
const yargs = require('yargs');
const { JSONPath } = require('jsonpath-plus');
const jsonpointer = require('jsonpointer');
const $RefParser = require("@apidevtools/json-schema-ref-parser");
const translations = require('./data/translations.json');
const settings = require('./data/settings.json');
const transFields = ['title', 'description'];
const dataPath = './data';
const distPath = './data/dist';

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = '548695940743';
const location = 'global';

// Imports the Google Cloud Translation library
const { TranslationServiceClient } = require('@google-cloud/translate');

const term = require('terminal-kit').terminal()

// Instantiates a client
const translationClient = new TranslationServiceClient();
const transateText = async function translateText(text = 'text to translate', targetLocale = 'fr') {
  if (!process.env['GOOGLE_APPLICATION_CREDENTIALS']) {

    // No GCLOUD API Creds available
    return;
  }

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
};

const setTranslation = function setTranslation(key = '', trans = '', targetLocale = '', isMachine = true){
  if (!key || !trans || !targetLocale) {
    // // console.warn(`Invalid arguments: ${[...arguments]}`);
  }
  translations[key] = translations[key] || {
    machine: {},
    human: {}
  };
  translations[key]['machine'][targetLocale] = translations[key]['machine'][targetLocale] || trans;
};

const lookupText = async function lookupText(text='', targetLocale=''){
    if (!text ) {
        // console.warn(`Invalid text to translate: ${text}`);
        return text;
    }
    if (!targetLocale) {
        // console.warn(`Invalid target locale: ${targetLocale}`);
        return text;
    }
    if (targetLocale === settings.defaultLocale){
      return text;
    }
    try {
      if (
        typeof translations[text]['human'][targetLocale] === 'string'
        && translations[text]['human'][targetLocale].length > 0
        ){
          return translations[text]['human'][targetLocale];
        }
        throw `Error looking up human translation`;
    }
    catch (error){
      // console.log(`Error looking up human translation`);
    }
    try {
      if (
        typeof translations[text]['machine'][targetLocale] === 'string'
        && translations[text]['machine'][targetLocale].length > 0
        ){
          return translations[text]['machine'][targetLocale];
        }
        throw `Error looking up human translation`;
    }
    catch (error) {
      // console.log(`Error looking up machine translation`);
      const trans = await transateText(text, targetLocale);
      if (trans){
        console.log(`Adding translation (${targetLocale}) ${text} => ${trans}...`)
        setTranslation(text, trans, targetLocale);
      }

      return trans;
    }
};

const getTemplateFiles = function(format = 'raw'){
  switch (format){
    case 'raw':
      return glob.sync('*_template.json',{ cwd: dataPath });
    case 'dereferenced':
      return glob.sync('*_template_dereferenced.json',{ cwd: distPath });
  }
};

const createPaths = function(){
  if (!fs.existsSync(distPath)){
    fs.mkdirSync(distPath);
  }

};

const main = async function() {
  const argv = await yargs
  .command('*', 'The default pipeline command', () => {}, async () => {
    console.log('Creating paths...');
    createPaths();
    console.log('Dereferencing templates...');
    await dereference();
    console.log(`Translating schemas to ${settings.locales}...`);
    await translate();
  })
  .argv;
};

const dereference = async function() {
  const templateFiles = getTemplateFiles();
  for (const templateFile of templateFiles) {
    const template = require(`./data/${templateFile}`);
    const templateDerefed = await $RefParser.dereference(template);
    delete templateDerefed.definitions;
    const templateName = templateFile.match(/(.+_template).json/)[1];
    fs.writeFileSync(
      `${distPath}/${templateName}_dereferenced.json`,
      JSON.stringify(templateDerefed, null, 4)
      );
  }
};

const translate = async function forLoop() {
  const templateFiles = getTemplateFiles('dereferenced');
  // console.log(`Translating to ${settings.locales}...`)
  for (const templateFile of templateFiles) {
    console.log(`Processing ${templateFile}...`)
    const template = require(`${distPath}/${templateFile}`);
    const templateName = templateFile.match(/(.+_template)_dereferenced.json/)[1];
    // console.log(templateName[1]);
    const translatedTemplate = {};
    for (const locale of settings.locales) {
      const localisedTemplate = JSON.parse(JSON.stringify(template));
      for (const field of transFields) {
        const jsonpathFields = JSONPath( {
          path: `$..${field}`, resultType: 'all', json: template
        });
        for await (const item of jsonpathFields) {
          const trans = await lookupText(item.value, locale);
          // console.log(trans);
          jsonpointer.set(localisedTemplate, item.pointer, trans);
        }
      }
      translatedTemplate[locale] = localisedTemplate;
      translatedTemplate[locale] = localisedTemplate;
      fs.writeFileSync(
        `${distPath}/${templateName}_translated_${locale}.json`,
        JSON.stringify(localisedTemplate, null, 4)
        );
    }
  }
  console.log(`Writing out translations...`);
  fs.writeFileSync(
    `${dataPath}/translations.json`,
    JSON.stringify(translations, null, 4)
    );

  // console.log('End');
  // console.log(translations);
};

main();

