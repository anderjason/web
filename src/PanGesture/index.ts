import { Vector2 } from "@anderjason/geometry/dist/Vector2";
import { Actor } from "skytree";
import { Pointer } from "../Pointer";

export type PanGestureHandler = (delta: Vector2) => void;

export interface PanGestureDefinition {
  onPan: PanGestureHandler;
}

export class PanGesture extends Actor<PanGestureDefinition> {
  onActivate() {
    this.cancelOnDeactivate(
      Pointer.instance.points.didChange.subscribe((points, lastPoints) => {
        const thisPoint = points.first;
        const lastPoint = lastPoints?.first;

        if (thisPoint == null || lastPoint == null) {
          return;
        }

        this.props.onPan(lastPoint.toVector(thisPoint));
      })
    );
  }
}
