import { Test } from "@anderjason/tests";
import { Point2 } from "@anderjason/geometry";
import { Corners } from "../../Corners";
import { matrixTransformGivenCorners } from "./matrixTransformGivenCorners";

Test.define("matrixTransformGivenCorners returns the expected result", () => {
  const corners = Corners.givenPoints([
    Point2.givenXY(205, 105),
    Point2.givenXY(391, 103),
    Point2.givenXY(415, 304),
    Point2.givenXY(190, 290),
  ]);

  const size = corners.toSize();

  const actual = matrixTransformGivenCorners(corners, size);
  const expected = [
    0.7748212890681166,
    -0.04378486815561762,
    0,
    -0.0003307092727587088,
    -0.23995008636043447,
    0.7052864312454459,
    0,
    -0.0008559865698227502,
    0,
    0,
    1,
    0,
    205,
    105,
    0,
    1,
  ];

  Test.assertIsDeepEqual(actual, expected);
});
