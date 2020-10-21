import {VariableType} from './EVariableType';
import {Observation} from './Observation';
import {VariableInterpretation} from './VariableInterpretation';

export interface IVariable {
    type: VariableType;
    interpret(this: IVariable, obs: Observation ): VariableInterpretation;
}