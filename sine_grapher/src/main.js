import { Bar } from '../models/Bar.js';
import {
    SIN_VALUES, BAR_WIDTH, BAR_HEIGHT_SCALAR, BAR_AMOUNT, BAR_GAP_SCALAR,
    GROW_FRAMES, HEIGHT_THRESHOLD, FILL_COLOR, LINE_COLOR
} from './initial.js';

/**
 * All values that the user can affect.
 * @namespace
 */
const CONTROLS = {
    BAR_WIDTH, BAR_HEIGHT_SCALAR, GROW_FRAMES,
    BAR_GAP_SCALAR, FILL_COLOR, LINE_COLOR,
    BAR_GAP: function() {
        // The space between the left side of bars.
        // I.e., the bar's width and then some
        return this.BAR_WIDTH * this.BAR_GAP_SCALAR;
    }
};

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
 * Sets the colors of the canvas context.
 */
const setColors = () => {
    ctx.strokeStyle = CONTROLS.LINE_COLOR;
    ctx.fillStyle = CONTROLS.FILL_COLOR;
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
    const cycleWidth = CONTROLS.BAR_GAP() * BAR_AMOUNT;
    let cyclesThatCanFit = Math.floor(canvas.width / cycleWidth) || 1;
    bars = Object.freeze(makeSinBars(BAR_AMOUNT * cyclesThatCanFit));
    // canvas styles
    ctx.lineWidth = 8;
    setColors();
};

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
    const start = canvasCenterX + (0 - bars.length / 2) * CONTROLS.BAR_GAP();
    const end = canvasCenterX + (bars.length - bars.length / 2) * CONTROLS.BAR_GAP();
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
        const offset = (i - bars.length / 2) * CONTROLS.BAR_GAP();

        // Draw the bar onto the canvas
        const x = canvasCenterX + offset;
        const y = canvasCenterY;
        ctx.fillRect(x, y, CONTROLS.BAR_WIDTH, bar.height * CONTROLS.BAR_HEIGHT_SCALAR);

        bar.grow(CONTROLS.GROW_FRAMES); // called once per animation frame

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

// gui
const GUI = new dat.GUI();
GUI.add(CONTROLS, 'BAR_HEIGHT_SCALAR');
GUI.add(CONTROLS, 'GROW_FRAMES', 1, 100, 1);

const widthControls = GUI.addFolder('Width Controls');
widthControls.add(CONTROLS, 'BAR_WIDTH', 1);
widthControls.add(CONTROLS, 'BAR_GAP_SCALAR', 1);

const colorControls = GUI.addFolder('Color Controls');
colorControls.addColor(CONTROLS, 'FILL_COLOR');
colorControls.addColor(CONTROLS, 'LINE_COLOR');

// events
window.addEventListener('resize', init);
widthControls.__controllers.forEach((controller) => controller.onChange(init));
colorControls.__controllers.forEach((controller) => controller.onChange(setColors));

// get things started
const bootSequence = [init, update];
bootSequence.forEach((method) => method());