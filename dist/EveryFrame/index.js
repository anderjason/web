"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EveryFrame = void 0;
const skytree_1 = require("skytree");
class EveryFrame extends skytree_1.Actor {
    constructor() {
        super(...arguments);
        this.frameNumber = 0;
    }
    onActivate() {
        const nextFrame = () => {
            if (this.isActive === false) {
                return;
            }
            this.frameNumber += 1;
            this.props.fn(this.frameNumber);
            requestAnimationFrame(nextFrame);
        };
        requestAnimationFrame(nextFrame);
    }
}
exports.EveryFrame = EveryFrame;
//# sourceMappingURL=index.js.map