# DGenerate [![Build Status](https://travis-ci.com/JFulweber/DGenerate.svg?branch=master)](https://travis-ci.com/JFulweber/DGenerate)
Docx templating system using a sophisticated JSON interface. This is WIP and not production ready.

# Simple, conditional-less example (in [example/simple_example/example.js](https://github.com/JFulweber/DGenerate/blob/master/example/simple_example/example.js))
```javascript
let {DGenerateState, GenerateState, GeneratorSettings} = require('DGenerate');
let fs = require('fs');
let templateDocx = fs.readFileSync('./template.docx');
let templateJson = JSON.parse(fs.readFileSync('./template.json'));
let observationJson = JSON.parse(fs.readFileSync('./observation.json'));
let state = new DGenerateState({observation_json: observationJson, variable_definitions_json_arr:[templateJson], template_files: [templateDocx], output_name:"output.docx"})
state.run();
```

# More complicated example with conditions
The example.js is the exact same code as above in this example, but the template has changed to account for conditions.
Make note of the following files: 
* [observation.json](https://github.com/JFulweber/DGenerate/blob/master/example/conditional_example/observation.json)
* [template.json](https://github.com/JFulweber/DGenerate/blob/master/example/conditional_example/template.json)  

>This is an example where the given gender will affect all the potential pronouns when applied. The gender is {demographics.gender} meaning that the corresponding pronouns are {demographics.pronouns.personal.upper}, {demographics.pronouns.possessive.upper} for example.

When running all these together, it outputs transformed text so that one can modify all pronouns based off a single gender throughout a document, or multiple documents.

>This is an example where the given gender will affect all the potential pronouns when applied. The gender is MALE meaning that the corresponding pronouns are He, His for example.
