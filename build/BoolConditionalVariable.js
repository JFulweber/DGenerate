"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoolConditionalVariable = void 0;
var EVariableType_1 = require("./EVariableType");
var BoolConditionalVariable = /** @class */ (function () {
    function BoolConditionalVariable(json_input) {
        this.type = EVariableType_1.VariableType.COND;
        this.json = json_input;
        var values = json_input.values, dependents = json_input.dependents;
        this.values = values;
        this.dependents_str = dependents;
    }
    BoolConditionalVariable.prototype.interpret = function (obs) {
        if (obs.value === true || obs.value === 'true') {
            return { description: this.values[0].value };
        }
        else {
            return { description: this.values[1].value };
        }
    };
    return BoolConditionalVariable;
}());
exports.BoolConditionalVariable = BoolConditionalVariable;
//# sourceMappingURL=BoolConditionalVariable.js.map