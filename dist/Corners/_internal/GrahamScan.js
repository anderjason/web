"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrahamScan = void 0;
const util_1 = require("@anderjason/util");
// Ported from https://github.com/bkiers/GrahamScan
class GrahamScan {
    /**
     * Returns true iff all points in <code>points</code> are collinear.
     *
     * @param points the list of points.
     * @return       true iff all points in <code>points</code> are collinear.
     */
    areAllCollinear(points) {
        if (points.length < 2) {
            return true;
        }
        const a = points[0];
        const b = points[1];
        for (let i = 2; i < points.length; i++) {
            const c = points[i];
            if (this.getTurn(a, b, c) !== "collinear") {
                return false;
            }
        }
        return true;
    }
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
    getConvexHull(points) {
        const sorted = this.getSortedPointSet(points);
        if (sorted.length < 3) {
            throw new Error("can only create a convex hull of 3 or more unique points");
        }
        if (this.areAllCollinear(sorted)) {
            throw new Error("cannot create a convex hull from collinear points");
        }
        const stack = [];
        stack.push(sorted[0]);
        stack.push(sorted[1]);
        for (let i = 2; i < sorted.length; i++) {
            const head = sorted[i];
            const middle = stack.pop();
            const tail = util_1.ArrayUtil.optionalLastValueGivenArray(stack);
            const turn = this.getTurn(tail, middle, head);
            switch (turn) {
                case "counterclockwise":
                    stack.push(middle);
                    stack.push(head);
                    break;
                case "clockwise":
                    i--;
                    break;
                case "collinear":
                    stack.push(head);
                    break;
            }
        }
        // close the hull
        stack.push(sorted[0]);
        return stack;
    }
    /**
     * Returns the points with the lowest y coordinate. In case more than 1 such
     * point exists, the one with the lowest x coordinate is returned.
     *
     * @param points the list of points to return the lowest point from.
     * @return       the points with the lowest y coordinate. In case more than
     *               1 such point exists, the one with the lowest x coordinate
     *               is returned.
     */
    getLowestPoint(points) {
        let lowest = points[0];
        for (let i = 1; i < points.length; i++) {
            let temp = points[i];
            if (temp.y < lowest.y || (temp.y == lowest.y && temp.x < lowest.x)) {
                lowest = temp;
            }
        }
        return lowest;
    }
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
    getSortedPointSet(points) {
        let lowest = this.getLowestPoint(points);
        const result = [...points];
        result.sort((a, b) => {
            if (a.isEqual(b)) {
                return 0;
            }
            // use longs to guard against int-underflow
            let thetaA = Math.atan2(a.y - lowest.y, a.x - lowest.x);
            let thetaB = Math.atan2(b.y - lowest.y, b.x - lowest.x);
            if (thetaA < thetaB) {
                return -1;
            }
            else if (thetaA > thetaB) {
                return 1;
            }
            else {
                // collinear with the 'lowest' point, let the point closest to it come first
                // use longs to guard against int-over/underflow
                let distanceA = Math.sqrt((lowest.x - a.x) * (lowest.x - a.x) +
                    (lowest.y - a.y) * (lowest.y - a.y));
                let distanceB = Math.sqrt((lowest.x - b.x) * (lowest.x - b.x) +
                    (lowest.y - b.y) * (lowest.y - b.y));
                if (distanceA < distanceB) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
        });
        return result;
    }
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
    getTurn(a, b, c) {
        // use longs to guard against int-over/underflow
        let crossProduct = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        if (crossProduct > 0) {
            return "counterclockwise";
        }
        else if (crossProduct < 0) {
            return "clockwise";
        }
        else {
            return "collinear";
        }
    }
}
exports.GrahamScan = GrahamScan;
//# sourceMappingURL=GrahamScan.js.map