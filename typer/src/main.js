import { Drawer } from '../models/Drawer.js';
import { Circle, CircleBehavior } from '../models/Circle.js';
import { CharacterMapper } from '../models/CharacterMapper.js';
import { COLORS, RADIUS_BOUNDS, SPEED_SCALAR, CIRCLE_AMOUNT, OFFSET } from './constants.js';

/**
 * Namespace that contains all necessary globals.
 * @namespace
 * @constant {Object.<string, object>}
 */
const GLOBALS = {
    drawer: new Drawer(document.querySelector('canvas')),
    characterMapper: new CharacterMapper(),
    canvasCenterX: undefined,
    canvasCenterY: undefined,
    circles: {
        [CircleBehavior.AMBIENT]: [],
        [CircleBehavior.REVOLVING]: []
    }
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
        const circles = [];

        // create circles
        for (let i = 0; i < amount; i++) {
            circles.push(this._createCircle());
        } // for
        // sort circles
        circles.sort((circle1, circle2) => circle1._color > circle2._color ? -1 : 1);

        return circles;
    },

    /**
     * Get a bounded arc method for the provided Circle object.
     * @param {Circle} circle the Circle object that will be drawn
     * @return the bounded arc method
     */
    _getBoundedArcMethod(circle) {
        const drawMethodArgs = [circle._x, circle._y, circle._radius, 0, Math.PI * 2];
        const drawMethod = GLOBALS.drawer._context.arc.bind(GLOBALS.drawer._context, ...drawMethodArgs);
        return drawMethod;
    },

    /**
     * Handles all necessary operations when resizing the window.
     */
    init() {
        const { canvasCenterX, canvasCenterY } = GLOBALS.drawer.init(); // resizes
        // update properties
        Object.assign(GLOBALS, {
            canvasCenterX,
            canvasCenterY
        });
        // create new ambient circles
        // TODO: adjust position of other circles
        Object.assign(GLOBALS.circles, {
            [CircleBehavior.AMBIENT]: this._createCircles(CIRCLE_AMOUNT)
        });
    },

    /**
     * Draws on the canvas each animation frame.
     */
    update() {
        // clear canvas
        GLOBALS.drawer.clear();

        for (const circleType in GLOBALS.circles) {
            GLOBALS.circles[circleType].forEach((circle) => {
                // get the bounded draw method and delegate execution to a Drawer object
                GLOBALS.drawer.draw(this._getBoundedArcMethod(circle), circle._color);
                // update the circle's position and velocity
                circle.update(GLOBALS.drawer._canvas);
            });
        }

        // get next animation frame
        window.requestAnimationFrame(FUNCTIONS.update.bind(FUNCTIONS)); // `this` gets set to `window` normally
    },

    /**
     *
     *
     * @param {KeyboardEvent} event     the event object
     * @param {string}        event.key the key that triggered the event object
     */
    drawCharacter({ key }) {
        const charArray = GLOBALS.characterMapper.getArrayFor(key);
        for (let r = 0; r < charArray.length; r++) {
            const row = charArray[r];
            for (let c = 0; c < row.length; c++) {
                // the individual elements are truthy if a pixel is present
                if (row[c]) {
                    const circle = this._createCircle();
                    circle.isMoving = false;
                    circle._radius = 5;

                    Circle.moveCircleTo(
                        circle,
                        (GLOBALS.canvasCenterY / 2) + (c * OFFSET),
                        (GLOBALS.canvasCenterX / 2) + (r * OFFSET)
                    );

                    circle.setBehavior(CircleBehavior.REVOLVING);
                    GLOBALS.circles[CircleBehavior.REVOLVING].push(circle);
                } // if
            }
        } // for
    }
});

// events
window.addEventListener('resize', FUNCTIONS.init.bind(FUNCTIONS)); // not using bind would set `this` to `window`
window.addEventListener('keydown', FUNCTIONS.drawCharacter.bind(FUNCTIONS));

// get things started
FUNCTIONS.init();
FUNCTIONS.update();