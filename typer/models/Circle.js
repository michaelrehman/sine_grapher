import { Orbit } from './Orbit.js';
import { THRESHOLD } from '../src/constants.js';

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
 * @property {string} CircleBehavior.AMBIENT  move the Circle around as if
 *                                            it's bouncing off the edges
 * @property {string} CircleBehavior.ORBITING move the Circle as if it's
 *                                            orbiting around a point
 */
export const CircleBehavior = Object.freeze({
    AMBIENT: 'AMBIENT',
    ORBITING: 'ORBITING'
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
     * @param {number}  config.radius          the radius of this Circle
     * @param {number}  config.dx              x-velocity of this Circle
     * @param {number}  config.dy              y-velocity of this Circle
     * @param {string}  config.color           color of this Circle
     * @param {boolean} [config.behavior=CircleBehavior.AMBIENT] indicates if this Circle should move or not
     */
    constructor({ x, y, radius, dx, dy, color, behavior=CircleBehavior.AMBIENT }) {
        // Set initial velocities to 0 if REVLOVING
        if (behavior === CircleBehavior.ORBITING) {
            dx = 0;
            dy = 0;
        } // if

        Object.assign(this, {
            _x: x,
            _y: y,
            _dx: dx,
            _dy: dy,
            _radius: radius,
            _color: color
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
    _updatePositionWithVelocity() {
        this._x += this._dx;
        this._y += this._dy;
    } // _updatePositionWithVelocity

    /**
     * Handles moving the Circle around on the canvas as if it were just bouncing around.
     * @param {number} maxHorizontal the maximum horizontal bound of the Circle on the canvas
     * @param {number} maxVertical   the maximum vertical bound of the Circle on the canvas
     * @throws {Error} if maxHorizontal or maxVertical is falsy
     */
    _handleAmbient(maxHorizontal, maxVertical) {
        if (!maxHorizontal || !maxVertical) {
            throw new Error('Both bounds must be provided.');
        } // if
        this._updateDX(0, maxHorizontal);
        this._updateDY(0, maxVertical);
        this._updatePositionWithVelocity();
    } // _handleAmbient

    /**
     * Orbits this circle around a path specified by an Orbit object.
     * @throws {Error} if this._orbit is falsy or its type !== 'object'
     */
    _handleOrbiting() {
        // Check if the property exists (typeof null === 'object')
        if (!this._orbit || typeof this._orbit !== 'object') {
            throw new Error('This Circle does not have an Orbit object.');
        } // if

        // Update coordinates only if necessary
        if (this.hasReacedNextPoint(THRESHOLD)) {
            this._movingToward = this._orbit.followOrbit();
        } // if

        // Calculate next coordinate while factoring in amount of franes to react this._movingToward by.
        const inbetweenX = this._x + ((this._movingToward.x - this._x) / this._orbit.travelFrames);
        const inbetweenY = this._y + ((this._movingToward.y - this._y) / this._orbit.travelFrames);

        this.moveTo(inbetweenX, inbetweenY);
    } // _handleOrbiting

    /**
     * Updates this Circle's x and y
     * coordinates based on its velocities
     * and behavior.
     *
     * @param {number} bounds.width  the width of the container
     * @param {number} bounds.height the height of the container
     */
    update({ width: maxHorizontal, height: maxVertical }={}) {
        switch (this._behavior) {
        case CircleBehavior.AMBIENT:
            this._handleAmbient(maxHorizontal, maxVertical);
            break;
        case CircleBehavior.ORBITING:
            this._handleOrbiting();
            break;
        } // if
    } // update

    hasReacedNextPoint(threshold) {
        return Math.abs(this._x - this._movingToward.x) < threshold
            && Math.abs(this._y - this._movingToward.y) < threshold;
    } // hasReacedNextPoint

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
     * Note that setOrbit will only have an effect if
     * the behavior is set to CircleBehavior.ORBITING.
     *
     * @param {CircleBehavior} newBehavior      the new behavior
     * @param {boolean}        [setOrbit=false] if true, overrides the orbit to follow
     * @throws {Error} if newBehavior is not one of CircleBehavior
     */
    setBehavior(newBehavior, setOrbit=false) {
        // Check if the valuse passed in is a key in the "enum".
        // Can check this way because the values === their key.
        if (!CircleBehavior[newBehavior]) {
            throw new Error('Invalid behavior.');
        } else if (newBehavior === CircleBehavior.ORBITING && setOrbit) {
            // set the current position as the orbit center
            // generate an orbit radius from [2, this._radius + 2)
            const orbitConfig = {
                x: this._x,
                y: this._y,
                radius: (Math.random() * this._radius) + 2 // TODO: magic #
            };
            this.setOrbit(new Orbit(orbitConfig));
        }// if
        this._behavior = CircleBehavior[newBehavior];
    } // setBehavior

    /**
     * Sets the center to revolve around.
     * @param {Orbit} orbit the new orbit path to follow if using CircleBehavior.ORBITING
     */
    setOrbit(orbit) {
        // No `this._orbit` because it may not have been intialized to an object.
        // If it is orbiting, then it will be moving toward a new point.
        Object.assign(this, {
            _orbit: orbit,
            _movingToward: orbit.followOrbit()
        });
    } // center

} // Circle