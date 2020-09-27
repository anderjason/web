import { Box2, Point2, Size2 } from "@anderjason/geometry";
import { Transform } from "../Transform";
export declare class Corners {
    static givenBox(box: Box2): Corners;
    static givenContainedPoints(points: Point2[]): Corners;
    static givenCornerPoints(leftTop: Point2, rightTop: Point2, rightBottom: Point2, leftBottom: Point2): Corners;
    static isEqual(a: Corners, b: Corners): boolean;
    readonly leftTop: Point2;
    readonly rightTop: Point2;
    readonly rightBottom: Point2;
    readonly leftBottom: Point2;
    private _size;
    private constructor();
    isEqual(other: Corners): boolean;
    isSizeEqual(other: Corners, fuzzy?: number): boolean;
    toSize(): Size2;
    withTransform(transform: Transform): Corners;
}
