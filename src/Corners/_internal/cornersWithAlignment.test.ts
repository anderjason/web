import { Point2 } from "@anderjason/geometry";
import { Test } from "@anderjason/tests";
import { Corners } from "..";
import { cornersWithAlignment } from "./cornersWithAlignment";

Test.define("cornersWithAlignment returns the expected result", () => {
  const targetCorners = Corners.givenPoints([
    Point2.givenXY(100, 100),
    Point2.givenXY(400, 100),
    Point2.givenXY(400, 300),
    Point2.givenXY(100, 300),
  ]);

  const inputCorners = Corners.givenPoints([
    Point2.givenXY(390, 290), // bottom right
    Point2.givenXY(110, 290), // bottom left
    Point2.givenXY(110, 110), // top left
    Point2.givenXY(390, 110), // top right
  ]);

  const actual = cornersWithAlignment(inputCorners, targetCorners);
  const expected = Corners.givenPoints([
    Point2.givenXY(110, 110), // top left
    Point2.givenXY(390, 110), // top right
    Point2.givenXY(390, 290), // bottom right
    Point2.givenXY(110, 290), // bottom left
  ]);

  Test.assert(actual.isEqual(expected), "actual is equal to expected");
});
