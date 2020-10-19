import { Actor } from "skytree";

export interface EveryFrameProps {
  callback: (frameNumber: number) => void;
}

export class EveryFrame extends Actor<EveryFrameProps> {
  frameNumber: number = 0;

  onActivate() {
    const nextFrame = () => {
      if (this.isActive.value === false) {
        return;
      }

      this.frameNumber += 1;
      this.props.callback(this.frameNumber);

      requestAnimationFrame(nextFrame);
    };

    requestAnimationFrame(nextFrame);
  }
}
