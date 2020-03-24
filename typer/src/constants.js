/**
 * A constant array containing multiple colors.
 * @constant {string[]}
 * @readonly
 */
export const COLORS = Object.freeze(['#673C4F', '#7F557D', '#726E97', '#7698B3', '#83B5D1']);

/**
 * A constant object representing the
 * min and max values for Circle radii.
 * @constant {Object.<string, number>}
 * @readonly
 */
export const RADIUS_BOUNDS = Object.freeze({ min: 1, max: 3 });

/**
 * Multiplier to increase speed.
 * @constant {number}
 * @readonly
 */
export const SPEED_SCALAR = 5;

/**
 * The number of Circle objects to create.
 */
export const CIRCLE_AMOUNT = 200;