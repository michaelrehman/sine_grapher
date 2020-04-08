import { Bar } from '../models/Bar.js';
import {
    SIN_VALUES, BAR_WIDTH, BAR_GAP, BAR_HEIGHT_SCALAR, BAR_AMOUNT,
    GROW_FRAMES, HEIGHT_THRESHOLD, FILL_COLOR, CYCLE_WIDTH
} from './constants.js';

// Initial setup/globals
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let canvasCenterX = undefined;
let canvasCenterY = undefined;

let bars = null;

/**
 * Makes an array containing the number of Bar objects specified.
 * The height of each Bar objects is set according to a sine wave.
 *
 * @param {number} amount the number of bar objects to make
 * @return an array containing Bar objects
 */
const makeSinBars = (amount) => {
    // Get sin values and declare a
    // variable to keep track of the
    // current sin value to use.
    let sinTracker = 0;
    const bars = [];
    for (let i = 0; i < amount; i++) {
        // Reset sinTracker to the
        // beginning if it reaches the end.
        if (sinTracker >= SIN_VALUES.length) {
            sinTracker = 0;
        } // if

        const selectedSinValue = SIN_VALUES[sinTracker++];
        const nextSinValue = SIN_VALUES[sinTracker];
        bars.push(new Bar(selectedSinValue, nextSinValue));
    } // for
    return bars;
};

/**
 * Handles all necessary operations when the window is resized.
 * This includes resizing the canvas, finding the canvas center,
 * calculating the number of cycles that can fit, abd setting
 * the styles of the canvas.
 */
const init = () => {
    // canvas width
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // canvas center
    canvasCenterX = canvas.width / 2;
    canvasCenterY = canvas.height / 2;
    // bar cycles
    let cyclesThatCanFit = Math.floor(canvas.width / CYCLE_WIDTH) || 1;
    bars = Object.freeze(makeSinBars(BAR_AMOUNT * cyclesThatCanFit));
    // canvas styles
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#aa00aa';
    ctx.fillStyle = FILL_COLOR;
};

window.addEventListener('resize', init);

/**
 * Sets the Bar objects' nextHeight property.
 *
 * Because bars.indexOf(bar.height) does not work,
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
    const rightMostBarHeight = bars[bars.length - 1].nextHeight;
    for (let i = bars.length - 1; i > 0; i--) {
        bars[i].nextHeight = bars[i - 1].nextHeight;
    } // for
    bars[0].nextHeight = rightMostBarHeight;
};

/**
 * Draws the center x-axis that
 * scales with the amount of bars.
 */
const drawBaseLine = () => {
    const start = canvasCenterX + (0 - bars.length / 2) * BAR_GAP;
    const end = canvasCenterX + (bars.length - bars.length / 2) * BAR_GAP;
    ctx.beginPath();
    ctx.moveTo(start, canvasCenterY);
    ctx.lineTo(end, canvasCenterY);
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
    bars.forEach((bar, i) => {
        // Multiply by (i - BARS.length / 2) so that each
        // new bar starts at a new location depending on its index.
        // I.e., If i is less than the middle index, it
        // moves (i - BARS.length / 2) bar gaps to the left;
        // the same applies if i is greater,
        // but it will move right instead.
        const offset = (i - bars.length / 2) * BAR_GAP;

        // Draw the bar onto the canvas
        const x = canvasCenterX + offset;
        const y = canvasCenterY;
        ctx.fillRect(x, y, BAR_WIDTH, bar.height * BAR_HEIGHT_SCALAR);

        bar.grow(GROW_FRAMES); // called once per animation frame

        // Check for any bars that have not grown to their next height
        // within a certain threshold. This is because the values will
        // not be exact.
        if (!bar.isNextHeight(HEIGHT_THRESHOLD)) {
            allReachedNextHeight = false;
        } // if
    });

    // Set the nextHeight property if all bars have reached it.
    if (allReachedNextHeight) {
        shift();
    }

    requestAnimationFrame(update);
};

init();
update(); // start the animation