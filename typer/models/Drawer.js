/**
 * Class that handles drawing onto a canvas.
 */
export class Drawer {

    /**
     * Constructs a new Drawer object.
     * @param {HTMLCanvasElement} canvas the canvas object to draw on
     */
    constructor(canvas) {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
    } // constructor

    /**
     * Handles all necessary operations when the window is resized.
     * This includes resizing the canvas and finding the canvas center.
     * @returns {object} an object containing the canvas center's coordinates
     */
    init() {
        // canvas width
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
        // canvas center
        const canvasCenterX = this._canvas.width / 2;
        const canvasCenterY = this._canvas.height / 2;

        return { canvasCenterX, canvasCenterY };
    } // init

    /**
     * Clears the canvas.
     */
    clear() {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    } // clear

    /**
     * Draws the passed in object onto the canvas.
     * @param {function} drawMethod the method to use to draw with parameters
     *                              already applied using Function.bind
     * @param {string}   fillColor  the color to use for the fill
     */
    draw(drawMethod, fillColor) {
        this._context.beginPath();
        drawMethod();

        // Only change the color if it's not already that color
        if (this._context.fillStyle.toLowerCase() !== fillColor.toLowerCase()) {
            this._context.fillStyle = fillColor;
        } // if

        this._context.fill();
    } // draw

} // Drawer