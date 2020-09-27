import { Point2 } from "@anderjason/geometry";
declare type Turn = "clockwise" | "counterclockwise" | "collinear";
export declare class GrahamScan {
    /**
     * Returns true iff all points in <code>points</code> are collinear.
     *
     * @param points the list of points.
     * @return       true iff all points in <code>points</code> are collinear.
     */
    areAllCollinear(points: Point2[]): boolean;
    /**
     * Returns the convex hull of the points created from the list
     * <code>points</code>. Note that the first and last point in the
     * returned <code>List&lt;java.awt.Point&gt;</code> are the same
     * point.
     *
     * @param points the list of points.
     * @return       the convex hull of the points created from the list
     *               <code>points</code>.
     * @throws IllegalArgumentException if all points are collinear or if there
     *                                  are less than 3 unique points present.
     */
    getConvexHull(points: Point2[]): Point2[];
    /**
     * Returns the points with the lowest y coordinate. In case more than 1 such
     * point exists, the one with the lowest x coordinate is returned.
     *
     * @param points the list of points to return the lowest point from.
     * @return       the points with the lowest y coordinate. In case more than
     *               1 such point exists, the one with the lowest x coordinate
     *               is returned.
     */
    getLowestPoint(points: Point2[]): Point2;
    /**
     * Returns a sorted set of points from the list <code>points</code>. The
     * set of points are sorted in increasing order of the angle they and the
     * lowest point <tt>P</tt> make with the x-axis. If tow (or more) points
     * form the same angle towards <tt>P</tt>, the one closest to <tt>P</tt>
     * comes first.
     *
     * @param points the list of points to sort.
     * @return       a sorted set of points from the list <code>points</code>.
     * @see GrahamScan#getLowestPoint(java.util.List)
     */
    getSortedPointSet(points: Point2[]): Point2[];
    /**
     * Returns the GrahamScan#Turn formed by traversing through the
     * ordered points <code>a</code>, <code>b</code> and <code>c</code>.
     * More specifically, the cross product <tt>C</tt> between the
     * 3 points (vectors) is calculated:
     *
     * <tt>(b.x-a.x * c.y-a.y) - (b.y-a.y * c.x-a.x)</tt>
     *
     * and if <tt>C</tt> is less than 0, the turn is CLOCKWISE, if
     * <tt>C</tt> is more than 0, the turn is COUNTER_CLOCKWISE, else
     * the three points are COLLINEAR.
     *
     * @param a the starting point.
     * @param b the second point.
     * @param c the end point.
     * @return the GrahamScan#Turn formed by traversing through the
     *         ordered points <code>a</code>, <code>b</code> and
     *         <code>c</code>.
     */
    getTurn(a: Point2, b: Point2, c: Point2): Turn;
}
export {};
