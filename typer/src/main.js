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
        [CircleBehavior.ORBITING]: [],
        [CircleBehavior.TRAVELING]: []
    },
    cursorPosition: {
        x: 0,
        y: 0
    },
    inputField: document.querySelector('#keyEventListener'),
};

/**
 * Namespace that contains all necessary functions.
 * @namespace
 * @constant {Object.<string, function>}
 * @readonly
 */
const FUNCTIONS = Object.freeze({
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
    }, // _calculateWithinBounds

    /**
     * Creates and returns a Circle object.
     * @private
     * @return a new Circle object with CircleBehavior.AMBIENT behavior
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
    }, // _createCircle

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
    }, // _createCircles

    /**
     * Get a bounded arc method for the provided Circle object.
     * @param {Circle} circle the Circle object that will be drawn
     * @return the bounded arc method
     */
    _getBoundedArcMethod(circle) {
        const drawMethodArgs = [circle._x, circle._y, circle._radius, 0, Math.PI * 2];
        const drawMethod = GLOBALS.drawer._context.arc.bind(GLOBALS.drawer._context, ...drawMethodArgs);
        return drawMethod;
    }, // _getBoundedArcMethod

    /**
     * Returns an integer denoting the "width" of an array,
     * which I define as the index of the last truthy value
     * minus the index of the first truthy value plus one.
     * 
     * A negative width indicates that no truthy values were found.
     * 
     * @param {object[][]} array the array of whose "width" to calculate
     * @return the "width", as defined above, of array
     */
    getArrayWidth(array) {
        let firstElementIndex = -1;
        let lastElementIndex = -1;
        array.forEach((row) => {
            row.forEach((elem, i) => {
                if (elem && (firstElementIndex < 0 || i < firstElementIndex)) {
                    firstElementIndex = i;
                    lastElementIndex = i;
                } else if (elem && i > lastElementIndex) {
                    lastElementIndex = i;
                }// if
            });
            // if (firstElementIndex < 0 && elem) {
            //     firstElementIndex = i;
            //     lastElementIndex = i;
            // } else if (elem) {
            //     lastElementIndex = i;
            // }// if
        });
        // console.log(lastElementIndex, firstElementIndex);
        return lastElementIndex - firstElementIndex + 1;
    }, // getArrayWidth

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
        // TODO: adjust position of ORBITING circles
        Object.assign(GLOBALS.circles, {
            [CircleBehavior.AMBIENT]: this._createCircles(CIRCLE_AMOUNT)
        });
        // Focus onto the text field
        GLOBALS.inputField.focus();
    }, // init

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
                // update the circle's position based on its behavior
                circle.update(GLOBALS.drawer._canvas);
            });
        } // for

        // get next animation frame
        window.requestAnimationFrame(FUNCTIONS.update.bind(FUNCTIONS)); // `this` gets set to `window` normally
    }, // update

    /**
     * Draws key onto the canvas using Circle objects, and updates the "cursor" postion.
     * @param {string} key the character to draw
     * @return the number of circles added
     */
    drawCharacter(key) {
        const charArray = GLOBALS.characterMapper.getArrayFor(key);
        let totalCirclesAdded = 0;
        for (let r = 0; r < charArray.length; r++) {
            const row = charArray[r];
            for (let c = 0; c < row.length; c++) {
                // the individual elements are truthy if a pixel is present
                if (row[c]) {
                    const circle = this._createCircle();
                    circle._radius = 5;

                    // Calculate coordinates
                    // const xCoordinate = (GLOBALS.canvasCenterX / 2) + (c * OFFSET) + GLOBALS.cursorPosition.x;
                    const xCoordinate = 0 + (c * OFFSET) + GLOBALS.cursorPosition.x; // TODO: calculate offset caused by canvas center
                    const yCoordinate = (GLOBALS.canvasCenterY / 2) + (r * OFFSET) + GLOBALS.cursorPosition.y;

                    // Tell the circle where it needs to go
                    circle.setDestination({ x: xCoordinate, y: yCoordinate });
                    circle.setBehavior(CircleBehavior.TRAVELING);
                    GLOBALS.circles[CircleBehavior.TRAVELING].push(circle);
                    totalCirclesAdded++;
                } // if
            } // for
        } // for

        // Now that the character has been drawn, add offset to give the illusion of typing.
        // Each circle is represented with a circle of radius X.
        GLOBALS.cursorPosition.x += charArray[0].length * 6;
        if (Math.abs(window.innerWidth - GLOBALS.cursorPosition.x) <= 500) {
            GLOBALS.cursorPosition.y += charArray.length * 8;
            GLOBALS.cursorPosition.x = 0;
        } // if
        return totalCirclesAdded;
    } // drawCharacter
});

window.addEventListener('resize', FUNCTIONS.init.bind(FUNCTIONS)); // not using bind would set `this` to `window`

// need to use an input element so backspace doesn't go to previous site and to allow for mobile
window.addEventListener('click', () => GLOBALS.inputField.focus());

window.addEventListener('changedbehavior', (event) => {
    const { circle, from, to } = event.detail;
    const circleIndex = GLOBALS.circles[from].indexOf(circle);
    // delete from old classification
    GLOBALS.circles[from].splice(circleIndex, 1);
    // add to new classification
    GLOBALS.circles[to].push(circle);
});

// TODO: magic numbers galore
const removeCount = []; // TODO: refers to most recent one
GLOBALS.inputField.addEventListener('keydown', ({ key }) => {
    switch (key) {
    case 'Backspace':
        GLOBALS.circles[CircleBehavior.TRAVELING] = []; // TODO: error prone

        const amountToRemove = removeCount[removeCount.length - 1];
        const orbitingCircles = GLOBALS.circles[CircleBehavior.ORBITING];
        orbitingCircles.splice(orbitingCircles.length - amountToRemove, amountToRemove);

        removeCount.pop();
        Object.assign(GLOBALS.cursorPosition, { x: GLOBALS.cursorPosition.x - 35 * 6 });
        break;
    case 'Enter':
        GLOBALS.cursorPosition.y += 34 * 12;
        GLOBALS.cursorPosition.x = 0;
    default:
        removeCount.push(FUNCTIONS.drawCharacter.call(FUNCTIONS, key));
    } // switch
});

// get things started
FUNCTIONS.init();
FUNCTIONS.update();