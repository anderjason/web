"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlGivenUrlLike = void 0;
const util_1 = require("@anderjason/util");
function urlGivenUrlLike(input, assumeHttps) {
    if (util_1.StringUtil.stringIsEmpty(input)) {
        return undefined;
    }
    if (input.startsWith("http://") || input.startsWith("https://")) {
        return input;
    }
    if (assumeHttps == true) {
        return `https://${input}`;
    }
    else {
        return `http://${input}`;
    }
}
exports.urlGivenUrlLike = urlGivenUrlLike;
//# sourceMappingURL=urlGivenUrlLike.js.map