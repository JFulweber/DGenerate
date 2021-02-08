"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyTemplate = void 0;
function ApplyTemplate(observation, variable) {
    var result = variable.interpret(observation);
    console.log(result);
    return null;
}
exports.ApplyTemplate = ApplyTemplate;
//# sourceMappingURL=Template.js.map