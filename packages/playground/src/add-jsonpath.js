const jsonpointer = require('json-pointer');
const jp = require('jsonpath')
const jpp = require('jsonpath-plus');
const fs = require('fs');


const dataPath = './data';
const distPath = './data/dist';
const ur_template = require(`${dataPath}/journal_article_ur.json`);

const result = jpp.JSONPath({
    path: '$..type^',
    resultType: 'all',
    json: ur_template
});

result.forEach(element => {
    jsonpointer.set(ur_template, `${element.pointer}/key`, element.pointer)
    jsonpointer.set(ur_template, `${element.pointer}/path`, element.path)
});

console.log(ur_template)

fs.writeFileSync(`${dataPath}/journal_article_ur_keyed.json`, JSON.stringify(ur_template, null, 4))

