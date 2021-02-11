import { assert } from 'console';
import Docxtemplater from 'docxtemplater';
import { exit } from 'process';
import DGenerate from '../src';
import { DGenerateState, GenerateState } from '../src/DGenerateState';
import { GeneratorSettings } from '../src/GeneratorSettings';
import { IVariable } from '../src/IVariable';
import { Observation } from '../src/Observation';
import * as fs from 'fs';
var DocxMerger = require('docx-merger');
var PizZip = require('pizzip');

var assert = require('assert');

let inputFilename = "full_folder/input.json";
let configFilenames = ["full_folder/demographics.json", "full_folder/ex_test1.json","full_folder/reading_comprehension.json"];
let configFiles = [];
for (var v of configFilenames) {
    configFiles.push(JSON.parse(fs.readFileSync(v)));
}

let inputFile = JSON.parse(fs.readFileSync(inputFilename));
let templateFiles = [];
templateFiles.push(fs.readFileSync("full_folder/header.docx"));
templateFiles.push(fs.readFileSync("full_folder/demographics.docx"));
templateFiles.push(fs.readFileSync("full_folder/test.docx"));
templateFiles.push(fs.readFileSync("full_folder/reading_comprehension.docx"));
templateFiles.push(fs.readFileSync("full_folder/summaries.docx"));

let state: DGenerateState;

describe('GeneratorSettings', function () {
    describe('GenerateState', function () {
        it("Should do something!", () => {
            state = GenerateState({ observation_json: inputFile, variable_definitions_json_arr: configFiles, template_files: templateFiles, output_name: "output/output.docx", observation_map:undefined });
        })
    })
});

let num_obs: Observation;
let string_obs: Observation;

describe('Observation', function () {
    it("Should create a numeric observation given json", () => {
        let obs_json = inputFile.demographics;
        num_obs = new Observation();
        num_obs.variable_name = "age";
        num_obs.value = obs_json.age;
        assert(num_obs != null);
    })
    it("Should create a string obs given json", () => {
        let obs_json = inputFile.demographics;
        string_obs = new Observation();
        string_obs.value = obs_json.gender;
        string_obs.variable_name = "gender";
        assert(string_obs != null);
    })
})

describe('Interpretation', function () {
    describe('Interpret Consts', function () {
        describe("Numeric", function () {
            it("Should return obs.value", () => {
                let age = state.getIVariable("demographics.age");
                let result = age.interpret(num_obs);
                assert(result.description == "20");
            })
        })
        describe("String", function () {
            it("Should return obs.value", () => {
                let gender = state.getIVariable("demographics.gender");
                let result = gender.interpret(string_obs);
                assert(result.description == "FEMALE");
            })
        })
    })
    describe('Interpret Conditionals', function () {
        describe("Numeric", function () {
            it("Should return range from obs.value", () => {
                let fluid_reasoning = state.getIVariable("fluid_reasoning.interp");
                let result = fluid_reasoning.interpret({value: 20 });
                assert(result.description == 'average');
            })
        })
        describe("String", function () {
            it("Should return result of switch statement", () => {
                let pronouns = state.getIVariable("demographics.pronouns.personal.upper");
                let result = pronouns.interpret({ variable_name: "pronouns", value: "MALE" });
            })
        })
    })
})

describe("Combining", () => {
    describe("Checking to see if input matches variables", () => {
        it("Should generate input map", () => {
            state.getInputMap(inputFile);
            assert(state.inputMap != null);
        })
        it("Check to see if all input maps have a corresponding variableMap", () => {
            assert(state.checkInputAgainstDefinition());
        })
        it("Should combine IVariables + Observations", () => {
            state.combine()
            for (var [k, v] of state.combinedMap) {
                assert(v, `${k} null`)
                assert(v, `${k} description undefined`);
            }
        })
        it("Should define dependents in CombinedState", () => {
            state.evaluateDependents();
        })
    })
})

describe("Text Replacement", () => {
    it("Should not replace un-templated text", () => {
        assert(state.replaceText("hi my name jeff")=="hi my name jeff");
    })
    it("Should replace templated text", () => {
        let text = `{demographics.name} is a student at {demographics.school}. {demographics.pronouns.possessive.upper} grades are {fluid_reasoning.interp}.`;
        let replacedText = state.replaceText(text);
        assert(replacedText=='Ava is a student at SCU. Her grades are low.',replacedText)
        
    })
})

describe("Docxtemplater file loading", () => {
    it("Outputs", () => {
        state.run();
        return true;
        // assert(fs.existsSync(state.output_name),`Output filename ${state.output_name} does not exist`);
    });
    it("Returns buffer when not given name",()=>{
        let new_state = GenerateState({ observation_json: inputFile, variable_definitions_json_arr: configFiles, template_files: templateFiles, output_name: undefined, observation_map:undefined });
        let buf = new_state.run();
        assert(buf!=null);
    })
})

