import { Bar } from './models/Bar.js';
import { RADIANS, BAR_WIDTH, BAR_GAP, BAR_HEIGHT_SCALER, BAR_AMOUNT, GROW_FRAMES, HEIGHT_THRESHOLD, FILL_COLOR } from './constants.js';

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
        const nextSinValue = sinValues[sinTracker];
        bars.push(new Bar(selectedSinValue, nextSinValue));
    } // for
    return bars;
};

/**
 * The Bar objects to be drawn
 * and animated onto the canvas.
 */
const BARS = Object.freeze(makeSinBars(BAR_AMOUNT * 3));

/**
 * This method calls the grow
 * method for each bar object.
 * @param {number} framesToGrowIn the number of frames to reach nextHeight by
 */
const growBars = (framesToGrowIn) => {
    BARS.forEach((bar) => {
        // console.log(bar.nextHeight, bar.height, framesToGrowIn);
        const growAmount = (bar.nextHeight - bar.height) / framesToGrowIn;
        bar.grow(growAmount);
    });
};

/**
 * Sets the Bar objects' nextHeight property.
 *
 * Because BARS.indexOf(bar.height) does not work,
 * this method works be setting the nextHeight value
 * of bars to the left bar's nextHeight. The leftmost
 * bar's nextHeight is set to the nextHeight value of the
 * rightmost bar before it was modified (this assumes
 * that the number of bars is a multiple of the number
 * values in RADIANS).
 *
 * This gives the illusion of the bars moving right.
 */
const shift = () => {
    const rightMostBarHeight = BARS[BARS.length - 1].nextHeight;
    for (let i = BARS.length - 1; i > 0; i--) {
        BARS[i].nextHeight = BARS[i - 1].nextHeight;
    } // for
    BARS[0].nextHeight = rightMostBarHeight;
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
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#aa00aa';
    ctx.stroke();
};

/**
 * Draws and animates elements onto the canvas.
 */
const update = () => {
    // Reset for new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBaseLine();

    let allReachedNextHeight = true;
    BARS.forEach((bar, i) => {
        // Multiply by (i - BARS.length / 2) so that each
        // new bar starts at a new location depending on its index.
        // I.e., If i is less than the middle index, it
        // moves (i - BARS.length / 2) bar gaps to the left;
        // the same applies if i is greater,
        // but it will move right instead.
        const barGap = (i - BARS.length / 2) * BAR_GAP;

        // Draw the bar onto the canvas
        const x = canvasCenterX + barGap;
        const y = canvasCenterY;
        ctx.fillStyle = FILL_COLOR;
        ctx.fillRect(x, y, BAR_WIDTH, bar.height * BAR_HEIGHT_SCALER);

        // Check for any bars that have not grown to their next height
        // within a certain threshold. This is because the values will
        // not be exact.
        if (!bar.isNextHeight(HEIGHT_THRESHOLD)) {
            allReachedNextHeight = false;
        }
    });

    // Set the nextHeight property if all bars have reached it.
    if (allReachedNextHeight) {
        shift();
    }
    growBars(GROW_FRAMES); // called once per animation frame

    requestAnimationFrame(update);
};

// start the animation
update();