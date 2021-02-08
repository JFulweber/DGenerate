import { TemplatedVariable } from "./TemplatedVariable";
import { IVariable } from "./IVariable";
import { Observation } from "./Observation";
import { VariableConditional } from "./VariableConditional";
import { VariableInterpretation } from "./VariableInterpretation";

export function ApplyTemplate(observation: Observation, variable: IVariable): VariableInterpretation{
    let result = variable.interpret(observation);
    return null;
}