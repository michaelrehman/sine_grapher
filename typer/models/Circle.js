/**
 * Class representing a Circle that can move within a canvas element.
 */
export class Circle {

    /**
     * Constructs a new Circle object.
     *
     * @param {number} config.x     x-coodinate of this Circle
     * @param {number} config.y     y-coordinate of this Circle
     * @param {number} config.dx    x-velocity of this Circle
     * @param {number} config.dy    y-velocity of this Circle
     * @param {string} config.color color of this Circle
     */
    constructor({ x, y, radius, dx, dy, color }) {
        Object.assign(this, {
            _x: x,
            _y: y,
            _dx: dx,
            _dy: dy,
            _radius: radius,
            _color: color
        });
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
        this._updateDX(0, maxHorizontal);
        this._updateDY(0, maxVertical);
        this._updatePosition();
    } // update

} // Circle