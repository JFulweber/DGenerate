import {IVariable} from './IVariable';
import {VariableType} from './EVariableType';
import {Observation} from './Observation';
import {VariableInterpretation} from './VariableInterpretation';
import { VariableConditional } from './VariableConditional';

export class BoolConditionalVariable implements IVariable {
    type: VariableType = VariableType.COND;
    values: VariableConditional[];
    json: any;
    dependents_str: string[];
    dependents: IVariable[];

    constructor(json_input){
        this.json = json_input;
        let {values, dependents} = json_input;
        this.values = values;
        this.dependents_str = dependents;
    }

    interpret(obs: Observation): VariableInterpretation {
        if(obs.value===true || obs.value==='true'){
            return {description: this.values[0].value};
        }else{
            return {description: this.values[1].value};
        }
    }
}