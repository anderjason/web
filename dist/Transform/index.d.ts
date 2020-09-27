import { Vector2, Size2, Point2, Rotation } from "@anderjason/geometry";
import { Corners } from "../Corners";
export declare type Matrix3D = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
export declare function matrix3dOfIdentity(): Matrix3D;
export declare class Transform {
    readonly matrix3d: Matrix3D;
    static readonly identity: Transform;
    static givenCssMatrixTransform(source: string): Transform;
    static givenMatrix3D(input: Matrix3D): Transform;
    static givenCornersAndSize(corners: Corners, size: Size2): Transform;
    static givenScale(scale: Size2): Transform;
    static givenPoints(source1: Point2, source2: Point2, destination1: Point2, destination2: Point2, rotate: boolean): Transform;
    static isEqual(a: Transform, b: Transform): boolean;
    private constructor();
    get is2d(): boolean;
    isEqual: (other: Transform) => boolean;
    toTranslation(): Point2;
    toCssTranslation(): string;
    toRotation(): Rotation;
    toCssRotation(): string;
    toScale(): Size2;
    toCssScale(): string;
    toSkewX(): Rotation;
    toSkewY(): Rotation;
    toCssSkew(): string;
    toCssMatrixTransform(): string;
    toCssCombinedTransform(): string;
    toTranslateVector(): Vector2;
    toVectors(): [Vector2, Vector2];
    toTransformedPoint(input: Point2): Point2;
    withCascade(other: Transform): Transform;
    withTranslation(point: Point2): Transform;
}
