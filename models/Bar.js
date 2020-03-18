/**
 * Represents a single bar like those used in bar graphs.
 */
export class Bar {

    /**
     * Constructs a Bar object.
     * @param {number} height     the height of the bar
     * @param {number} nextHeight the height for the bar to gradually move to
     */
    constructor(height, nextHeight=0) {
        Object.assign(this, {
            height, nextHeight
        });
    } // constructor

    /**
     * Grows the height property of this Bar object.
     * @param {number} growAmount the amount to grow the height property by
     */
    grow(growAmount) {
        this.height += growAmount;
    }

    /**
     * Checks if the difference between height
     * and nextHeight are within the threshold.
     * @param {number} threshold the maximum difference allowed
     * @returns true if the difference is within the threshold, false otherwise
     */
    isNextHeight(threshold) {
        return Math.abs(this.height - this.nextHeight) < threshold;
    }

} // Bar