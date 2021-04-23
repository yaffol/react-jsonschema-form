#!/usr/bin/env python3

import glob, os, json, re

# files = os.listdir('./')
tFiles = glob.glob('translated_*.json')
tSchemas = {'locales': {}, 'defaultLocale': 'en'}

print(json.dumps(tFiles))

for filepath in tFiles:
    localeSearch = re.search('translated_(.*)\.json', filepath)
    try:
        locale = localeSearch.group(1)
    except Exception as e:
        logger.warning(e)
    with open(filepath) as json_file:
        data = json.load(json_file)
        tSchemas['locales'][locale] = {
            'data': data,
            'fileName': filepath
        }

json_out = json.dumps(tSchemas, indent=4, sort_keys=True)
print(json_out)
with open('manifest.json', 'w') as outfile:
    outfile.write(json_out)
