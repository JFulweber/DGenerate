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

export function GenerateState(gs: GeneratorSettings): DGenerateState {
    return new DGenerateState(gs);
}

const templateRegex = new RegExp(/\${(.*?)}/);

export class DGenerateState {
    variableMap: Map<String, IVariable>;
    combinedMap: Map<String, String>;
    inputMap: Map<String, Observation>;
    constructor(settings: GeneratorSettings) {
        let { observations, variable_definitions_json_arr} = settings;
        let combinedJson = {}
        console.log("Pre for loop")
        for(var vdefObj of variable_definitions_json_arr){
            console.log(vdefObj);
            mergeJSON(combinedJson, vdefObj);
        }
        console.log("COMBINED JSON!");
        console.log(combinedJson);
        /* need to:
            put all vdef into their respective variable types
            then, interpret all observations
            put the results keyed by fully qualified names into state
        */
        let state: Map<String, IVariable> = new Map<String, IVariable>();
        if (!combinedJson.variables) {
            return null;
        }
        let { variables: vdef } = combinedJson;
        RecursiveDescender(vdef, "", state, (e) => e.type != null, CreateVariableInstance);
        this.variableMap = state;
    }

    getIVariable(name: String): IVariable {
        return this.variableMap.get(name);
    }

    getObservation(name: String): Observation {
        return this.inputMap.get(name);
    }

    getInterpreted(name: String): String {
        return this.combinedMap.get(name);
    }

    getInputMap(json_input) {
        /*
            need to:
                get json input into fully qualified observation map
                from the input -> template -> into combined state
        */
        let InputState: Map<String, Observation> = new Map<String, Observation>();
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

    combine(): Map<String, String> {
        let combinedMap = new Map<String, String>();
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

    replaceText(template_text: String): String {
        let out: String;
        /*
            need to:
                find all occurances of 'template-text'
                CURRENTLY template text will be in the form of ${<variable name>}
                need to stream text?
                when we find the starting characters, look for the rest of them?
        */
        let previous = null;
        while(previous != template_text){
            previous = template_text;
            template_text = template_text.replace(templateRegex, (match, group, e, f, g) => {
                return this.combinedMap.get(group).description;
            })
        }
        out = template_text;
        return out;
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

function RecursiveDescender(input, qualified_name: String, state: Map<string, any>, compareFunc, successFunc) {
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
            RecursiveDescender(input[section_name], `${qualified_name}${qualified_name != "" ? "." : ""}${section_name}`, state, compareFunc, successFunc);
        }
    }
}

function mergeJSON (target, add) {
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