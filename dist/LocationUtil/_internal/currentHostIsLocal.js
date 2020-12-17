"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentHostIsLocal = void 0;
function currentHostIsLocal() {
    if (typeof window === "undefined") {
        return false;
    }
    const { hostname } = window.location;
    return hostname === "localhost" || hostname.startsWith("192.");
}
exports.currentHostIsLocal = currentHostIsLocal;
//# sourceMappingURL=currentHostIsLocal.js.map