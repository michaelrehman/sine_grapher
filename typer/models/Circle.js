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
            _behavior: behavior
        });
    } // constructor

    /**
     * Moves the specified Circle
     * object to the specified coordinates.
     * @param {Circle} circle the Circle object to move
     * @param {number} x      the x-coordinate to move it to
     * @param {number} y      the y-coordinate to move it to
     */
    static moveCircleTo(circle, x, y) {
        Object.assign(circle, { _x: x, _y: y });
    } // moveTo

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
     * Updates this Circle's x and y
     * coordinates based on its velocities.
     * @param {number} bounds.width  the width of the container
     * @param {number} bounds.height the height of the container
     */
    update({ width: maxHorizontal, height: maxVertical }) {
        // STRONGLY disagree with this identation but whatever
        switch (this._behavior) {
        case CircleBehavior.AMBIENT:
            this._updateDX(0, maxHorizontal);
            this._updateDY(0, maxVertical);
            this._updatePosition();
            break;
        case CircleBehavior.REVOLVING:
            // TODO: handle behavior
            break;
        } // switch
    } // update

    /**
     * Sets the new behavior for this Circle object to use.
     * @param {CircleBehavior} newBehavior the new behavior
     * @throws {Error} if newBehavior is not one of CircleBehavior
     */
    setBehavior(newBehavior) {
        // Check if the valuse passed in is a key in the "enum".
        // Can check this way because the values === their key.
        if (!CircleBehavior[newBehavior]) {
            throw new Error('Invalid behavior.');
        } // if
        this._behavior = CircleBehavior[newBehavior];
    } // setBehavior

} // Circle