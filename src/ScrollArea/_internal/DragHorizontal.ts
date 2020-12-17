import { Box2, Size2 } from "@anderjason/geometry";
import { Observable, ObservableBase } from "@anderjason/observable";
import { Actor } from "skytree";
import { ManagedElement } from "../..";

export interface DragHorizontalProps {
  canvas: ManagedElement<HTMLCanvasElement>;
  trackSize: ObservableBase<Size2>;
  thumb: Observable<Box2>;
  scrollElement: HTMLElement;
}

export class DragHorizontal extends Actor<DragHorizontalProps> {
  onActivate() {
    let startMouseX: number = null;
    let startScrollX: number = null;
    let speed: number;

    
    this.cancelOnDeactivate(
      this.props.canvas.addManagedEventListener("touchmove", (e) => {
        e.preventDefault();
      }
    ));

    this.cancelOnDeactivate(
      this.props.canvas.addManagedEventListener("pointerdown", (e) => {
        e.preventDefault();

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
      })
    );

    this.cancelOnDeactivate(
      this.props.canvas.addManagedEventListener("pointermove", (e) => {
        if (startMouseX == null) {
          return;
        }
        
        e.preventDefault();

        const relativeMouseX = e.offsetX;
        const delta = relativeMouseX - startMouseX;
        
        this.props.scrollElement.scrollLeft = startScrollX + (delta * speed);
      })
    );

    this.cancelOnDeactivate(
      this.props.canvas.addManagedEventListener("pointerup", (e) => {
        startMouseX = null;
        this.props.canvas.element.releasePointerCapture(e.pointerId);
      })
    )
  }
}