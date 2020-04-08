import { SIN_VALUES } from '../../sine_grapher/src/constants.js';
import { COS_VALUES } from '../src/constants.js';

/**
 * Object that represents an enum
 * of different circle behaviors.
 * These behaviors determine how
 * a Circle object moves on the canvas.
 * Because this is really an object,
 * the keys and values are equal.
 *
 * @namespace
 * @const {!Object.<string, string>}
 * @readonly
 *
 * @property {string} CircleBehavior.AMBIENT   move the Circle around as if
 *                                             it's bouncing off the edges
 * @property {string} CircleBehavior.REVLOVING move the Circle as if it's
 *                                             revloving around a point
 */
export const CircleBehavior = Object.freeze({
    AMBIENT: 'AMBIENT',
    REVOLVING: 'REVOLVING'
});

/**
 * Class representing a Circle that can move within a canvas element.
 */
export class Circle {

    /**
     * Constructs a new Circle object.
     *
     * @param {object}  config                 object containing the properties for this Circle
     * @param {number}  config.x               x-coodinate of this Circle
     * @param {number}  config.y               y-coordinate of this Circle
     * @param {number}  config.dx              x-velocity of this Circle
     * @param {number}  config.dy              y-velocity of this Circle
     * @param {string}  config.color           color of this Circle
     * @param {boolean} [config.behavior=CircleBehavior.AMBIENT] indicates if this Circle should move or not
     */
    constructor({ x, y, radius, dx, dy, color, behavior=CircleBehavior.AMBIENT }) {
        // Set initial velocities to 0 if REVLOVING
        if (behavior === CircleBehavior.REVOLVING) {
            dx = 0;
            dy = 0;
        } // if

        Object.assign(this, {
            _x: x,
            _y: y,
            _dx: dx,
            _dy: dy,
            _radius: radius,
            _color: color,
        });
        this.setBehavior(behavior);
    } // constructor

    /**
     * Updates this Circle's x velocity if
     * it has reached the min or max bounds.
     * @param {number} min the min bound
     * @param {number} max the max bound
     */
    _updateDX(min, max) {
        // checks right side of the circle, then the left side of the circle
        if (this._x + this._radius >= max || this._x - this._radius <= min) {
            // reverse the direction
            this._dx = -this._dx;
        } // if
    } // _updateDX

    /**
     * Updates this Circle's y velocity if
     * it has reached the min or max bounds.
     * @param {number} min the min bound
     * @param {number} max the max bound
     */
    _updateDY(min, max) {
        // checks bottom of the circle, then the top of the circle
        if (this._y + this._radius >= max || this._y - this._radius <= min) {
            // reverse the direction
            this._dy = -this._dy;
        } // if
    } // _updateDY

    /**
     * Updates this Circle's position based on its velocities.
     */
    _updatePosition() {
        this._x += this._dx;
        this._y += this._dy;
    } // _updatePosition

    /**
     * Handles moving the Circle around on the canvas as if it were just bouncing around.
     * @param {*} maxHorizontal the maximum horizontal bound of the Circle on the canvas
     * @param {*} maxVertical   the maximum vertical bound of the Circle on the canvas
     * @throws {Error} if maxHorizontal or maxVertical is falsy
     */
    _handleAmbient(maxHorizontal, maxVertical) {
        if (!maxHorizontal || !maxVertical) {
            throw new Error('Both bounds must be provided.');
        } // if
        this._updateDX(0, maxHorizontal);
        this._updateDY(0, maxVertical);
        this._updatePosition();
    } // _handleAmbient

    _handleRevolving() {
        const randomScalar = Math.random() * 1.5;
        const newXCoordinate = this._center.x + (COS_VALUES[this._center.currentAngle] * this._radius * randomScalar);
        const newYCoordinate = this._center.y + (SIN_VALUES[this._center.currentAngle] * this._radius * randomScalar);
        // console.log(typeof this._radius);
        this._center.currentAngle++;
        if (this._center.currentAngle === SIN_VALUES.length) {
            this._center.currentAngle = 0;
        } // if
        // TODO: move in a circle of various radii and times (and dont use moveTo for it)
        this.moveTo(newXCoordinate, newYCoordinate);
    } // _handleRevolving

    /**
     * Updates this Circle's x and y
     * coordinates based on its velocities.
     *
     * @param {number} bounds.width  the width of the container
     * @param {number} bounds.height the height of the container
     */
    update({ width: maxHorizontal, height: maxVertical }={}) {
        switch (this._behavior) {
        case CircleBehavior.AMBIENT:
            this._handleAmbient(maxHorizontal, maxVertical);
            break;
        case CircleBehavior.REVOLVING:
            this._handleRevolving();
            break;
        } // if
    } // update

    /**
     * Moves the specified Circle
     * object to the specified coordinates.
     * @param {Circle} circle the Circle object to move
     * @param {number} x      the x-coordinate to move it to
     * @param {number} y      the y-coordinate to move it to
     */
    moveTo(x, y) {
        Object.assign(this, { _x: x, _y: y });
    } // moveTo

    /**
     * Sets the new behavior for this Circle object to use.
     *
     * This method is called by the contructor to set
     * the inital behavior, but it can be used on its own.
     *
     * Note that setCenter will only have an effect if
     * the behavior is set to CircleBehavior.REVOLVING.
     *
     * @param {CircleBehavior} newBehavior the new behavior
     * @param {boolean}        [setCenter=false] if true, overrides the center to revolve around
     * @throws {Error} if newBehavior is not one of CircleBehavior
     */
    setBehavior(newBehavior, setCenter=false) {
        // Check if the valuse passed in is a key in the "enum".
        // Can check this way because the values === their key.
        if (!CircleBehavior[newBehavior]) {
            throw new Error('Invalid behavior.');
        } else if (newBehavior === CircleBehavior.REVOLVING && setCenter) {
            // set the current position as the point revolve around
            this.setCenter(this._x, this._y);
        }// if
        this._behavior = CircleBehavior[newBehavior];
    } // setBehavior

    /**
     * Sets the center to revolve around.
     * @param {number} xCenter the new x-center to revolve around if behavior
     *                         is set to CircleBehavior.REVOLVING
     * @param {number} yCenter the new y-center to revolve around if behavior
     *                         is set to CircleBehavior.REVOLVING
     */
    setCenter(xCenter, yCenter) {
        // No `this._center` because it may not have been intialized to an object.
        Object.assign(this, {
            _center: {
                x: xCenter,
                y: yCenter,
                currentAngle: 0
            }
        });
    } // center

} // Circle