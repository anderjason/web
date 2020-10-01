"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cornersGivenContainedPoints = void 0;
const __1 = require("..");
const GrahamScan_1 = require("./GrahamScan");
const util_1 = require("@anderjason/util");
const geometry_1 = require("@anderjason/geometry");
function cornersGivenContainedPoints(points) {
    const rectangles = getAllBoundingRectangles(points);
    let rectanglesWithArea = rectangles.map((rectangle) => {
        return {
            rectangle,
            area: getArea(rectangle),
        };
    });
    rectanglesWithArea = util_1.ArrayUtil.arrayWithOrderFromValue(rectanglesWithArea, (rwa) => {
        return rwa.area;
    }, "ascending");
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
    return __1.Corners.givenPoints([
        minimum[0],
        minimum[3],
        minimum[2],
        minimum[1],
    ]);
}
exports.cornersGivenContainedPoints = cornersGivenContainedPoints;
function getAllBoundingRectangles(points) {
    const rectangles = [];
    const gs = new GrahamScan_1.GrahamScan();
    const convexHull = gs.getConvexHull(points);
    const I = new Caliper(convexHull, getIndex(convexHull, "rightTop"), 90);
    const J = new Caliper(convexHull, getIndex(convexHull, "leftTop"), 180);
    const K = new Caliper(convexHull, getIndex(convexHull, "leftBottom"), 270);
    const L = new Caliper(convexHull, getIndex(convexHull, "rightBottom"), 0);
    while (L.currentAngle < 90.0) {
        const rect = [
            L.getIntersection(I),
            I.getIntersection(J),
            J.getIntersection(K),
            K.getIntersection(L),
        ];
        rectangles.push(rect);
        const smallestTheta = getSmallestTheta(I, J, K, L);
        I.rotateBy(smallestTheta);
        J.rotateBy(smallestTheta);
        K.rotateBy(smallestTheta);
        L.rotateBy(smallestTheta);
    }
    return rectangles;
}
function getArea(rectangle) {
    const deltaXAB = rectangle[0].x - rectangle[1].x;
    const deltaYAB = rectangle[0].y - rectangle[1].y;
    const deltaXBC = rectangle[1].x - rectangle[2].x;
    const deltaYBC = rectangle[1].y - rectangle[2].y;
    const lengthAB = Math.sqrt(deltaXAB * deltaXAB + deltaYAB * deltaYAB);
    const lengthBC = Math.sqrt(deltaXBC * deltaXBC + deltaYBC * deltaYBC);
    return lengthAB * lengthBC;
}
function getIndex(convexHull, corner) {
    let index = 0;
    let point = convexHull[index];
    for (let i = 1; i < convexHull.length - 1; i++) {
        let temp = convexHull[i];
        let change = false;
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
function getSmallestTheta(I, J, K, L) {
    const thetaI = I.getDeltaAngleNextPoint();
    const thetaJ = J.getDeltaAngleNextPoint();
    const thetaK = K.getDeltaAngleNextPoint();
    const thetaL = L.getDeltaAngleNextPoint();
    if (thetaI <= thetaJ && thetaI <= thetaK && thetaI <= thetaL) {
        return thetaI;
    }
    else if (thetaJ <= thetaK && thetaJ <= thetaL) {
        return thetaJ;
    }
    else if (thetaK <= thetaL) {
        return thetaK;
    }
    else {
        return thetaL;
    }
}
class Caliper {
    constructor(convexHull, pointIndex, currentAngle) {
        this.convexHull = convexHull;
        this.pointIndex = pointIndex;
        this.currentAngle = currentAngle;
    }
    getAngleNextPoint() {
        const p1 = this.convexHull[this.pointIndex];
        const p2 = this.convexHull[(this.pointIndex + 1) % this.convexHull.length];
        const deltaX = p2.x - p1.x;
        const deltaY = p2.y - p1.y;
        const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
        return angle < 0 ? 360 + angle : angle;
    }
    getConstant() {
        const p = this.convexHull[this.pointIndex];
        return p.y - this.getSlope() * p.x;
    }
    getDeltaAngleNextPoint() {
        let angle = this.getAngleNextPoint();
        if (angle === this.currentAngle) {
            return 90; // ?
        }
        if (angle < 0) {
            angle = 360 + angle - this.currentAngle;
        }
        else {
            angle -= this.currentAngle;
        }
        return angle < 0 ? 360 : angle;
    }
    getIntersection(that) {
        // the x-intercept of 'this' and 'that': x = ((c2 - c1) / (m1 - m2))
        let x;
        // the y-intercept of 'this' and 'that', given 'x': (m*x) + c
        let y;
        if (this.isVertical()) {
            x = this.convexHull[this.pointIndex].x;
        }
        else if (this.isHorizontal()) {
            x = that.convexHull[that.pointIndex].x;
        }
        else {
            x =
                (that.getConstant() - this.getConstant()) /
                    (this.getSlope() - that.getSlope());
        }
        if (this.isVertical()) {
            y = that.getConstant();
        }
        else if (this.isHorizontal()) {
            y = this.getConstant();
        }
        else {
            y = this.getSlope() * x + this.getConstant();
        }
        return geometry_1.Point2.givenXY(Math.round(x), Math.round(y));
    }
    getSlope() {
        return Math.tan(geometry_1.Rotation.givenDegrees(this.currentAngle).radians);
    }
    isHorizontal() {
        return (Math.abs(this.currentAngle) < Caliper.SIGMA ||
            Math.abs(this.currentAngle - 180.0) < Caliper.SIGMA);
    }
    isVertical() {
        return (Math.abs(this.currentAngle - 90.0) < Caliper.SIGMA ||
            Math.abs(this.currentAngle - 270.0) < Caliper.SIGMA);
    }
    rotateBy(angle) {
        if (this.getDeltaAngleNextPoint() == angle) {
            this.pointIndex++;
        }
        this.currentAngle = (this.currentAngle + angle) % 360;
    }
}
Caliper.SIGMA = 0.00000000001;
//# sourceMappingURL=cornersGivenContainedPoints.js.map