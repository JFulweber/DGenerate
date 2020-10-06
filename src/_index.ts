import { exit } from "process";
import DocmaGen from "./types/DocmaGen";
const fs = require('fs');
const path = require('path');
const {argv} = require('yargs')

console.log(argv);

if(!argv){
    console.error("MISSING ARGS");
    exit(-1);
}
if(!argv.cfg){
    console.error("MISSING CFG FILE");
    exit(-1);
}
if(!argv.input){
    console.error("MISSING INPUT FILE");
    exit(-1);
}

let {cfg,input} = argv;

let cfgJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,cfg)));
let inputJson = JSON.parse(fs.readFileSync(path.resolve(__dirname,input)));

/*
    need to:
    apply the input onto the config
    then generate the output from the new object
*/

/**
 * @typedef {Object} VariableInfo
 * @property {Object} interpretation_cutoffs
 * @property {Number} std_dev
 * @property {Number} mean
 * @property {String} description 
 */

/**
 * 
 * @param {Number} value 
 * @param {VariableInfo} info 
 */
function get_interpretation(value, info){
    console.log(value);
    console.log(info);
    // linear search through keys to figure out where we lie between
    let last = Number.MIN_SAFE_INTEGER;
    const ic = info.interpretation_cutoffs;
    let upperbound = null;
    // need to go backwards
    for(var interp of ic){
        let current = Number(interp.value);
        console.log(k,value,last);
        if(value>last && value<current){
            upperbound = last;
            break;
        }
        last = current;
    }
    if (!upperbound){
        if(value>last) upperbound = last;
        if(value<info.interpretation_cutoffs[0].value) upperbound=info.interpretation_cutoffs[0].value;
    }
    if(upperbound < ic[0].value || upperbound > ic[ic.length-1].value){
        return {
            
        }
    }
}

console.log(inputJson);

let OUTPUT = {};
for (var test in inputJson.tests){
    OUTPUT[test] = {};
    let testInfo = inputJson.tests[test];
    let current = OUTPUT[test];
    for (var k in cfgJson.variables){
        let defVar = cfgJson.variables[k];
        let observedVar = testInfo.variables[k]; 
        let interpretation = get_interpretation(observedVar, defVar);
        current[k] = {};
        current[k].value = testInfo;
        // current[k].std_dev = 
    }
}

DocmaGen.interpret = function(obs, variable){
    return 
}
