"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragHorizontal = void 0;
const skytree_1 = require("skytree");
class DragHorizontal extends skytree_1.Actor {
    onActivate() {
        let startMouseX = null;
        let startScrollX = null;
        let speed;
        this.cancelOnDeactivate(this.props.canvas.addManagedEventListener("pointerdown", (e) => {
            startMouseX = e.offsetX;
            startScrollX = this.props.scrollElement.scrollLeft;
            this.props.canvas.element.setPointerCapture(e.pointerId);
            const scrollWidth = this.props.scrollElement.scrollWidth;
            const trackLength = this.props.trackSize.value.width;
            speed = scrollWidth / trackLength;
            const thumb = this.props.thumb.value;
            const thumbLeft = thumb.toLeft();
            const thumbRight = thumb.toRight();
            const isThumbHit = (startMouseX > thumbLeft && startMouseX < thumbRight);
            if (!isThumbHit) {
                const percent = startMouseX / trackLength;
                const maxScroll = scrollWidth - this.props.scrollElement.offsetWidth;
                startScrollX = maxScroll * percent;
                this.props.scrollElement.scrollLeft = startScrollX;
            }
            e.preventDefault();
        }));
        this.cancelOnDeactivate(this.props.canvas.addManagedEventListener("pointermove", (e) => {
            if (startMouseX == null) {
                return;
            }
            const relativeMouseX = e.offsetX;
            const delta = relativeMouseX - startMouseX;
            this.props.scrollElement.scrollLeft = startScrollX + (delta * speed);
        }));
        this.cancelOnDeactivate(this.props.canvas.addManagedEventListener("pointerup", (e) => {
            startMouseX = null;
            this.props.canvas.element.releasePointerCapture(e.pointerId);
        }));
    }
}
exports.DragHorizontal = DragHorizontal;
//# sourceMappingURL=DragHorizontal.js.map