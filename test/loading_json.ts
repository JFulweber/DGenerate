import { exit } from 'process';
import { config } from 'yargs';
import DGenerate from '../src';
import { GenerateState } from '../src/DGenerateState';
import { GeneratorSettings } from '../src/GeneratorSettings';
var yargs = require('yargs');
var {argv} = yargs;
var fs = require('fs');

if(!argv.input || !argv.config){
    console.error("REMEMBER TO DO -- --input=<input.json> --config=<config.json>!!!!");
    exit(-1);
}

let inputFile = fs.readFileSync("./"+argv.input);
let configFile = fs.readFileSync("./"+argv.config); 
let state;
describe('GeneratorSettings', function(){
    describe('GenerateState', function(){
        it("Should do something!", ()=>{
            let inputJson = JSON.parse(inputFile);
            let configJson = JSON.parse(configFile);
            state = GenerateState({observations: inputJson, variable_definitions_json: configJson});
        })
    })
});

describe('Interpretation', function(){
    describe('Interpret Consts', function(){
        describe("Numeric", function(){
            it("Should return obs.value", ()=>{

            })
        })
        describe("String", function(){
            it("Should return obs.value", ()=>{
                
            })
        })
    })
    describe('Interpret Conditionals', function(){
        describe("Numeric", function(){
            it("Should return range from obs.value", ()=>{

            })
        })
        describe("String", function(){
            it("Should return result of switch statement", ()=>{
                
            })
        })
    })
})