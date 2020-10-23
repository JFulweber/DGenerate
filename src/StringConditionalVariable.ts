import {IVariable} from './IVariable';
import {VariableConditional} from './VariableConditional';
import {VariableType} from './EVariableType';
import {Observation} from './Observation';
import {VariableInterpretation} from './VariableInterpretation';

export class StringConditionalVariable implements IVariable {
    values: VariableConditional[];
    type: VariableType = VariableType.COND;
    json: any;
    dependents_str: String[];
    dependents: IVariable[];

    constructor(json_input) {
        this.json = json_input;
        let {values, dependents} = json_input;
        this.values = values;
        this.dependents_str = dependents;
    }

    interpret(obs: Observation): VariableInterpretation {
        for(let value of this.values){
            if(value.key == obs.value){
                return {description: value.value};
            }
        }
        return {description: null};
    }
}
