import { Test } from "@anderjason/tests";
import { Point2 } from "@anderjason/geometry";
import { cornersGivenContainedPoints } from "./cornersGivenContainedPoints";

Test.define("cornersGivenContainedPoints returns the expected result", () => {
  const points: Point2[] = [
    Point2.givenXY(-300, -150),
    Point2.givenXY(200, 200),
    Point2.givenXY(100, -100),
    Point2.givenXY(-400, 0),
  ];

  const actual = cornersGivenContainedPoints(points);
  // TODO
});
