"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringConditionalVariable = void 0;
var EVariableType_1 = require("./EVariableType");
var StringConditionalVariable = /** @class */ (function () {
    function StringConditionalVariable(json_input) {
        this.type = EVariableType_1.VariableType.COND;
        this.json = json_input;
        var values = json_input.values, dependents = json_input.dependents;
        this.values = values;
        this.dependents_str = dependents;
    }
    StringConditionalVariable.prototype.interpret = function (obs) {
        var e_1, _a;
        try {
            for (var _b = __values(this.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                var value = _c.value;
                if (value.key == obs.value) {
                    return { description: value.value };
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return { description: null };
    };
    return StringConditionalVariable;
}());
exports.StringConditionalVariable = StringConditionalVariable;
//# sourceMappingURL=StringConditionalVariable.js.map