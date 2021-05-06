#!/usr/bin/env python3

import glob, os, json, re
import logging

logger = logging.getLogger(__name__)
abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)
files = os.listdir('./')
templateFiles = glob.glob('*_template_dereferenced.json')
tFiles = glob.glob('*_template_translated_*.json')
tSchemas = {'templates': {}, 'locales': {}}
templateNames = []

with open('./settings.json') as settings_file:
    settings = json.load(settings_file)

tSchemas.update({'locales': settings['locales']})
tSchemas.update({'defaultLocale': settings['defaultLocale']})

# print(json.dumps(tFiles))

for filePath in templateFiles:
    nameSearch = re.search('(.*)_template_dereferenced\.json', filePath)
    try:
        name = nameSearch.group(1)
        templateNames.append(name)
    except Exception as e:
        logger.warning(e)

tSchemas.update({'defaultTemplate': templateNames[0]})

for templateName in templateNames:
    uiSchemaFilePath = f"{templateName}_uischema.json"
    uiSchema = {}
    if (os.path.isfile(uiSchemaFilePath)):
        with open(uiSchemaFilePath) as uischema_json_file:
            try:
                uiSchema = json.load(uischema_json_file)
            except Exception as e:
                logger.warning(e)
    tSchemas['templates'][templateName] = {
        'locales': {},
        'uiSchema': uiSchema
    }
    for filepath in tFiles:
        localeSearch = re.search(f"{templateName}_template_translated_(.*)\.json", filepath)
        try:
            locale = localeSearch.group(1)
            with open(filepath) as json_file:
                data = json.load(json_file)
                tSchemas['templates'][templateName]['locales'][locale] = {
                    'data': data,
                    'schema': data,
                    'fileName': filepath
                }
        except Exception as e:
            logger.warning(e)

# for filepath in tFiles:
#     localeSearch = re.search('.*_translated_(.*)\.json', filepath)
#     try:
#         locale = localeSearch.group(1)
#         with open(filepath) as json_file:
#             data = json.load(json_file)
#             tSchemas['locales'][locale] = {
#                 'data': data,
#                 'fileName': filepath
#             }
#     except Exception as e:
#         logger.warning(e)

json_out = json.dumps(tSchemas, indent=4, sort_keys=True)
# print(json_out)
with open('manifest.json', 'w') as outfile:
    outfile.write(json_out)
print('Wrote manifest.json')
