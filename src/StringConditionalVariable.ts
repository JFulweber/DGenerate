import {IVariable} from './IVariable';
import {VariableConditional} from './VariableConditional';
import {VariableType} from './EVariableType';
import {Observation} from './Observation';
import {VariableInterpretation} from './VariableInterpretation';

export class StringConditionalVariable implements IVariable {
    values: VariableConditional[];
    type: VariableType = VariableType.COND;
    json: any;
    
    constructor(json_input) {
        this.json = json_input;
        let {values} = json_input;
        this.values = values;
    }

    interpret(obs: Observation): VariableInterpretation {
        // basically a dynamic switch case
        const indexedByValue = this.values.reduce((map, obj) => {
            map[obj.value] = obj;
            return map;
        }, {});
        if (indexedByValue[obs.value]) {
            return indexedByValue[obs.value];
        }
        return { description: null };
    }
}
