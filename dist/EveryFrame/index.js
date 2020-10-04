"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EveryFrame = void 0;
const skytree_1 = require("skytree");
class EveryFrame extends skytree_1.Actor {
    onActivate() {
        let frameNumber = 0;
        const nextFrame = () => {
            if (this.isActive.value === false) {
                return;
            }
            frameNumber += 1;
            this.props.callback(frameNumber);
            requestAnimationFrame(nextFrame);
        };
        requestAnimationFrame(nextFrame);
    }
}
exports.EveryFrame = EveryFrame;
//# sourceMappingURL=index.js.map