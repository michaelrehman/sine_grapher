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
     * @param {number} framesToGrowIn the number of frames to reach nextHeight by
     */
    grow(framesToGrowIn) {
        const growAmount = (this.nextHeight - this.height) / framesToGrowIn;
        this.height += growAmount;
    } // grow

    /**
     * Checks if the difference between height
     * and nextHeight are within the threshold.
     * @param {number} threshold the maximum difference allowed
     * @returns true if the difference is within the threshold, false otherwise
     */
    isNextHeight(threshold) {
        return Math.abs(this.height - this.nextHeight) < threshold;
    } // isNextHeight

} // Bar