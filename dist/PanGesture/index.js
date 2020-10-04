"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanGesture = void 0;
const skytree_1 = require("skytree");
const Pointer_1 = require("../Pointer");
class PanGesture extends skytree_1.Actor {
    onActivate() {
        this.cancelOnDeactivate(Pointer_1.Pointer.instance.points.didChange.subscribe((points, lastPoints) => {
            const thisPoint = points.first;
            const lastPoint = lastPoints === null || lastPoints === void 0 ? void 0 : lastPoints.first;
            if (thisPoint == null || lastPoint == null) {
                return;
            }
            this.props.onPan(lastPoint.toVector(thisPoint));
        }));
    }
}
exports.PanGesture = PanGesture;
//# sourceMappingURL=index.js.map