import { SIN_VALUES } from '../../sine_grapher/src/constants.js';
import { COS_VALUES } from '../src/constants.js';

/**
 * Represents an path to follow that resembles an orbit.
 */
export class Orbit {

    /**
     * Constructs a new Orbit object.
     * @param {Object.<string, number>} config        an object specifying the configurations for this Orbit
     * @param {number}                  config.x      the x-center of this Orbit
     * @param {number}                  config.y      the y-center of this Orbit
     * @param {number}                  config.radius the radius of this orbit
     */
    constructor({ x, y, radius }) {
        Object.assign(this, {
            _x: x,
            _y: y,
            _radius: radius,
            currentAngleIndex: 0,
            travelFrames: Math.floor(Math.random() * 5) + 1 // TODO: magic #
        });
    } // constrcutor

    /**
     * Returns the next x and y coordinate on the path
     * in order to reach the next unit circle defined
     * point in this.travelFrames amount of frames.
     * @return an object with x and y properties
     *         that move along this Orbit's path
     */
    followOrbit() {
        // Calculate coordinates
        const newXCoordinate = this._x +
            (COS_VALUES[this.currentAngleIndex] * this._radius);
        const newYCoordinate = this._y +
            (SIN_VALUES[this.currentAngleIndex] * this._radius);

        // Handle setup for next calculation
        this.currentAngleIndex++;
        if (this.currentAngleIndex === SIN_VALUES.length) {
            this.currentAngleIndex = 0;
        } // if

        return { x: newXCoordinate, y: newYCoordinate };
    } // followOrbit

} // Orbit