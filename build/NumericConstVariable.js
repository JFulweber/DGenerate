"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumericConstVariable = void 0;
var EVariableType_1 = require("./EVariableType");
var NumericConstVariable = /** @class */ (function () {
    function NumericConstVariable(json_input) {
        this.type = EVariableType_1.VariableType.CONST;
        this.json = json_input;
        var values = json_input.values, dependents = json_input.dependents;
        this.values = values;
        this.dependents_str = dependents;
    }
    NumericConstVariable.prototype.interpret = function (obs) {
        return { description: obs.value };
    };
    return NumericConstVariable;
}());
exports.NumericConstVariable = NumericConstVariable;
//# sourceMappingURL=NumericConstVariable.js.map