
#!/usr/bin/env python3

import argparse
import logging
import json
from google.cloud import translate
logger = logging.getLogger(__name__)

def translate_text(source="en-US", target="fr", text="Example Application", project_id="rosy-griffin-312113"):
    """Translating Text."""

    client = translate.TranslationServiceClient()

    location = "global"

    parent = f"projects/{project_id}/locations/{location}"

    # Detail on supported types can be found here:
    # https://cloud.google.com/translate/docs/supported-formats
    response = client.translate_text(
        request={
            "parent": parent,
            "contents": [text],
            "mime_type": "text/plain",  # mime types: text/plain, text/html
            "source_language_code": f"{source}",
            "target_language_code": f"{target}",
        }
    )

    return response.translations


def find(dict_var, key):
    for k, v in dict_var.items():   
        if k == key:
            if len(v) > 0:
                dict_var[k] = "XXX"
            yield v
        elif isinstance(v, dict):
            for id_val in find(v, key):
                yield id_val

def replace_item(obj, key, replace_value):
    for k, v in obj.items():
        if isinstance(v, dict):
            obj[k] = replace_item(v, key, replace_value)
    if key in obj:
        if len(obj[key]) >0:
            try:
                translation = translate_text(text=obj[key], target=ARGS.target)
                obj[key] = translation[0].translated_text

            except Exception as e:
                logger.warning(e)

    return obj

def main():
    schema = json.load(ARGS.file)
    replace_item(schema,"description", "XXX")
    replace_item(schema,"title", "XXX")
    print(json.dumps(schema,indent=4))





if __name__ == "__main__":

    logging.basicConfig(level=logging.WARNING)

    parser = argparse.ArgumentParser(
        description="Translate the titles and/or descriptions in a JSON-SCHEMA file"
    )
    parser.add_argument(
        "-v", "--verbose", help="print verbose output to console", action="store_true"
    )
    parser.add_argument(
        "-d", "--debug", help="turn on debug for asyncio", action="store_true"
    )

    parser.add_argument(
        "-s", "--source", help="source language", default="en-US"
    )
    parser.add_argument(
        "-t", "--target", help="target language", default="fr"
    )

    parser.add_argument(
        "-f", "--file", help="JSON-SCHEMA file to translate", type=argparse.FileType("r"),
        required=True,
    )




    ARGS = parser.parse_args()

    if ARGS.verbose:
        logging.getLogger().setLevel(logging.INFO)

    logger.info("Start")
    # translations = translate_text(source=ARGS.source, target=ARGS.target)
    # # Display the translation for each input text provided
    # for translation in translations:
    #     print("Translated text: {}".format(translation.translated_text))
    main()
    logger.info("Done")




