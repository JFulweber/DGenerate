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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DGenerateState = exports.GenerateState = void 0;
var NumericConditionalVariable_1 = require("./NumericConditionalVariable");
var NumericConstVariable_1 = require("./NumericConstVariable");
var StringConditionalVariable_1 = require("./StringConditionalVariable");
var StringConstVariable_1 = require("./StringConstVariable");
var Observation_1 = require("./Observation");
var TestInfo_1 = require("./TestInfo");
var fs_1 = __importDefault(require("fs"));
var JSONArr_1 = require("./JSONArr");
var Docxtemplater = require('docxtemplater');
var DocxMerger = require('docx-merger');
// const fs = require('fs');
var PizZip = require('pizzip');
function GenerateState(gs) {
    return new DGenerateState(gs);
}
exports.GenerateState = GenerateState;
var templateRegex = new RegExp(/{(.*?)}/);
function cloneObj(obj, deep) {
    if (deep === void 0) { deep = false; }
    var result = {};
    for (var key in obj) {
        if (deep && obj[key] instanceof Object) {
            if (obj[key] instanceof Array) {
                result[key] = [];
                obj[key].forEach(function (item) {
                    if (item instanceof Object) {
                        result[key].push(cloneObj(item, true));
                    }
                    else {
                        result[key].push(item);
                    }
                });
            }
            else {
                result[key] = cloneObj(obj[key]);
            }
        }
        else {
            result[key] = obj[key];
        }
    }
    return result;
}
var DGenerateState = /** @class */ (function () {
    function DGenerateState(settings) {
        var observation_json = settings.observation_json, observation_map = settings.observation_map, variable_definitions_json_arr = settings.variable_definitions_json_arr, template_files = settings.template_files, output_name = settings.output_name;
        variable_definitions_json_arr = variable_definitions_json_arr.map(function (v) { return cloneObj(v, true); });
        this.template_files = template_files;
        this.output_name = output_name;
        this.testInfo_array = [];
        var combinedJson = new JSONArr_1.JSONArr();
        for (var vdefName in variable_definitions_json_arr) {
            var vdefObj = Object.assign({}, variable_definitions_json_arr[vdefName]);
            if (vdefObj.testInfo) {
                var testInfo = new TestInfo_1.TestInfo();
                testInfo.summary = vdefObj.testInfo.summary;
                testInfo.testName = vdefObj.testInfo.testName;
                testInfo.qualified_name = vdefObj.testInfo.qualified_name;
                this.testInfo_array.push(testInfo);
            }
            console.log(this.testInfo_array);
            mergeJSON(combinedJson, vdefObj);
        }
        /* need to:
            put all vdef into their respective variable types
            then, interpret all observations
            put the results keyed by fully qualified names into state
        */
        var state = new Map();
        if (!combinedJson.variables) {
            return null;
        }
        var vdef = combinedJson.variables;
        RecursiveDescender(vdef, "", state, function (e) { return true && e.type; }, CreateVariableInstance);
        this.variableMap = state;
        if (observation_json)
            this.observation_json = observation_json;
        else if (observation_map) {
            this.observation_map = observation_map;
        }
        else {
            throw new Error("Missing observation map and observation json, are you running this with invalid/incorrect/missing input?");
        }
    }
    DGenerateState.prototype.getIVariable = function (name) {
        return this.variableMap.get(name);
    };
    DGenerateState.prototype.getObservation = function (name) {
        return this.inputMap.get(name);
    };
    DGenerateState.prototype.getInterpreted = function (name) {
        return this.combinedMap.get(name);
    };
    DGenerateState.prototype.getInputMap = function (json_input) {
        /*
            need to:
                get json input into fully qualified observation map
                from the input -> template -> into combined state
        */
        var InputState = new Map();
        RecursiveDescender(json_input, "", InputState, function (e) { return typeof (e) == "string" || typeof (e) == "number"; }, function (e) {
            var obs = new Observation_1.Observation();
            obs.value = e;
            return obs;
        });
        this.inputMap = InputState;
        return InputState;
    };
    DGenerateState.prototype.checkInputAgainstDefinition = function () {
        var e_1, _a;
        if (!this.variableMap || !this.inputMap)
            return false;
        try {
            for (var _b = __values(this.inputMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), k = _d[0], v = _d[1];
                if (!this.getIVariable(k)) {
                    throw new Error("[MAPPING] Missing variable " + k + " in VariableMap");
                    return false;
                }
                ;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    DGenerateState.prototype.combine = function () {
        var e_2, _a;
        var combinedMap = new Map();
        try {
            for (var _b = __values(this.inputMap), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), k = _d[0], v = _d[1];
                var obs = v;
                var IVar = this.getIVariable(k);
                combinedMap.set(k, IVar.interpret(obs).description);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.combinedMap = combinedMap;
        return combinedMap;
    };
    DGenerateState.prototype.evaluateDependents = function () {
        var e_3, _a, e_4, _b;
        try {
            for (var _c = __values(this.variableMap), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), k = _e[0], v = _e[1];
                if (v.dependents_str != null && v.dependents_str.length != 0) {
                    var varInterp = this.combinedMap.get(k);
                    try {
                        for (var _f = (e_4 = void 0, __values(v.dependents_str)), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var dep_str = _g.value;
                            /*
                                need to:
                                    get VariableInterpretation
                                    then, get the value of that,
                                    and use it with dep_IVar.interpret(VariableInterpretation.value)
                            */
                            var dep_IVar = this.getIVariable(dep_str);
                            var obs = new Observation_1.Observation();
                            obs.value = varInterp;
                            this.combinedMap.set(dep_str, dep_IVar.interpret(obs).description);
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    DGenerateState.prototype.replaceText = function (template_text) {
        var _this = this;
        var out;
        /*
            need to:
                find all occurances of 'template-text'
                CURRENTLY template text will be in the form of ${<variable name>}
                need to stream text?
                when we find the starting characters, look for the rest of them?
        */
        var previous = null;
        while (previous != template_text) {
            previous = template_text;
            template_text = template_text.replace(templateRegex, function (match, group, e, f, g) {
                return _this.combinedMap.get(group);
            });
        }
        out = template_text;
        return out;
    };
    DGenerateState.prototype.run = function () {
        var _this = this;
        if (this.observation_json)
            this.getInputMap(this.observation_json);
        else {
            this.inputMap = this.observation_map;
        }
        this.checkInputAgainstDefinition();
        this.combine();
        this.evaluateDependents();
        var testInfoArr = this.testInfo_array.map(function (e) {
            return {
                testName: e.testName,
                summary: _this.replaceText(e.summary),
                date: _this.combinedMap.get(e.qualified_name + ".date"),
                qualified_name: e.qualified_name
            };
        });
        console.log('===testInfoArr===');
        console.log(testInfoArr);
        testInfoArr = testInfoArr.filter(function (e) { return e.summary != undefined; });
        var obj = Array.from(this.combinedMap).reduce(function (obj, _a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            obj[key] = value;
            return obj;
        }, {});
        obj.testInfo = testInfoArr;
        console.log('templatefiles', this.template_files);
        var merged = new DocxMerger({ pageBreak: false }, this.template_files);
        var hasOutputName = this.output_name || false;
        var buf = null;
        merged.save('nodebuffer', function (data) {
            // fs.writeFileSync("output/merged.docx", data);
            var zip = PizZip(data);
            // var zip = PizZip(this.template_files[0]);
            try {
                var docx = new Docxtemplater(zip);
                docx.setData(obj);
                docx.render();
                buf = docx.getZip().generate({ type: 'nodebuffer', mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
                if (hasOutputName) {
                    fs_1.default.writeFileSync(_this.output_name, buf);
                }
                else {
                    return;
                }
            }
            catch (e) {
                if (e.properties && e.properties.errors) {
                    e.properties.errors.forEach(function (element) {
                        throw element;
                    });
                }
            }
        });
        return buf;
    };
    return DGenerateState;
}());
exports.DGenerateState = DGenerateState;
function CreateVariableInstance(jsonInput) {
    var out = null;
    switch (jsonInput.type) {
        case "NUMERIC_COND":
            out = new NumericConditionalVariable_1.NumericConditionalVariable(jsonInput);
            break;
        case "NUMERIC_CONST":
            out = new NumericConstVariable_1.NumericConstVariable(jsonInput);
            break;
        case "STRING_COND":
            out = new StringConditionalVariable_1.StringConditionalVariable(jsonInput);
            break;
        case "STRING_CONST":
            out = new StringConstVariable_1.StringConstVariable(jsonInput);
            break;
    }
    return out;
}
function RecursiveDescender(input, qualified_name, state, compareFunc, successFunc) {
    /*
        need to:
            look for variables in the children
            if there are any, then what?
            they need to be in the object structure of what is given, but parsed?
            we are trying to return state as interpreted variable array, where interpretedvariable
    */
    if (compareFunc(input)) {
        state.set(qualified_name, successFunc(input));
    }
    else {
        for (var section_name in input) {
            if (section_name != "testInfo")
                RecursiveDescender(input[section_name], "" + qualified_name + (qualified_name != "" ? "." : "") + section_name, state, compareFunc, successFunc);
        }
    }
}
function mergeJSON(target, add) {
    function isObject(obj) {
        if (typeof obj == "object") {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return true; // search for first object prop
                }
            }
        }
        return false;
    }
    for (var key in add) {
        if (add.hasOwnProperty(key)) {
            if (target[key] && isObject(target[key]) && isObject(add[key])) {
                mergeJSON(target[key], add[key]);
            }
            else {
                target[key] = add[key];
            }
        }
    }
    return target;
}
;
//# sourceMappingURL=DGenerateState.js.map