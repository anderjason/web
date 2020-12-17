import { Box2, Size2 } from "@anderjason/geometry";
import { Observable, ObservableBase } from "@anderjason/observable";
import { Actor } from "skytree";
import { ManagedElement } from "../..";

export interface DragVerticalProps {
  canvas: ManagedElement<HTMLCanvasElement>;
  trackSize: ObservableBase<Size2>;
  thumb: Observable<Box2>;
  scrollElement: HTMLElement;
}

export class DragVertical extends Actor<DragVerticalProps> {
  onActivate() {
    let startMouseY: number = null;
    let startScrollY: number = null;
    let speed: number;

    this.cancelOnDeactivate(
      this.props.canvas.addManagedEventListener("touchmove", (e) => {
        e.preventDefault();
      }
    ));
    
    this.cancelOnDeactivate(
      this.props.canvas.addManagedEventListener("pointerdown", (e) => {
        e.preventDefault();

        startMouseY = e.offsetY;
        startScrollY = this.props.scrollElement.scrollTop;

        this.props.canvas.element.setPointerCapture(e.pointerId);
        
        const trackHeight = this.props.trackSize.value.height;  
        const scrollHeight = this.props.scrollElement.scrollHeight;
        speed = scrollHeight / trackHeight;
        
        const thumb = this.props.thumb.value;
        const thumbTop = thumb.toTop();
        const thumbBottom = thumb.toBottom();
        const isThumbHit = (startMouseY > thumbTop && startMouseY < thumbBottom);

        if (!isThumbHit) {
          const percent = startMouseY / trackHeight;
          const maxScroll = scrollHeight - this.props.scrollElement.offsetHeight;
          startScrollY = maxScroll * percent;

          this.props.scrollElement.scrollTop = startScrollY;
        }
      })
    );

    this.cancelOnDeactivate(
      this.props.canvas.addManagedEventListener("pointermove", (e) => {
        if (startMouseY == null) {
          return;
        }

        e.preventDefault();
        
        const relativeMouseY = e.offsetY;
        const delta = relativeMouseY - startMouseY;
        
        this.props.scrollElement.scrollTop = startScrollY + (delta * speed);
      })
    );

    this.cancelOnDeactivate(
      this.props.canvas.addManagedEventListener("pointerup", (e) => {
        startMouseY = null;
        this.props.canvas.element.releasePointerCapture(e.pointerId);
      })
    )
  }
}