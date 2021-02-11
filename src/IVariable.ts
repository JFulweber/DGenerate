import {VariableType} from './EVariableType';
import {Observation} from './Observation';
import {VariableInterpretation} from './VariableInterpretation';

export interface IVariable {
    type: VariableType;
    dependents_str: string[];
    dependents: IVariable[];
    interpret(this: IVariable, obs: Observation ): VariableInterpretation;
}