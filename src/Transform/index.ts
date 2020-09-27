import { Vector2, Size2, Point2, Rotation } from "@anderjason/geometry";
import { Corners } from "../Corners";

import { matrixTransformGivenCorners } from "./_internal/matrixTransformGivenCorners";

type Vertex4 = [number, number, number, number];

export type Matrix3D = [
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

function vectorWithAppliedVectors(
  input: Vector2,
  a: Vector2,
  b: Vector2
): Vector2 {
  const vectorA = a.withMultipliedScalar(input.x);
  const vectorB = b.withMultipliedScalar(input.y);
  return vectorA.withAddedVector(vectorB);
}

export function matrix3dOfIdentity(): Matrix3D {
  let matrix = [];
  for (let i = 0; i < 16; i++) {
    i % 5 == 0 ? matrix.push(1) : matrix.push(0);
  }
  return matrix as Matrix3D;
}

function matrix3dGivenNumbers(source: number[]): Matrix3D {
  if (source == null) {
    return undefined;
  }

  if (source && source.constructor === Array) {
    let values = source
      .filter((value) => typeof value === "number")
      .filter((value) => !isNaN(value));

    if (source.length === 6 && values.length === 6) {
      let matrix = matrix3dOfIdentity();
      matrix[0] = values[0];
      matrix[1] = values[1];
      matrix[4] = values[2];
      matrix[5] = values[3];
      matrix[12] = values[4];
      matrix[13] = values[5];
      return matrix;
    } else if (source.length === 16 && values.length === 16) {
      return source as Matrix3D;
    }
  }

  throw new TypeError(
    `Expected a number[] with length 6 or 16, but got '${source}'`
  );
}

export class Transform {
  readonly matrix3d: Matrix3D;

  static readonly identity = new Transform([
    1,
    0,
    0,
    0,

    0,
    1,
    0,
    0,

    0,
    0,
    1,
    0,

    0,
    0,
    0,
    1,
  ]);

  static givenCssMatrixTransform(source: string): Transform {
    if (typeof source === "string") {
      let match = source.match(/matrix(3d)?\(([^)]+)\)/);
      if (match) {
        let raw = match[2].split(", ").map(parseFloat);
        const matrix3d = matrix3dGivenNumbers(raw);

        return new Transform(matrix3d);
      }
    }

    throw new Error(
      "Could not create Transform from CSS matrix transform string"
    );
  }

  static givenMatrix3D(input: Matrix3D): Transform {
    return new Transform(input);
  }

  static givenCornersAndSize(corners: Corners, size: Size2): Transform {
    const matrix3d = matrix3dGivenNumbers(
      matrixTransformGivenCorners(corners, size)
    );
    if (matrix3d == null) {
      return undefined;
    }

    return new Transform(matrix3d);
  }

  static givenScale(scale: Size2): Transform {
    return new Transform(
      matrix3dGivenNumbers([scale.width, 0, 0, scale.height, 0, 0])
    );
  }

  static givenPoints(
    source1: Point2,
    source2: Point2,
    destination1: Point2,
    destination2: Point2,
    rotate: boolean
  ) {
    const vSource1 = Vector2.givenPoint(source1);
    const vSource2 = Vector2.givenPoint(source2);
    const vDest1 = Vector2.givenPoint(destination1);
    const vDest2 = Vector2.givenPoint(destination2);

    // Source vector.
    const a = vSource2.withSubtractedVector(vSource1);
    // Destination vector.
    const b = vDest2.withSubtractedVector(vDest1);

    let x: number;
    let y: number;

    if (rotate) {
      const alen = a.toDotProduct(a);
      const sig = a.toDotProduct(b);
      const del = a.toCrossProduct(b);

      x = sig / alen;
      y = del / alen;
    } else {
      const alen = Math.sqrt(a.toDotProduct(a));
      const blen = Math.sqrt(a.toDotProduct(b));
      const scale = blen / alen;

      x = scale;
      y = 0;
    }

    const rotateScaleA = Vector2.givenXY(x, y);
    const rotateScaleB = Vector2.givenXY(-y, x);

    // Position of source1 if rotation is applied.
    const vectorA = rotateScaleA.withMultipliedScalar(vSource1.x);
    const vectorB = rotateScaleB.withMultipliedScalar(vSource1.y);
    const rs0 = vectorA.withAddedVector(vectorB);

    // Since d[0] = rs0 + t
    const t = vDest1.withSubtractedVector(rs0);

    const matrix: Matrix3D = [
      rotateScaleA.x,
      rotateScaleA.y,
      0,
      0,
      rotateScaleB.x,
      rotateScaleB.y,
      0,
      0,
      0,
      0,
      0,
      0,
      t.x,
      t.y,
      0,
      0,
    ];

    return new Transform(matrix);
  }

  static isEqual(a: Transform, b: Transform): boolean {
    if (a == null && b == null) {
      return true;
    }

    if (a == null || b == null) {
      return false;
    }

    return a.isEqual(b);
  }

  private constructor(matrix3d: Matrix3D) {
    if (matrix3d == null) {
      throw new Error("Matrix is required");
    }

    this.matrix3d = matrix3d;
  }

  get is2d(): boolean {
    return this.matrix3d[2] === 0 && this.matrix3d[3] === 0;
  }

  isEqual = (other: Transform): boolean => {
    if (other == null) {
      return false;
    }

    if (!(other instanceof Transform)) {
      return false;
    }

    return this.matrix3d.every((number, idx) => {
      return other.matrix3d[idx] === number;
    });
  };

  toTranslation(): Point2 {
    const e = this.matrix3d[12];
    const f = this.matrix3d[13];

    return Point2.givenXY(e, f);
  }

  toCssTranslation(): string {
    const translation = this.toTranslation();
    return `translate(${translation.x}px, ${translation.y}px)`;
  }

  toRotation(): Rotation {
    const a = this.matrix3d[0];
    const b = this.matrix3d[1];
    const c = this.matrix3d[4];
    const d = this.matrix3d[5];

    if (a != 0 || b != 0) {
      const r = Math.sqrt(a * a + b * b);
      const radians = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
      return Rotation.givenRadians(radians);
    } else if (c != 0 || d != 0) {
      const s = Math.sqrt(c * c + d * d);
      const radians =
        Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
      return Rotation.givenRadians(radians);
    } else {
      return Rotation.givenDegrees(0);
    }
  }

  toCssRotation(): string {
    const rotation = this.toRotation();
    return `rotate(${rotation.toDegrees()}deg)`;
  }

  toScale(): Size2 {
    const a = this.matrix3d[0];
    const b = this.matrix3d[1];
    const c = this.matrix3d[4];
    const d = this.matrix3d[5];

    const delta = a * d - b * c;

    if (a != 0 || b != 0) {
      const r = Math.sqrt(a * a + b * b);
      return Size2.givenWidthHeight(r, delta / r);
    } else if (c != 0 || d != 0) {
      const s = Math.sqrt(c * c + d * d);
      return Size2.givenWidthHeight(delta / s, s);
    } else {
      // a = b = c = d = 0
      return Size2.ofZero();
    }
  }

  toCssScale(): string {
    const scale = this.toScale();
    return `scale(${scale.width}, ${scale.height})`;
  }

  toSkewX(): Rotation {
    const a = this.matrix3d[0];
    const b = this.matrix3d[1];
    const c = this.matrix3d[4];
    const d = this.matrix3d[5];

    if (a != 0 || b != 0) {
      const r = Math.sqrt(a * a + b * b);
      const radians = Math.atan((a * c + b * d) / (r * r));
      return Rotation.givenRadians(radians);
    } else {
      return Rotation.ofZero();
    }
  }

  toSkewY(): Rotation {
    const a = this.matrix3d[0];
    const b = this.matrix3d[1];
    const c = this.matrix3d[4];
    const d = this.matrix3d[5];

    if (a != 0 || b != 0) {
      return Rotation.ofZero();
    } else if (c != 0 || d != 0) {
      const s = Math.sqrt(c * c + d * d);
      const radians = Math.atan((a * c + b * d) / (s * s));
      return Rotation.givenRadians(radians);
    } else {
      return Rotation.ofZero();
    }
  }

  toCssSkew(): string {
    const skewX = this.toSkewX();
    const skewY = this.toSkewY();
    return `skew(${skewX.toDegrees()}deg, ${skewY.toDegrees()}deg)`;
  }

  toCssMatrixTransform(): string {
    return `matrix3d(${this.matrix3d.join(", ")})`;
  }

  toCssCombinedTransform(): string {
    const parts = [
      this.toCssTranslation(),
      this.toCssRotation(),
      this.toCssScale(),
      this.toCssSkew(),
    ];

    return parts.join(" ");
  }

  toTranslateVector(): Vector2 {
    const e = this.matrix3d[12];
    const f = this.matrix3d[13];

    return Vector2.givenXY(e, f);
  }

  toVectors(): [Vector2, Vector2] {
    return [
      Vector2.givenXY(this.matrix3d[0], this.matrix3d[1]),
      Vector2.givenXY(this.matrix3d[4], this.matrix3d[5]),
    ];
  }

  toTransformedPoint(input: Point2): Point2 {
    const inVertex: Vertex4 = [input.x, input.y, 0, 1];
    const outVertex: Vertex4 = [0, 0, 0, 0];

    for (let col = 0; col < 4; ++col) {
      let sum = 0;

      for (let row = 0; row < 4; ++row) {
        sum += this.matrix3d[row * 4 + col] * inVertex[row];
      }

      outVertex[col] = sum;
    }

    for (let i = 0; i < 4; ++i) {
      outVertex[i] = outVertex[i] / outVertex[3];
    }

    return Point2.givenXY(outVertex[0], outVertex[1]);
  }

  withCascade(other: Transform): Transform {
    const [otherA, otherB] = other.toVectors();
    const [thisA, thisB] = this.toVectors();

    const resultA = vectorWithAppliedVectors(otherA, thisA, thisB);
    const resultB = vectorWithAppliedVectors(otherB, thisA, thisB);

    const resultC = vectorWithAppliedVectors(
      this.toTranslateVector(),
      otherA,
      otherB
    );

    const resultVector = other.toTranslateVector().withAddedVector(resultC);

    const newMatrix: Matrix3D = [...this.matrix3d];
    newMatrix[0] = resultA.x;
    newMatrix[1] = resultA.y;
    newMatrix[4] = resultB.x;
    newMatrix[5] = resultB.y;
    newMatrix[12] = resultVector.x;
    newMatrix[13] = resultVector.y;

    return new Transform(newMatrix);
  }

  withTranslation(point: Point2): Transform {
    const newMatrix: Matrix3D = [...this.matrix3d];

    newMatrix[12] = point.x;
    newMatrix[13] = point.y;

    return new Transform(newMatrix);
  }
}