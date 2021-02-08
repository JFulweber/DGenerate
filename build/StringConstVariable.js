"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringConstVariable = void 0;
var EVariableType_1 = require("./EVariableType");
var StringConstVariable = /** @class */ (function () {
    function StringConstVariable(json_input) {
        this.type = EVariableType_1.VariableType.CONST;
        this.json = json_input;
        var value = json_input.value, dependents = json_input.dependents;
        this.value = value;
        this.dependents_str = dependents;
    }
    StringConstVariable.prototype.interpret = function (obs) {
        return { description: obs.value };
    };
    return StringConstVariable;
}());
exports.StringConstVariable = StringConstVariable;
//# sourceMappingURL=StringConstVariable.js.map