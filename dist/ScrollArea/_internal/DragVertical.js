"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragVertical = void 0;
const skytree_1 = require("skytree");
class DragVertical extends skytree_1.Actor {
    onActivate() {
        let startMouseY = null;
        let startScrollY = null;
        let speed;
        this.cancelOnDeactivate(this.props.canvas.addManagedEventListener("touchmove", (e) => {
            e.preventDefault();
        }));
        this.cancelOnDeactivate(this.props.canvas.addManagedEventListener("pointerdown", (e) => {
            e.preventDefault();
            const thumb = this.props.thumb.value;
            if (thumb == null) {
                return;
            }
            startMouseY = e.offsetY;
            startScrollY = this.props.scrollElement.scrollTop;
            this.props.canvas.element.setPointerCapture(e.pointerId);
            const trackHeight = this.props.trackSize.value.height;
            const scrollHeight = this.props.scrollElement.scrollHeight;
            speed = scrollHeight / trackHeight;
            const thumbTop = thumb.toTop();
            const thumbBottom = thumb.toBottom();
            const isThumbHit = (startMouseY > thumbTop && startMouseY < thumbBottom);
            if (!isThumbHit) {
                const percent = startMouseY / trackHeight;
                const maxScroll = scrollHeight - this.props.scrollElement.offsetHeight;
                startScrollY = maxScroll * percent;
                this.props.scrollElement.scrollTop = startScrollY;
            }
        }));
        this.cancelOnDeactivate(this.props.canvas.addManagedEventListener("pointermove", (e) => {
            if (startMouseY == null) {
                return;
            }
            e.preventDefault();
            const relativeMouseY = e.offsetY;
            const delta = relativeMouseY - startMouseY;
            this.props.scrollElement.scrollTop = startScrollY + (delta * speed);
        }));
        this.cancelOnDeactivate(this.props.canvas.addManagedEventListener("pointerup", (e) => {
            startMouseY = null;
            this.props.canvas.element.releasePointerCapture(e.pointerId);
        }));
    }
}
exports.DragVertical = DragVertical;
//# sourceMappingURL=DragVertical.js.map