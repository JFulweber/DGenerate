import {IVariable} from './IVariable';
import {VariableType} from './EVariableType';
import {Observation} from './Observation';
import {VariableInterpretation} from './VariableInterpretation';
import { VariableConditional } from './VariableConditional';

export class NumericConstVariable implements IVariable {
    type: VariableType = VariableType.CONST;
    values: VariableConditional[];
    json: any;
    dependents_str: String[];
    dependents: IVariable[];

    constructor(json_input){
        this.json = json_input;
        let {values, dependents} = json_input;
        this.values = values;
        this.dependents_str = dependents;
    }

    interpret(obs: Observation): VariableInterpretation {
        return { description: obs.value };
    }
}