import { Orbit } from './Orbit.js';
import { THRESHOLD, TRAVEL_FACTOR } from '../src/constants.js';

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
 * @property {string} CircleBehavior.ORBITING  move the Circle as if it's
 *                                             orbiting around a point
 * @property {string} CircleBehavior.TRAVELING move the Circle as if it's
 *                                             intentionally moving toward a point
 */
export const CircleBehavior = Object.freeze({
    AMBIENT: 'AMBIENT',
    ORBITING: 'ORBITING',
    TRAVELING: 'TRAVELING'
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
     * Handles moving this Circle around on the canvas as if it were just bouncing around.
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

        const { _x: x, _y: y, _destination: dest, _orbit: orbit } = this;
        // Calculate next coordinate while factoring in amount of franes to reach this._destination by.
        const inbetweenX = x + (dest.x - x) / orbit.travelFactor;
        const inbetweenY = y + (dest.y - y) / orbit.travelFactor;
        this.moveTo(inbetweenX, inbetweenY);

        // Update coordinates only if necessary
        if (this.hasReacedDestination()) {
            this._destination = orbit.followOrbit();
        } // if
    } // _handleOrbiting

    /**
     * Handles moving this Circle toward a point
     * specified through this.setDestination.
     * @throws {Error} if this._destination was not set by this.setDestination
     */
    _handleTraveling() {
        // Prechecks
        if (!this._destination || typeof this._destination !== 'object') {
            throw new Error('This Circle does not have a destination to travel to.');
        } // if

        const { _x: x, _y: y, _destination: dest } = this;
        const nextX = x + (dest.x - this._x) / TRAVEL_FACTOR.x; // TODO: magic #
        const nextY = y + (dest.y - this._y) / TRAVEL_FACTOR.y; // TODO: magic #
        this.moveTo(nextX, nextY);

        // Switch to CircleBehavior.ORBITING once destination has been reached.
        if (this.hasReacedDestination()) {
            // Dispatch an event through window to notify `main.js`
            // to switch this Circle to a new classification
            window.dispatchEvent(new CustomEvent('changedbehavior', {
                detail: {
                    circle: this,
                    from: this._behavior,
                    to: CircleBehavior.ORBITING
                }
            }));
            this.setBehavior(CircleBehavior.ORBITING, true);
        } // if
    } // _handleTraveling

    /**
     * Updates this Circle's x and y
     * coordinates based on its velocities
     * and/or behavior.
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
        case CircleBehavior.TRAVELING:
            this._handleTraveling();
            break;
        } // switch
    } // update

    /**
     * Checks if this Circle has reached its destination.
     * @param {number} [threshold=THRESHOLD] the acceptable difference between this
     *                                       Circle's position and its destination
     * @return true if the destination has been reached; false otherwise
     */
    hasReacedDestination(threshold=THRESHOLD) {
        const { _x: x, _y: y, _destination: dest } = this;
        const { sqrt, pow } = Math;
        return sqrt(pow(x - dest.x, 2) + pow(y - dest.y, 2)) < threshold;
        // return Math.abs(this._x - this._destination.x) < threshold
        //     && Math.abs(this._y - this._destination.y) < threshold;
    } // hasReacedDestination

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
        } // if
        // TODO: set intial destination with TRAVELING
        this._behavior = CircleBehavior[newBehavior];
    } // setBehavior

    /**
     * Sets the destination coordinates to travel to.
     * Only has an effect if this Circle's behavior is
     * one of CircleBehavior.ORBITING or CircleBehavior.TRAVELING.
     *
     * @param {Object.<string, number>} destinationCoordinates   the set of coordinates to travel to
     * @param {number}                  destinationCoordinates.x the x-coordinate to travel to
     * @param {number}                  destinationCoordinates.y the y-coordinate to travel to
     */
    setDestination(destinationCoordinates) {
        this._destination = destinationCoordinates;
    } // setDestination

    /**
     * Sets the center to revolve around.
     * @param {Orbit} orbit the new orbit path to follow if using CircleBehavior.ORBITING
     */
    setOrbit(orbit) {
        // No `this._orbit` because it may not have been intialized to an object.
        Object.assign(this, {
            _orbit: orbit
        });
        // If it is orbiting, then it will be moving toward a new point.
        this.setDestination(orbit.followOrbit());
    } // center

} // Circle