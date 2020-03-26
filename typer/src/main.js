import { Drawer } from '../models/Drawer.js';
import { Circle } from '../models/Circle.js';
import { CharacterMapper } from '../models/CharacterMapper.js';
import { COLORS, RADIUS_BOUNDS, SPEED_SCALAR, CIRCLE_AMOUNT } from './constants.js';

/**
 * Namespace that contains all necessary globals.
 * @namespace
 * @constant {Object.<string, object>}
 */
const GLOBALS = {
    drawer: new Drawer(document.querySelector('canvas')),
    canvasCenterX: undefined,
    canvasCenterY: undefined,
    circles: null
};

/**
 * Namespace that contains all necessary functions.
 * @namespace
 * @constant {Object.<string, function>}
 * @readonly
 */
const FUNCTIONS = Object.freeze({
    /**
     * Creates and returns a Circle object.
     * @private
     * @return a new Circle object
     */
    _createCircle() {
        // create radius first so it can be referenced (`+ 1` to include max)
        const radius = Math.floor(Math.random() * (RADIUS_BOUNDS.max - RADIUS_BOUNDS.min + 1)) + RADIUS_BOUNDS.min;
        const circleConfig = {
            x: this._calculateWithinBounds(GLOBALS.drawer._canvas.width, radius),
            y: this._calculateWithinBounds(GLOBALS.drawer._canvas.height, radius),
            dx: (Math.random() - 0.5) * SPEED_SCALAR,
            dy: (Math.random() - 0.5) * SPEED_SCALAR,
            radius,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
        };
        return new Circle(circleConfig);
    },

    /**
     * Returns a random coordinate within
     * the bounds while accounting for length.
     *
     * @private
     * @param {number} bound  the maximun value allowed
     * @param {number} length additional length of coordinate
     * @return a random coordinate that accounts for length within the bounds
     */
    _calculateWithinBounds(bound, length) {
        // `- length` to ensure the center does not exceed the bottom side
        // `+ length` to ensure the center does not exceed the top side
        // `length * 2` b/c of our lower bound being length (the `+ length`)
        return Math.random() * (bound - length * 2) + length;
    },

    /**
     * Creates an array of Circle
     * objects sorted by color.
     * @private
     * @param {number} amount
     * @return an array of Circle objects sorted by color
     */
    _createCircles(amount) {
        let circles = [];
        // create circles
        for (let i = 0; i < amount; i++) {
            circles.push(this._createCircle());
        } // for
        // sort circles
        circles.sort((circle1, circle2) => circle1._color > circle2._color ? -1 : 1);

        return circles;
    },

    /**
     * Handles all necessary operations when resizing the window.
     */
    init() {
        const { canvasCenterX, canvasCenterY } = GLOBALS.drawer.init(); // resizes
        Object.assign(GLOBALS, {
            canvasCenterX,
            canvasCenterY,
            circles: this._createCircles(CIRCLE_AMOUNT)
        }); // update properties
    },

    /**
     * Draws on the canvas each animation frame.
     */
    update() {
        // clear canvas
        GLOBALS.drawer.clear();

        GLOBALS.circles.forEach((circle) => {
            // specify the drawing method and parameters to use and delegate execution to a Drawer object
            const drawMethodArgs = [circle._x, circle._y, circle._radius, 0, Math.PI * 2];
            const drawMethod = GLOBALS.drawer._context.arc.bind(GLOBALS.drawer._context, ...drawMethodArgs);
            GLOBALS.drawer.draw(drawMethod, circle._color);

            // update the circle's position and velocity
            circle.update(GLOBALS.drawer._canvas);
        });

        // get next animation frame
        window.requestAnimationFrame(FUNCTIONS.update.bind(FUNCTIONS)); // `this` gets set to `window` normally
    }
});

window.addEventListener('resize', FUNCTIONS.init.bind(FUNCTIONS)); // not using bind would set `this` to `window`
window.addEventListener('keydown', () => { /* TODO */ });

FUNCTIONS.init();
FUNCTIONS.update();

// Test CharacterMapper
const charVis = new CharacterMapper().getArrayFor('K');
charVis.forEach((row) => {
    console.log(...row);
});