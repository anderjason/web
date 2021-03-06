import { Actor } from "skytree";

export interface EveryFrameProps {
  fn: (frameNumber: number) => void;
}

export class EveryFrame extends Actor<EveryFrameProps> {
  frameNumber: number = 0;

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
