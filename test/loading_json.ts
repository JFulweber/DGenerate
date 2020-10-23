import { assert } from 'console';
import { exit } from 'process';
import { config, string } from 'yargs';
import DGenerate from '../src';
import { DGenerateState, GenerateState } from '../src/DGenerateState';
import { GeneratorSettings } from '../src/GeneratorSettings';
import { IVariable } from '../src/IVariable';
import { Observation } from '../src/Observation';
var yargs = require('yargs');
var {argv} = yargs;
var fs = require('fs');
var assert = require('assert');

if(!argv.input || !argv.config){
    console.error("REMEMBER TO DO -- --input=<input.json> --config=<config.json>!!!!");
    exit(-1);
}

let inputFile = fs.readFileSync("./"+argv.input);
let configFile = fs.readFileSync("./"+argv.config); 
let inputJson = JSON.parse(inputFile);
let configJson = JSON.parse(configFile);
let state: DGenerateState;

describe('GeneratorSettings', function(){
    describe('GenerateState', function(){
        it("Should do something!", ()=>{
            state = GenerateState({observations: inputJson, variable_definitions_json: configJson});
        })
    })
});

let num_obs: Observation;
let string_obs: Observation;

describe('Observation', function(){
    it("Should create a numeric observation given json", ()=>{
        let obs_json = inputJson.demographics;
        num_obs = new Observation();
        num_obs.variable_name = "age";
        num_obs.value = obs_json.age;
        assert(num_obs!=null);
    })
    it("Should create a string obs given json", ()=>{
        let obs_json = inputJson.demographics;
        string_obs = new Observation();
        string_obs.value = obs_json.gender;
        string_obs.variable_name = "gender";
        assert(string_obs!=null);
    })
})

describe('Interpretation', function(){
    describe('Interpret Consts', function(){
        describe("Numeric", function(){
            it("Should return obs.value", ()=>{
                let age = state.getIVariable("demographics.age");
                let result = age.interpret(num_obs);
                assert(result.description=="20");
            })
        })
        describe("String", function(){
            it("Should return obs.value", ()=>{
                let gender = state.getIVariable("demographics.gender");
                let result = gender.interpret(string_obs);
                assert(result.description=="FEMALE");
            })
        })
    })
    describe('Interpret Conditionals', function(){
        describe("Numeric", function(){
            it("Should return range from obs.value", ()=>{
                let fluid_reasoning = state.getIVariable("fluid_reasoning_interp");
                let result = fluid_reasoning.interpret({variable_name:"fluid_reasoning", value:20});
                assert(result.description=='average');
            })
        })
        describe("String", function(){
            it("Should return result of switch statement", ()=>{
                let pronouns = state.getIVariable("demographics.pronouns.personal.upper");
                let result = pronouns.interpret({variable_name:"pronouns", value:"MALE"});
            })
        })
    })
})

describe("Combining", ()=>{
    describe("Checking to see if input matches variables",()=>{
        it("Should generate input map", ()=>{
            state.getInputMap(inputJson);
            assert(state.inputMap!=null);
        })
        it("Check to see if all input maps have a corresponding variableMap", ()=>{
            assert(state.checkInputAgainstDefinition());
        })
        it("Should combine IVariables + Observations", ()=>{
            state.combine()
            for(var [k,v] of state.combinedMap){
                assert(v, `${k} null`)
                assert(v && v.description!=undefined,`${k} description undefined`);
            }
        })
        it("Should define dependents in CombinedState", ()=>{
            state.evaluateDependents();
        })
    })
})

describe("Text Replacement", ()=>{
    it("Should not replace un-templated text", ()=>{
        console.log(state.replaceText("hi my name jeff"));
    })
    it("Should replace templated text",()=>{
        console.log(state.replaceText(`\${demographics.name} is a student at \${demographics.school}. \${demographics.pronouns.possessive.upper} grades are \${fluid_reasoning_interp}.`))
    })
})