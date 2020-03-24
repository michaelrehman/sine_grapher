/**
 * An immutable array containing all
 * radian values listed on the unit circle.
 */
export const RADIANS = Object.freeze([
    0,
    Math.PI / 6,
    Math.PI / 4,
    Math.PI / 3,
    Math.PI / 2,
    2 * Math.PI / 3,
    3 * Math.PI / 4,
    5 * Math.PI / 6,
    Math.PI,
    7 * Math.PI / 6,
    5 * Math.PI / 4,
    4 * Math.PI / 3,
    3 * Math.PI / 2,
    5 * Math.PI / 3,
    7 * Math.PI / 4,
    11 * Math.PI / 6,
]); // length = 16

/**
 * The amount of bars to draw onto the canvas.
 */
export const BAR_AMOUNT = RADIANS.length;

/**
 * The width of each Bar object in pixels.
 */
export const BAR_WIDTH = 15;

/**
 * The scalar used to provide space
 * between each Bar object on the canvas.
 */
export const BAR_GAP_SCALAR = 1.4;

/**
 * The amount of space between the
 * leftmost side of two bars on the canvas.
 */
export const BAR_GAP = BAR_WIDTH * BAR_GAP_SCALAR;

/**
 * The value to multiply
 * each Bar object's height by.
 */
export const BAR_HEIGHT_SCALAR = 100;

/**
 * The number of frames to reach Bar.nextHeight by.
 */
export const GROW_FRAMES = 5;

/**
 * The threshold used to indicate when a Bar
 * object's height has reached its nextHeight.
 */
export const HEIGHT_THRESHOLD = 0.1;

/**
 * The fill color to use for the bars.
 */
export const FILL_COLOR = '#cccccc';

/**
 * Represents the width of RADIANS.length bar gaps.
 */
export const CYCLE_WIDTH = BAR_GAP * RADIANS.length;