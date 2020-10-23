import { IVariable } from './IVariable';
import { VariableConditional } from './VariableConditional';
import { VariableType } from './EVariableType';
import { Observation } from './Observation';
import { VariableInterpretation } from './VariableInterpretation';
import { ApplyTemplate } from './Template';


export class NumericConditionalVariable implements IVariable {
    values: VariableConditional[];
    type: VariableType = VariableType.COND;
    json: any;
    dependents_str: String[];
    dependents: IVariable[];
    constructor(json_input) {
        this.json = json_input;
        let { values, dependents } = json_input;
        this.values = values;
        this.dependents_str = dependents;
    }


    interpret(obs: Observation): VariableInterpretation {
        /*
            need to:
            figure out where the value of observation lies *above*
            i.e. 0-10, score is 5, 5>0 5<10 -> 5 is bt 0-10.
            we must look ahead or look behind.
        */
        let result_cond: VariableConditional;
        if (obs.value < this.values[0].key) {
            return { description: this.values[0].value }
        }
        for (let i = 0; i < this.values.length - 1; i++) {
            let current = this.values[i];
            let next = this.values[i + 1];
            if (obs.value >= current.key && obs.value < next.key) {
                result_cond = current;
                return { description: result_cond.value }
            }
        }
        if (obs.value >= this.values[this.values.length - 1].key) {
            return { description: this.values[this.values.length - 1].value }
        }
        return null;
    }
}