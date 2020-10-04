import { Point2 } from "@anderjason/geometry";

export function totalDistanceGivenPointArrays(
  a: Point2[],
  b: Point2[]
): number {
  if (a == null || b == null) {
    throw new Error("Two arrays are required");
  }

  if (a.length !== b.length) {
    throw new Error("Both arrays must be the same length");
  }

  let difference = 0;

  a.forEach((point, idx) => {
    difference += point.toDistance(b[idx]);
  });

  return difference;
}
