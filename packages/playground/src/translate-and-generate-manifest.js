// process.env['GOOGLE_APPLICATION_CREDENTIALS'] = "/home/patrick/contracting/crossref/jsonschema/yaffol-react-jsonschema-form/GoogleCloudKey_form-runner_MyServiceAccount.json";
process.env['GOOGLE_APPLICATION_CREDENTIALS'] = "/creds/gcsa.json";
// import * as json from './data/translations.json';
// import { TranslationServiceClient } from '@google-cloud/translate';
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
const manifest = {
  templates: {},
  locales: settings.locales,
  defaultLocale: settings.defaultLocale,
  defaultTemplate: settings.defaultTemplate
};

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = '548695940743';
const location = 'global';

// Imports the Google Cloud Translation library
const { TranslationServiceClient } = require('@google-cloud/translate');
const { formatWithCursor } = require('prettier');

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
    console.warn(`Invalid arguments: ${[...arguments]}`);
  }
  translations[key] = translations[key] || {
    machine: {},
    human: {}
  };
  translations[key]['machine'][targetLocale] = translations[key]['machine'][targetLocale] || trans;
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
      console.log(`Error looking up human translation`);
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
      console.log(`Error looking up machine translation`);
      const trans = await transateText(text, targetLocale);
      setTranslation(text, trans, targetLocale);
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

const getTemplateFiles = function(format = 'raw'){
  switch (format){
    case 'raw':
      return glob.sync('*_template.json',{ cwd: dataPath });
    case 'dereferenced':
      return glob.sync('*_template_dereferenced.json',{ cwd: distPath });
  }
};

const getDerefencedTemplateFiles = function() {
  return getTemplateFiles('dereferenced');
};

const createPaths = function(){
  if (!fs.existsSync(distPath)){
    fs.mkdirSync(distPath);
  }

};

const main = async function() {
  const argv = await yargs
  .command('*', 'The default pipeline command', () => {}, async () => {
    console.log('this is a command');
    createPaths();
    await dereference();
    await translate();
    // translate();
  })
  .argv;
};

const dereference = async function() {
  const templateFiles = getTemplateFiles();
  for (const templateFile of templateFiles) {
    const template = require(`./data/${templateFile}`);
    const templateDerefed = await $RefParser.dereference(template);
    const templateName = templateFile.match(/(.+_template).json/)[1];
    // fs.writeFileSync(
    //   `${dataPath}/${templateName}_dereferenced.json`,
    //   JSON.stringify(templateDerefed, null, 4)
    //   );
    fs.writeFileSync(
      `${distPath}/${templateName}_dereferenced.json`,
      JSON.stringify(templateDerefed, null, 4)
      );
  }
};

const translate = async function forLoop() {
  // const argv = yargs
  // .usage('Usage: $0 --file [string]')
  // .demandOption('file')
  // .argv;
  const templateFiles = getTemplateFiles('dereferenced');
  for (const templateFile of templateFiles) {
    const template = require(`${distPath}/${templateFile}`);
    // const templateName = argv.file.match(/(.+)_template.json/)[1];
    const templateName = templateFile.match(/(.+_template)_dereferenced.json/)[1];

    console.log(templateName[1]);
    const translatedTemplate = {};
    for (const locale of settings.locales) {
      const localisedTemplate = JSON.parse(JSON.stringify(template));
      for (const field of transFields) {
        const jsonpathFields = JSONPath( {
          path: `$..${field}`, resultType: 'all', json: template
        });
        for await (const item of jsonpathFields) {
          const trans = await lookupText(item.value, locale);
          console.log(trans);
          jsonpointer.set(localisedTemplate, item.pointer, trans);
        }
      }
      translatedTemplate[locale] = {
        data: localisedTemplate
      };
      // fs.writeFileSync(
      //   `${dataPath}/${templateName}_translated_${locale}.json`,
      //   JSON.stringify(localisedTemplate, null, 4)
      //   );
      fs.writeFileSync(
        `${distPath}/${templateName}_translated_${locale}.json`,
        JSON.stringify(localisedTemplate, null, 4)
        );
    }
    manifest.templates[templateName] = {
      locales: translatedTemplate
    };
  }

  fs.writeFileSync(
    `${distPath}/manifest.json`,
    JSON.stringify(manifest, null, 4)
    );

  fs.writeFileSync(
    `${dataPath}/translations.json`,
    JSON.stringify(translations, null, 4)
    );


  // for (const locale of settings.locales) {
  //   for (const text of titles.slice(0,2)) {
  //     console.log(`Looking up ${text} for ${locale}`);
  //     await lookupText(text, locale);
  //   }
  // }

  console.log('End');
  console.log(translations);
};

main();

