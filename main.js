import { Bar } from './models/Bar.js';
import { RADIANS, BAR_WIDTH, BAR_GAP, BAR_HEIGHT_SCALER, BAR_AMOUNT } from './constants.js';

// Javadoc comments are used to provide Intellisense for VSCode.

// Initial setup
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let canvasCenterX = undefined;
let canvasCenterY = undefined;

/**
 * Resizes the canvas to match the window dimensions.
 */
const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasCenterX = canvas.width / 2;
    canvasCenterY = canvas.height / 2;
};

resize(); // inital resize
window.addEventListener('resize', resize);

/**
 * Creates a mapping of all values on the unit
 * circle to their sin value according to Math.sin.
 */
const getSinValues = () => {
    const sinValues = [];
    RADIANS.forEach((radian) => {
        sinValues.push(Math.sin(radian));
    });
    return sinValues;
};

/**
 * Makes an array containing the number of Bar objects specified.
 * The height of each Bar objects is set according to a sine wave.
 *
 * @param {number} amount the number of bar objects to make
 * @returns an array containing Bar objects
 */
const makeSinBars = (amount) => {
    // Get sin values and declare a
    // variable to keep track of the
    // current sin value to use.
    let sinTracker = 0;
    const sinValues = getSinValues();

    const bars = [];
    for (let i = 0; i < amount; i++) {
        // Reset sinTracker to the
        // beginning if it reaches the end.
        if (sinTracker >= sinValues.length) {
            sinTracker = 0;
        } // if

        const selectedSinValue = sinValues[sinTracker++];
        bars.push(new Bar(selectedSinValue));
    } // for
    return bars;
};

/**
 * The Bar objects to be drawn
 * and animated onto the canvas.
 */
const BARS = Object.freeze(makeSinBars(BAR_AMOUNT));

/**
 * Sets the Bar objects' nextHeight property.
 *
 * Because BARS.indexOf(bar.height) does not work,
 * this method works be setting the height value
 * of bars to the left bar's height. The leftmost
 * bar's height is set to the height value of the
 * rightmost bar before it was modified.
 *
 * This gives the illusion of the bars moving right.
 */
const shift = () => {
    const rightMostBarHeight = BARS[BARS.length - 1].height;
    for (let i = BARS.length - 1; i > 0; i--) {
        BARS[i].height = BARS[i - 1].height;
    } // for
    BARS[0].height = rightMostBarHeight;
};

/**
 * Draws the center x-axis that
 * scales with the amount of bars.
 */
const drawBaseLine = () => {
    const start = canvasCenterX + (0 - BARS.length / 2) * BAR_GAP;
    const end = canvasCenterX + (BARS.length - BARS.length / 2) * BAR_GAP;
    ctx.beginPath();
    ctx.moveTo(start, canvasCenterY);
    ctx.lineTo(end, canvasCenterY);
    ctx.stroke();
};

/**
 * Draws and animates elements onto the canvas.
 */
const update = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBaseLine();
    BARS.forEach((bar, i) => {
        // Multiply by (i - BARS.length / 2) so that each
        // new bar starts at a new location depending on its index.
        // I.e., If i is less than the middle index, it
        // moves (i - BARS.length / 2) bar gaps to the left;
        // the same applies if i is greater,
        // but it will move right instead.
        const barGap = (i - BARS.length / 2) * BAR_GAP;
        const x = canvasCenterX + barGap;
        const y = canvasCenterY;
        ctx.fillRect(x, y, BAR_WIDTH, bar.height * BAR_HEIGHT_SCALER);
    });
    shift();
    requestAnimationFrame(update);
};

// start the animation
update();