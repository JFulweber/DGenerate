"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumericConditionalVariable = void 0;
var EVariableType_1 = require("./EVariableType");
var NumericConditionalVariable = /** @class */ (function () {
    function NumericConditionalVariable(json_input) {
        this.type = EVariableType_1.VariableType.COND;
        this.json = json_input;
        var values = json_input.values, dependents = json_input.dependents;
        this.values = values;
        this.dependents_str = dependents;
    }
    NumericConditionalVariable.prototype.interpret = function (obs) {
        /*
            need to:
            figure out where the value of observation lies *above*
            i.e. 0-10, score is 5, 5>0 5<10 -> 5 is bt 0-10.
            we must look ahead or look behind.
        */
        var result_cond;
        if (obs.value < this.values[0].key) {
            return { description: this.values[0].value };
        }
        for (var i = 0; i < this.values.length - 1; i++) {
            var current = this.values[i];
            var next = this.values[i + 1];
            if (obs.value >= current.key && obs.value < next.key) {
                result_cond = current;
                return { description: result_cond.value };
            }
        }
        if (obs.value >= this.values[this.values.length - 1].key) {
            return { description: this.values[this.values.length - 1].value };
        }
        return null;
    };
    return NumericConditionalVariable;
}());
exports.NumericConditionalVariable = NumericConditionalVariable;
//# sourceMappingURL=NumericConditionalVariable.js.map