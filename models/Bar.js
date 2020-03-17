/**
 * Represents a single bar like those used in bar graphs.
 */
export class Bar {

    /**
     * Constructs a Bar object.
     * @param {number} height     the height of the bar
     * @param {number} nextHeight the height for the bar to gradually move to
     */
    constructor(height, nextHeight=undefined) {
        Object.assign(this, {
            height, nextHeight
        });
    } // constructor

} // Bar