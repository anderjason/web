import { Point2 } from "@anderjason/geometry";
import { ArrayUtil } from "@anderjason/util";
import { Corners } from "..";
import { totalDistanceGivenPointArrays } from "./totalDistanceGivenPointArrays";

export function cornersWithAlignment(
  input: Corners,
  alignment: Corners
): Corners {
  const candidateArrayA = input.toPoints();
  const candidateArrayB = ArrayUtil.arrayWithLeftShift(candidateArrayA);
  const candidateArrayC = ArrayUtil.arrayWithLeftShift(candidateArrayB);
  const candidateArrayD = ArrayUtil.arrayWithLeftShift(candidateArrayC);
  const candidateArrayE = ArrayUtil.arrayWithReversedOrder(candidateArrayA);
  const candidateArrayF = ArrayUtil.arrayWithLeftShift(candidateArrayE);
  const candidateArrayG = ArrayUtil.arrayWithLeftShift(candidateArrayF);
  const candidateArrayH = ArrayUtil.arrayWithLeftShift(candidateArrayG);

  const targetArray = alignment.toPoints();

  const candidateArrays: Point2[][] = [
    candidateArrayA,
    candidateArrayB,
    candidateArrayC,
    candidateArrayD,
    candidateArrayE,
    candidateArrayF,
    candidateArrayG,
    candidateArrayH,
  ];

  const arraysWithDistance = candidateArrays.map((candidateArray) => {
    return {
      candidateArray,
      totalDistance: totalDistanceGivenPointArrays(candidateArray, targetArray),
    };
  });

  const sorted = ArrayUtil.arrayWithOrderFromValue(
    arraysWithDistance,
    (arrayWithDistance) => {
      return arrayWithDistance.totalDistance;
    },
    "ascending"
  );

  const bestCandidateArray: Point2[] = sorted[0].candidateArray;
  return Corners.givenPoints(bestCandidateArray);
}
