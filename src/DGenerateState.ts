import {TemplatedVariable} from './TemplatedVariable';
import {GeneratorSettings} from './GeneratorSettings';

import { IVariable } from './IVariable';

import {UnparsedConditions, UnparsedVariableJson} from './UnparsedVariableJson';

import {NumericConditionalVariable} from './NumericConditionalVariable';
import {NumericConstVariable} from './NumericConstVariable';
import {StringConditionalVariable} from './StringConditionalVariable';
import {StringConstVariable} from './StringConstVariable';
import {inspect} from 'util';

export function GenerateState(gs:GeneratorSettings): DGenerateState{
    return new DGenerateState(gs);
}

export class DGenerateState{
    state: Map<String, IVariable>;
    constructor(settings:GeneratorSettings){
        let { observations, variable_definitions_json: vdef_json } = settings;
        /* need to:
            put all vdef into their respective variable types
            then, interpret all observations
            put the results keyed by fully qualified names into state
        */
        let state:Map<String, IVariable> = new Map<String,IVariable>();
        if (!vdef_json.variables) {
            return null;
        }
        let { variables: vdef } = vdef_json;
        // for (var v in vdef) {
        //     // need to recursively parse? i am unsure right now!
        //     // if the property does not have values/keys and is cond, it is a parent property/division
        //     // need to check for children: if there are children, then what? 
        //     CreateVariableInstance(vdef);
        // }
        // console.log("VDEF ====")
        // console.log(inspect(vdef,{showHidden: false, depth: null}));
        // console.log("END VDEF ===")
        RecursiveCheck(vdef, "", state);
        console.log(state);
        return null;   
    }
}

function CreateVariableInstance(jsonInput: UnparsedVariableJson):IVariable{
    let out:IVariable = null;
    switch(jsonInput.type){
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

function RecursiveCheck(input, qualified_name:String, state:Map<String, IVariable>){
    /*
        need to:
            look for variables in the children
            if there are any, then what?
            they need to be in the object structure of what is given, but parsed?
            we are trying to return state as interpreted variable array, where interpretedvariable
    */
    if(input.type){
        // console.log(`Creating var with ${qualified_name}`);
        // console.log("Data for it is ...")
        // console.log(input);
        state.set(qualified_name, CreateVariableInstance(input));
    }
    else{
        for(var section_name in input){
            // console.log(`${qualified_name}${qualified_name!=""?".":""}${section_name}`)
            RecursiveCheck(input[section_name], `${qualified_name}${qualified_name!=""?".":""}${section_name}`, state);
        }
    }
}
