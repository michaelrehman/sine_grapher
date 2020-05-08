import { RADIANS } from '../../sine_grapher/src/initial.js';

/**
 * An immutable array containing all
 * cosine values from radians listed on
 * the unit circle.
 * @constant {!number[]}
 * @readonly
 */
export const COS_VALUES = RADIANS.map((radian) => Math.cos(radian));

/**
 * A constant array containing multiple colors.
 * @constant {!string[]}
 * @readonly
 */
export const COLORS = Object.freeze(['#673C4F', '#7F557D', '#726E97', '#7698B3', '#83B5D1']);

/**
 * A constant object representing the
 * min and max values for Circle radii.
 * @constant {!Object.<string, number>}
 * @readonly
 */
export const RADIUS_BOUNDS = Object.freeze({ min: 1, max: 3 });

/**
 * A constant object representing the x and y travel
 * factors for Circles with CircleBehavior.TRAVELING.
 * @constant {!Object.<string, number>}
 * @readonly
 */
export const TRAVEL_FACTOR = Object.freeze({ x: 15, y: 30 });

/**
 * A constant object representing the min
 * and max values for the Orbit travel factor.
 * @constant {!Object.<string, number>}
 * @readonly
 */
export const ORBIT_TRAVEL_FACTOR = Object.freeze({ min: 10, max: 20 });

/**
 * Multiplier to increase speed.
 * @constant {!number}
 * @readonly
 */
export const SPEED_SCALAR = 5;

/**
 * The number of Circle objects to create.
 * Also doubles as a minimum number of ambient circles to have.
 * @constant {!number}
 * @readonly
 */
export const CIRCLE_AMOUNT = 0;

/**
 * The offset between each Circle when
 * using them to draw a character onto
 * the canvas.
 * @constant {!number}
 * @readonly
 */
export const OFFSET = 10;

/**
 * The threshold used to indicate when a Circle's
 * coordinates have reached its coordinates under
 * Circle._movingToward.
 * @constant {!number}
 */
export const THRESHOLD = 1;

/**
 * The font size in pixels to use for
 * generating character coordinates.
 * @constant {!number}
 */
export const FONT_SIZE = 50;

/**
 * The radius for circles that make up the characters.
 * @constant {!number}
 */
export const CHAR_CIRCLE_RADIUS = 5;

/**
 * Used to calculate the space between each character.
 * @constant {!number}
 */
export const KERNING_SCALAR = 2.2;