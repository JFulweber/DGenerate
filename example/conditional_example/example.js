let {DGenerateState, GenerateState, GeneratorSettings} = require('DGenerate');
let fs = require('fs');
let templateDocx = fs.readFileSync('./template.docx');
let templateJson = JSON.parse(fs.readFileSync('./template.json'));
let observationJson = JSON.parse(fs.readFileSync('./observation.json'));

let state = new DGenerateState({observation_json: observationJson, variable_definitions_json_arr:[templateJson], template_files: [templateDocx], output_name:"output.docx"})
state.run();