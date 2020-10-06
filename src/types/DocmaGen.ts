namespace DocmaGen{

    function applyTemplate(obs:Observation, varCond:  VariableConditional): VariableInterpretation{
        /*
        need to make text replacement engine
        what sort of syntax do we want?
        how do we parse subproperties into description?
        todo!
        */

        /*
        first need to check for other properties on VariableConditional
        i.e. templated_description is a given
        what about the variables additional properties?
        realistically: the variable itself should have a templated description which
        gets populated by the fields generated by the VariableConditional        
        */

        return null;
    }

    class StringConditionalVariable implements IVariable{
        conditional: VariableConditional[];
        type: VariableType = VariableType.STRING_CONDITIONAL;
        
        constructor(conditional: VariableConditional[]){
            this.conditional = conditional;
        }

        interpret(obs: Observation): VariableInterpretation{
            // basically a dynamic switch case
            const indexedByValue = this.conditional.reduce((map, obj)=>{
                map[obj.value] = obj;
                return map; 
            }, {});
            if(indexedByValue[obs.value]){
                return indexedByValue[obs.value];
            }
            return {description:null};
        }
    }

    class NumericConditionalVariable implements IVariable{
        conditional: VariableConditional[];
        type: VariableType = VariableType.NUMERIC_CONDITIONAL;

        constructor(conditional: VariableConditional[]){
            this.conditional = conditional;
        }

        interpret(obs:Observation):VariableInterpretation{
            /*
                need to:
                figure out where the value of observation lies *above*
                i.e. 0-10, score is 5, 5>0 5<10 -> 5 is bt 0-10.
                we must look ahead or look behind.
            */
            let result_cond: VariableConditional;
            for(let i = 0; i<this.conditional.length-1; i++ ){
                let current = this.conditional[i];
                let next = this.conditional[i+1];
                if(obs.value > current.value && obs.value<next.value){
                    result_cond = current;
                    return result_cond;
                }
            }
            if(obs.value>this.conditional[this.conditional.length-1].value){
                return this.conditional[this.conditional.length-1];
            }
            return null;
        }
    }

    class StringConstVariable implements IVariable{
        type: VariableType = VariableType.STRING_CONST;

        interpret(obs:Observation):VariableInterpretation{
            return {description:obs.value};
        }
    }

    class NumericConstVariable implements IVariable{
        type: VariableType = VariableType.NUMERIC_CONST;

        interpret(obs:Observation):VariableInterpretation{
            return {description:obs.value};
        }
    }
}
