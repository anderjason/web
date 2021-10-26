"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectOfCurrentQueryString = void 0;
const objectGivenQueryString_1 = require("./objectGivenQueryString");
function objectOfCurrentQueryString() {
    if (typeof window === "undefined") {
        return {};
    }
    return (0, objectGivenQueryString_1.objectGivenQueryString)(window.location.search);
}
exports.objectOfCurrentQueryString = objectOfCurrentQueryString;
//# sourceMappingURL=objectOfCurrentQueryString.js.map