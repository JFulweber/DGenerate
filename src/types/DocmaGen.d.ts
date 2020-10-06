declare namespace DocmaGen {
    enum VariableType {
        STRING_CONST, NUMERIC_CONST, NUMERIC_CONDITIONAL, STRING_CONDITIONAL
    }

    class VariableConditional {
        value: any;
        templated_description: String;
    }

    interface IVariable {
        type: VariableType;
        conditional?: VariableConditional[];
        interpret(this:IVariable, obs:Observation): VariableInterpretation;
        /*
        TODO: need to allow for additional properties
        */
    }

    class VariableInterpretation {
        description: string;
    }
    /*
        if type is numeric_conditional, string_conditional
        we require conditional. we can enforce this in constructor?
    */
    class Observation {
        value: any;
        interpretation: VariableInterpretation;
    }
    class GeneratorSettings {
        template: string;
        variables: IVariable[];
        observations: Observation[];
    }
}