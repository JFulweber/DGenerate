import { TemplatedVariable } from './TemplatedVariable';
import { GeneratorSettings } from './GeneratorSettings';

import { IVariable } from './IVariable';

import { UnparsedConditions, UnparsedVariableJson } from './UnparsedVariableJson';

import { NumericConditionalVariable } from './NumericConditionalVariable';
import { NumericConstVariable } from './NumericConstVariable';
import { StringConditionalVariable } from './StringConditionalVariable';
import { StringConstVariable } from './StringConstVariable';
import { inspect } from 'util';
import { VariableInterpretation } from './VariableInterpretation';
import { Observation } from './Observation';
import { throws } from 'assert';
import { TestInfo } from './TestInfo';
import { exception } from 'console';
import {saveAs} from 'file-saver';
import fs from 'fs';
import { JSONArr } from './JSONArr';
import { VariableStore } from './VariableStore';

const Docxtemplater = require('docxtemplater');
const DocxMerger = require('docx-merger');
// const fs = require('fs');
const PizZip = require('pizzip');

export function GenerateState(gs: GeneratorSettings): DGenerateState {
    return new DGenerateState(gs);
}

const templateRegex = new RegExp(/{(.*?)}/);

export class DGenerateState {
    variableMap: Map<string, IVariable>;
    combinedMap: Map<string, string>;
    inputMap: Map<string, Observation>;
    observation_json: Object[];
    observation_map: Map<string,any>;
    template_files: string[];
    output_name: string;
    testInfo_array: TestInfo[];
    constructor(settings: GeneratorSettings) {
        let { observation_json, observation_map, variable_definitions_json_arr, template_files, output_name } = settings;
        variable_definitions_json_arr = variable_definitions_json_arr.map(v=>Object.assign({},v));
        this.template_files = template_files;
        this.output_name = output_name;
        this.testInfo_array = [];
        let combinedJson = new JSONArr();
        for (var vdefName in variable_definitions_json_arr) {
            let vdefObj = variable_definitions_json_arr[vdefName];
            if (vdefObj.testInfo) {
                let testInfo = new TestInfo();
                testInfo.summary = vdefObj.testInfo.summary;
                testInfo.testName = vdefObj.testInfo.testName;
                testInfo.qualified_name = vdefObj.testInfo.qualified_name;
                this.testInfo_array.push(testInfo);
            }
            mergeJSON(combinedJson, vdefObj);
        }
        /* need to:
            put all vdef into their respective variable types
            then, interpret all observations
            put the results keyed by fully qualified names into state
        */
        let state: Map<string, IVariable> = new Map<string, IVariable>();
        if (!combinedJson.variables) {
            return null;
        }
        let { variables: vdef } = combinedJson;
        RecursiveDescender(vdef, "", state, (e) => true && e.type, CreateVariableInstance);
        this.variableMap = state;
        if(observation_json)
            this.observation_json = observation_json;
        else if(observation_map){
            this.observation_map = observation_map;
        }
        else{
            throw new Error("Missing observation map and observation json, are you running this with invalid/incorrect/missing input?")
        }
    }

    getIVariable(name: string): IVariable {
        return this.variableMap.get(name);
    }

    getObservation(name: string): Observation {
        return this.inputMap.get(name);
    }

    getInterpreted(name: string): string {
        return this.combinedMap.get(name);
    }

    getInputMap(json_input) {
        /*
            need to:
                get json input into fully qualified observation map
                from the input -> template -> into combined state
        */
        let InputState: Map<string, Observation> = new Map<string, Observation>();
        RecursiveDescender(json_input, "", InputState, (e) => typeof (e) == "string" || typeof (e) == "number", (e) => {
            let obs = new Observation();
            obs.value = e;
            return obs;
        });
        this.inputMap = InputState;
        return InputState;
    }

    checkInputAgainstDefinition(): Boolean {
        if (!this.variableMap || !this.inputMap) return false;
        for (let [k, v] of this.inputMap) {
            if (!this.getIVariable(k)) {
                throw new Error(`[MAPPING] Missing variable ${k} in VariableMap`)
                return false;
            };
        }
        return true;
    }

    combine(): Map<string, string> {
        let combinedMap = new Map<string, string>();
        for (var [k, v] of this.inputMap) {
            let obs = v;
            let IVar = this.getIVariable(k);
            combinedMap.set(k, IVar.interpret(obs).description);
        }
        this.combinedMap = combinedMap;
        return combinedMap;
    }

    evaluateDependents() {
        for (var [k, v] of this.variableMap) {
            if (v.dependents_str != null && v.dependents_str.length != 0) {
                let varInterp = this.combinedMap.get(k);
                for (var dep_str of v.dependents_str) {
                    /*
                        need to:
                            get VariableInterpretation
                            then, get the value of that,
                            and use it with dep_IVar.interpret(VariableInterpretation.value)
                    */
                    let dep_IVar = this.getIVariable(dep_str);
                    let obs = new Observation();
                    obs.value = varInterp;
                    this.combinedMap.set(dep_str, dep_IVar.interpret(obs).description);
                }
            }
        }
    }

    replaceText(template_text: string): string {
        let out: string;
        /*
            need to:
                find all occurances of 'template-text'
                CURRENTLY template text will be in the form of ${<variable name>}
                need to stream text?
                when we find the starting characters, look for the rest of them?
        */
        let previous = null;
        while (previous != template_text) {
            previous = template_text;
            template_text = template_text.replace(templateRegex, (match, group, e, f, g) => {
                return this.combinedMap.get(group);
            })
        }
        out = template_text;
        return out;
    }

    run(): any {
        if(this.observation_json)
            this.getInputMap(this.observation_json);
        else{
            this.inputMap=this.observation_map;
        }
        this.checkInputAgainstDefinition();
        this.combine();
        this.evaluateDependents();
        let testInfoArr: TestInfo[] = this.testInfo_array.map(e => {
            return {
                testName: e.testName,
                summary: this.replaceText(e.summary),
                date: this.combinedMap.get(e.qualified_name + ".date"),
                qualified_name: e.qualified_name
            }
        });
        let obj: VariableStore = Array.from(this.combinedMap).reduce((obj: any, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
        obj.testInfoArr = testInfoArr;
        var merged = new DocxMerger({pageBreak: false}, this.template_files);
        let hasOutputName = this.output_name || false;
        let buf = null;
        merged.save('nodebuffer', (data) => {
            // fs.writeFileSync("output/merged.docx", data);
            var zip = PizZip(data);
            // var zip = PizZip(this.template_files[0]);
            try {
                let docx = new Docxtemplater(zip);
                docx.setData(obj);
                docx.render();
                buf = docx.getZip().generate({ type: 'nodebuffer',                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
                if(hasOutputName){
                    fs.writeFileSync(this.output_name, buf);
                }
                else{
                    return;
                }                             }
            catch (e) {
                if (e.properties && e.properties.errors) {
                    e.properties.errors.forEach(element => {
                        throw element;
                    });
                }
            }
        })
        return buf;
    }
}

function CreateVariableInstance(jsonInput: UnparsedVariableJson): IVariable {
    let out: IVariable = null;
    switch (jsonInput.type) {
        case "NUMERIC_COND":
            out = new NumericConditionalVariable(jsonInput);
            break;
        case "NUMERIC_CONST":
            out = new NumericConstVariable(jsonInput);
            break;
        case "STRING_COND":
            out = new StringConditionalVariable(jsonInput);
            break;
        case "STRING_CONST":
            out = new StringConstVariable(jsonInput);
            break;
    }
    return out;
}

function RecursiveDescender(input, qualified_name: string, state: Map<string, any>, compareFunc, successFunc) {
    /*
        need to:
            look for variables in the children
            if there are any, then what?
            they need to be in the object structure of what is given, but parsed?
            we are trying to return state as interpreted variable array, where interpretedvariable
    */
    if (compareFunc(input)) {
        state.set(qualified_name, successFunc(input));
    }
    else {
        for (var section_name in input) {
            if(section_name!="testInfo")
                RecursiveDescender(input[section_name], `${qualified_name}${qualified_name != "" ? "." : ""}${section_name}`, state, compareFunc, successFunc);
        }
    }
}

function mergeJSON(target, add) {
    function isObject(obj) {
        if (typeof obj == "object") {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return true; // search for first object prop
                }
            }
        }
        return false;
    }
    for (var key in add) {
        if (add.hasOwnProperty(key)) {
            if (target[key] && isObject(target[key]) && isObject(add[key])) {
                mergeJSON(target[key], add[key]);
            } else {
                target[key] = add[key];
            }
        }
    }
    return target;
};