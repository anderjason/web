import { Box2, Point2, Size2 } from "@anderjason/geometry";
import { Transform } from "../Transform";
import { cornersGivenContainedPoints } from "./_internal/cornersGivenContainedPoints";

export class Corners {
  static givenBox(box: Box2): Corners {
    return new Corners(
      box.toLeftTop(),
      box.toRightTop(),
      box.toRightBottom(),
      box.toLeftBottom()
    );
  }

  static givenContainedPoints(points: Point2[]): Corners {
    return cornersGivenContainedPoints(points);
  }

  static givenCornerPoints(
    leftTop: Point2,
    rightTop: Point2,
    rightBottom: Point2,
    leftBottom: Point2
  ): Corners {
    return new Corners(leftTop, rightTop, rightBottom, leftBottom);
  }

  static isEqual(a: Corners, b: Corners): boolean {
    if (a == null && b == null) {
      return true;
    }

    if (a == null || b == null) {
      return false;
    }

    return a.isEqual(b);
  }

  readonly leftTop: Point2;
  readonly rightTop: Point2;
  readonly rightBottom: Point2;
  readonly leftBottom: Point2;

  private _size: Size2;

  private constructor(
    leftTop: Point2,
    rightTop: Point2,
    rightBottom: Point2,
    leftBottom: Point2
  ) {
    this.leftTop = leftTop;
    this.rightTop = rightTop;
    this.rightBottom = rightBottom;
    this.leftBottom = leftBottom;
  }

  isEqual(other: Corners): boolean {
    if (other == null) {
      return false;
    }

    if (!(other instanceof Corners)) {
      return false;
    }

    return (
      this.leftTop.isEqual(other.leftTop) &&
      this.rightTop.isEqual(other.rightTop) &&
      this.rightBottom.isEqual(other.rightBottom) &&
      this.leftBottom.isEqual(other.leftBottom)
    );
  }

  isSizeEqual(other: Corners, fuzzy: number = 10): boolean {
    if (other == null) {
      throw new Error("other is required");
    }

    const otherSize = other.toSize();
    const thisSize = this.toSize();

    const differenceX = Math.abs(otherSize.width - thisSize.width);
    const differenceY = Math.abs(otherSize.height - thisSize.height);

    return differenceX < fuzzy && differenceY < fuzzy;
  }

  toSize(): Size2 {
    if (this._size == null) {
      const topWidth = this.leftTop.toDistance(this.rightTop);
      const bottomWidth = this.leftBottom.toDistance(this.rightBottom);
      const leftHeight = this.leftTop.toDistance(this.leftBottom);
      const rightHeight = this.rightTop.toDistance(this.rightBottom);
      const width = (topWidth + bottomWidth) / 2;
      const height = (leftHeight + rightHeight) / 2;

      this._size = Size2.givenWidthHeight(width, height);
    }

    return this._size;
  }

  withTransform(transform: Transform): Corners {
    if (transform == null) {
      throw new Error("transform is required");
    }

    const lt3 = transform.toTransformedPoint(this.leftTop);
    const rt3 = transform.toTransformedPoint(this.rightTop);
    const rb3 = transform.toTransformedPoint(this.rightBottom);
    const lb3 = transform.toTransformedPoint(this.leftBottom);

    return new Corners(
      Point2.givenXY(lt3.x, lt3.y),
      Point2.givenXY(rt3.x, rt3.y),
      Point2.givenXY(rb3.x, rb3.y),
      Point2.givenXY(lb3.x, lb3.y)
    );
  }
}