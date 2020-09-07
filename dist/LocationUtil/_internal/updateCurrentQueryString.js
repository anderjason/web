"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCurrentQueryString = void 0;
const objectOfCurrentQueryString_1 = require("./objectOfCurrentQueryString");
const queryStringGivenObject_1 = require("./queryStringGivenObject");
function updateCurrentQueryString(values) {
    if (values == null || Object.keys(values).length === 0) {
        return;
    }
    const previousValue = objectOfCurrentQueryString_1.objectOfCurrentQueryString();
    const allValues = Object.assign(Object.assign({}, previousValue), values);
    const newQueryString = queryStringGivenObject_1.queryStringGivenObject(allValues);
    window.history.replaceState(null, "", `${window.location.pathname}${newQueryString}`);
}
exports.updateCurrentQueryString = updateCurrentQueryString;
//# sourceMappingURL=updateCurrentQueryString.js.map