const fs = require('fs');
const path = require('path');
const {argv} = require('yargs')

console.log(argv);

if(!argv){
    return console.error("MISSING ARGS");
}
if(!argv.cfg){
    return console.error("MISSING CFG FILE");
}
if(!argv.input){
    return console.error("MISSING INPUT FILE");
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

}

let OUTPUT = {};
for (var test in inputJson.tests){
    OUTPUT[test] = {};
    let testInfo = inputJson.tests[test];
    let current = OUTPUT[test];
    for (var k in cfgJson.variables){
        let defVar = cfgJson.variables[k];
        let observedVar = inputJson.variables[k]; 
        let interpretation = get_interpretation(observedVar, defVar);
        current[k] = {};
        current[k].value = testInfo;
        current[k].std_dev = 
    }
}
