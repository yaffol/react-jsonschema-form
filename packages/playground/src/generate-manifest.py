#!/usr/bin/env python3

import glob, os, json, re, hashlib
import logging
from collections import OrderedDict

logger = logging.getLogger(__name__)
abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)
files = os.listdir('./')
dataPath = './data/'
distPath = './data/dist/'
templateFiles = glob.glob(f'{distPath}*_template_dereferenced.json')
tFiles = glob.glob(f'{distPath}*_template_translated_*.json')
tSchemas = {'templates': {}, 'locales': {}}
templateNames = []
templateHashes = {}

with open(f'{dataPath}settings.json') as settings_file:
    settings = json.load(settings_file)

tSchemas.update({'locales': settings['locales']})
tSchemas.update({'defaultLocale': settings['defaultLocale']})
tSchemas.update({'defaultTemplate': settings['defaultTemplate']})

for filePath in templateFiles:
    nameSearch = re.search(f'{distPath}(.*)_template_dereferenced\.json', filePath)
    try:
        name = nameSearch.group(1)
        templateNames.append(name)
    except Exception as e:
        logger.warning(e)
    with open(filePath, "rb") as templateFile:
        content = templateFile.read()
        md5 = hashlib.md5(content).hexdigest()
        templateHashes[name] = md5

for templateName in templateNames:
    uiSchemaFilePath = f"{dataPath}{templateName}_uischema.json"
    uiSchema = {}
    if (os.path.isfile(uiSchemaFilePath)):
        with open(uiSchemaFilePath) as uischema_json_file:
            try:
                uiSchema = json.load(uischema_json_file)
            except Exception as e:
                logger.warning(e)
    tSchemas['templates'][templateName] = {
        'locales': {},
        'uiSchema': uiSchema,
        'md5': templateHashes[templateName]
    }
    for filepath in tFiles:
        localeSearch = re.search(f"{distPath}{templateName}_template_translated_(.*).json", filepath)
        try:
            locale = localeSearch.group(1)
            with open(filepath) as json_file:
                data = json.load(json_file, object_pairs_hook=OrderedDict)
                tSchemas['templates'][templateName]['locales'][locale] = {
                    'data': data,
                    'schema': data,
                    'fileName': filepath
                }
        except Exception as e:
            logger.warning(e)

json_out = json.dumps(tSchemas, indent=4, sort_keys=False)

with open(f'{distPath}manifest.json', 'w') as outfile:
    outfile.write(json_out)
print('Wrote manifest.json to distPath')
