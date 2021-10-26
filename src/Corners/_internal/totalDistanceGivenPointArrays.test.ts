import { Point2 } from "@anderjason/geometry";
import { Test } from "@anderjason/tests";
import { totalDistanceGivenPointArrays } from "./totalDistanceGivenPointArrays";

Test.define("totalDistanceGivenPointArrays returns the expected result", () => {
  const a = [
    Point2.givenXY(0, 0),
    Point2.givenXY(100, 0),
    Point2.givenXY(200, 0),
  ];

  const b = [
    Point2.givenXY(0, 100),
    Point2.givenXY(100, 200),
    Point2.givenXY(200, 100),
  ];

  const actual = totalDistanceGivenPointArrays(a, b);
  const expected = 400;

  Test.assert(actual === expected, "actual is equal to expected");
});
