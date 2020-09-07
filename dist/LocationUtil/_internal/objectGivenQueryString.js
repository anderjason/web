"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectGivenQueryString = void 0;
const util_1 = require("@anderjason/util");
function objectGivenQueryString(queryString) {
    const result = {};
    if (util_1.StringUtil.stringIsEmpty(queryString)) {
        return result;
    }
    const text = queryString.trim().replace(/^[?#&]/, "");
    if (text.length == 0) {
        return result;
    }
    const parts = text.split("&");
    parts.forEach((part) => {
        const partText = part.replace(/\+/g, " ");
        const splitPart = partText.split("=");
        const key = decodeURIComponent(splitPart[0]);
        let val = decodeURIComponent(splitPart[1]);
        result[key] = val;
    });
    return result;
}
exports.objectGivenQueryString = objectGivenQueryString;
//# sourceMappingURL=objectGivenQueryString.js.map