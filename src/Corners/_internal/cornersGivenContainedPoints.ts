import { Corners } from "..";
import { GrahamScan } from "./GrahamScan";
import { ArrayUtil } from "@anderjason/util";
import { Point2, Rotation } from "@anderjason/geometry";

type CornerName = "leftTop" | "rightTop" | "rightBottom" | "leftBottom";
type Rectangle = [Point2, Point2, Point2, Point2];

interface RectangleWithArea {
  rectangle: Rectangle;
  area: number;
}

export function cornersGivenContainedPoints(points: Point2[]): Corners {
  const rectangles: Rectangle[] = getAllBoundingRectangles(points);

  let rectanglesWithArea: RectangleWithArea[] = rectangles.map((rectangle) => {
    return {
      rectangle,
      area: getArea(rectangle),
    };
  });

  rectanglesWithArea = ArrayUtil.arrayWithOrderFromValue(
    rectanglesWithArea,
    (rwa) => {
      return rwa.area;
    },
    "ascending"
  );

  let lastArea = 0;
  rectanglesWithArea = rectanglesWithArea.filter((rwa) => {
    // TODO I'm trying here to avoid the bounding box flickering between
    // different rectangle alternatives when dragging regions around.

    // This generally works, but still misses some cases. Increasing the threshold
    // number below might work, but there's probably a better way to handle this
    const isSignificantlyDifferent = rwa.area - lastArea > 2000;
    lastArea = rwa.area;

    return isSignificantlyDifferent;
  });

  const minimum = rectanglesWithArea[0].rectangle;

  return Corners.givenPoints([
    minimum[0], // left top
    minimum[3], // right top
    minimum[2], // right bottom
    minimum[1], // left bottom
  ]);
}

function getAllBoundingRectangles(points: Point2[]): Rectangle[] {
  const rectangles: Rectangle[] = [];

  const gs = new GrahamScan();
  const convexHull: Point2[] = gs.getConvexHull(points);

  const I = new Caliper(convexHull, getIndex(convexHull, "rightTop"), 90);
  const J = new Caliper(convexHull, getIndex(convexHull, "leftTop"), 180);
  const K = new Caliper(convexHull, getIndex(convexHull, "leftBottom"), 270);
  const L = new Caliper(convexHull, getIndex(convexHull, "rightBottom"), 0);

  while (L.currentAngle < 90.0) {
    const rect: Rectangle = [
      L.getIntersection(I),
      I.getIntersection(J),
      J.getIntersection(K),
      K.getIntersection(L),
    ];
    rectangles.push(rect);

    const smallestTheta: number = getSmallestTheta(I, J, K, L);

    I.rotateBy(smallestTheta);
    J.rotateBy(smallestTheta);
    K.rotateBy(smallestTheta);
    L.rotateBy(smallestTheta);
  }

  return rectangles;
}

function getArea(rectangle: Rectangle): number {
  const deltaXAB = rectangle[0].x - rectangle[1].x;
  const deltaYAB = rectangle[0].y - rectangle[1].y;

  const deltaXBC = rectangle[1].x - rectangle[2].x;
  const deltaYBC = rectangle[1].y - rectangle[2].y;

  const lengthAB = Math.sqrt(deltaXAB * deltaXAB + deltaYAB * deltaYAB);
  const lengthBC = Math.sqrt(deltaXBC * deltaXBC + deltaYBC * deltaYBC);

  return lengthAB * lengthBC;
}

function getIndex(convexHull: Point2[], corner: CornerName): number {
  let index: number = 0;
  let point: Point2 = convexHull[index];

  for (let i = 1; i < convexHull.length - 1; i++) {
    let temp: Point2 = convexHull[i];
    let change: boolean = false;

    switch (corner) {
      case "rightTop":
        change = temp.x > point.x || (temp.x == point.x && temp.y > point.y);
        break;
      case "leftTop":
        change = temp.y > point.y || (temp.y == point.y && temp.x < point.x);
        break;
      case "leftBottom":
        change = temp.x < point.x || (temp.x == point.x && temp.y < point.y);
        break;
      case "rightBottom":
        change = temp.y < point.y || (temp.y == point.y && temp.x > point.x);
        break;
      default:
        break;
    }

    if (change) {
      index = i;
      point = temp;
    }
  }

  return index;
}

function getSmallestTheta(
  I: Caliper,
  J: Caliper,
  K: Caliper,
  L: Caliper
): number {
  const thetaI: number = I.getDeltaAngleNextPoint();
  const thetaJ: number = J.getDeltaAngleNextPoint();
  const thetaK: number = K.getDeltaAngleNextPoint();
  const thetaL: number = L.getDeltaAngleNextPoint();

  if (thetaI <= thetaJ && thetaI <= thetaK && thetaI <= thetaL) {
    return thetaI;
  } else if (thetaJ <= thetaK && thetaJ <= thetaL) {
    return thetaJ;
  } else if (thetaK <= thetaL) {
    return thetaK;
  } else {
    return thetaL;
  }
}

class Caliper {
  static SIGMA = 0.00000000001;

  readonly convexHull: Point2[];
  pointIndex: number;
  currentAngle: number;

  constructor(convexHull: Point2[], pointIndex: number, currentAngle: number) {
    this.convexHull = convexHull;
    this.pointIndex = pointIndex;
    this.currentAngle = currentAngle;
  }

  getAngleNextPoint(): number {
    const p1: Point2 = this.convexHull[this.pointIndex];
    const p2: Point2 = this.convexHull[
      (this.pointIndex + 1) % this.convexHull.length
    ];

    const deltaX: number = p2.x - p1.x;
    const deltaY: number = p2.y - p1.y;

    const angle: number = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

    return angle < 0 ? 360 + angle : angle;
  }

  getConstant(): number {
    const p: Point2 = this.convexHull[this.pointIndex];

    return p.y - this.getSlope() * p.x;
  }

  getDeltaAngleNextPoint(): number {
    let angle: number = this.getAngleNextPoint();
    if (angle === this.currentAngle) {
      return 90; // ?
    }

    if (angle < 0) {
      angle = 360 + angle - this.currentAngle;
    } else {
      angle -= this.currentAngle;
    }

    return angle < 0 ? 360 : angle;
  }

  getIntersection(that: Caliper): Point2 {
    // the x-intercept of 'this' and 'that': x = ((c2 - c1) / (m1 - m2))
    let x: number;
    // the y-intercept of 'this' and 'that', given 'x': (m*x) + c
    let y: number;

    if (this.isVertical()) {
      x = this.convexHull[this.pointIndex].x;
    } else if (this.isHorizontal()) {
      x = that.convexHull[that.pointIndex].x;
    } else {
      x =
        (that.getConstant() - this.getConstant()) /
        (this.getSlope() - that.getSlope());
    }

    if (this.isVertical()) {
      y = that.getConstant();
    } else if (this.isHorizontal()) {
      y = this.getConstant();
    } else {
      y = this.getSlope() * x + this.getConstant();
    }

    return Point2.givenXY(Math.round(x), Math.round(y));
  }

  getSlope(): number {
    return Math.tan(Rotation.givenDegrees(this.currentAngle).radians);
  }

  isHorizontal(): boolean {
    return (
      Math.abs(this.currentAngle) < Caliper.SIGMA ||
      Math.abs(this.currentAngle - 180.0) < Caliper.SIGMA
    );
  }

  isVertical(): boolean {
    return (
      Math.abs(this.currentAngle - 90.0) < Caliper.SIGMA ||
      Math.abs(this.currentAngle - 270.0) < Caliper.SIGMA
    );
  }

  rotateBy(angle: number): void {
    if (this.getDeltaAngleNextPoint() == angle) {
      this.pointIndex++;
    }

    this.currentAngle = (this.currentAngle + angle) % 360;
  }
}
