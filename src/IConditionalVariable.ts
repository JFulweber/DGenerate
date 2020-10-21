import {IVariable} from './IVariable';
import {VariableType} from './EVariableType';
import {VariableConditional} from './VariableConditional';

export interface IConditionalVariable extends IVariable{
    type: VariableType;
    values: VariableConditional[];
}