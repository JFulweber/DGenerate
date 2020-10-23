import {IVariable} from './IVariable';
import {VariableType} from './EVariableType';
import {Observation} from './Observation';
import {VariableInterpretation} from './VariableInterpretation';

export class StringConstVariable implements IVariable {
    type: VariableType = VariableType.CONST;
    value: String;
    json: any;
    dependents_str: String[];
    dependents: IVariable[];

    constructor(json_input){
        this.json = json_input;
        let {value, dependents} = json_input;
        this.value = value;
        this.dependents_str = dependents;
    }

    interpret(obs: Observation): VariableInterpretation {
        return { description: obs.value };
    }
}