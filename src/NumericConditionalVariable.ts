import {IVariable} from './IVariable';
import {VariableConditional} from './VariableConditional';
import {VariableType} from './EVariableType';
import {Observation} from './Observation';
import {VariableInterpretation} from './VariableInterpretation';
import { ApplyTemplate } from './Template';


export class NumericConditionalVariable implements IVariable {
    values: VariableConditional[];
    type: VariableType = VariableType.COND;
    json: any;
    constructor(json_input) {
        this.json = json_input;
        let {values} = json_input;
        this.values = values;
    }

    interpret(obs: Observation): VariableInterpretation {
        /*
            need to:
            figure out where the value of observation lies *above*
            i.e. 0-10, score is 5, 5>0 5<10 -> 5 is bt 0-10.
            we must look ahead or look behind.
        */
        let result_cond: VariableConditional;
        for (let i = 0; i < this.conditional.length - 1; i++) {
            let current = this.conditional[i];
            let next = this.conditional[i + 1];
            if (obs.value > current.value && obs.value < next.value) {
                result_cond = current;
                return ApplyTemplate(obs, result_cond);
            }
        }
        if (obs.value > this.conditional[this.conditional.length - 1].value) {
            return ApplyTemplate(obs, this.conditional[this.conditional.length - 1]);
        }
        return null;
    }
}