import {IVariable} from './IVariable';
import {VariableType} from './EVariableType';
export interface IConstVariable extends IVariable{
    type: VariableType;
    value: any;
}
