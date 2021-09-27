import { FONT_SIZE, ALL_CHARS } from '../src/constants.js';

/**
 * Class used to map characters to arrays.
 */
export class CharacterMapper {

    /**
     * Contructs a new CharacterMapper object.
     */
    constructor() {
        // Create a square to draw characters in
        const canvas = document.createElement('canvas');
        canvas.width = FONT_SIZE + 5; // include an extra 5px for padding
        canvas.height = canvas.width;
        // set instance variables
        Object.assign(this, {
            _canvas: canvas,
            _context: canvas.getContext('2d', { alpha: false }),
            _canvasCenterX: canvas.width / 2,
            _canvasCenterY: canvas.height / 2,
            _canvasCorners: [0, 0, canvas.width, canvas.height],
            _alreadyCalculated: {}
        });
        // set font weight to something larger and center text
        this._context.font = `${FONT_SIZE}px Gotu`;
        this._context.fillStyle = '#ffffff';
        this._context.textAlign = 'center';
        this._context.textBaseline = 'middle';

        // Precalculate common characters [a-zA-Z]
        this.getArrayForAll();
    } // constructor

    getArrayForAll() {
        for (let i = 0; i < ALL_CHARS.length; i++) {
            this.getArrayFor(ALL_CHARS.charAt(i));
        } // for
    } // getArrayForAll

    /**
     * Returns an array representing the character passed in.
     * @param {string} character the character to create an array for
     * @throws {Error} if character is not a string nor is a length of one
     * @return an array representing the character passed in
     *         where a truthy index indicates that a pixel is present
     */
    getArrayFor(character) {
        if (typeof character !== 'string' || character.length !== 1) {
            throw new Error('Argument must be a string of one length.');
        } // if

        // check if the array for this character has already been calculated
        const _2dCharacterArray = this._alreadyCalculated[character];
        if (_2dCharacterArray) {
            return _2dCharacterArray;
        } // if

        // draw character and get image data array
        this._context.fillText(character, this._canvasCenterX, this._canvasCenterY);
        const imageDataArray = this._context.getImageData(...this._canvasCorners).data;

        // get the 2D version
        const _2dVersion = this._convertTo2DArray(imageDataArray);
        // add it to a cache avoid recalculating it
        this._alreadyCalculated[character] = _2dVersion;
        console.log(this._alreadyCalculated);

        // clear canvas for next character
        this._context.clearRect(...this._canvasCorners);

        return _2dVersion;
    } // getArrayFor

    /**
     * Returns the trimmed 2D version of an image data array.
     * @private
     * @param {Uint8ClampedArray} imageArray an image data array to convert
     * @return the 2D version of an image data array
     */
    _convertTo2DArray(imageArray) {
        // The image data array has elements in the order of RGBA,
        // so its length is quadrupled. This project cares not for color
        // and just needs to know if a pixel is present, so increment by 4.

        // The looping is done this way to maximize performance.
        // See the following for elaboration:
        // https://stackoverflow.com/questions/5349425/whats-the-fastest-way-to-loop-through-an-array-in-javascript
        // Also, forEach is not defined for this type.
        let currentRow = [];
        const _2dVersion = [];
        const imageArrayLength = imageArray.length;
        for (let i = 0; i < imageArrayLength; i += 4) {
            // switch to a new row if necessary
            if (currentRow.length === this._canvas.width) {
                _2dVersion.push(currentRow);
                currentRow = [];
            } // if

            // get byte representing the color from image data array
            const imageByteColor = imageArray[i];

            // 255 because font color was set to #ffffff in constructor.
            // Can't use black because that's the default.
            if (imageByteColor === 255) {
                currentRow.push(CharacterMapper.pixelPresent);
            } else {
                currentRow.push(CharacterMapper.pixelNotPresent);
            } // if
        } // for

        this._trimExcess(_2dVersion); // don't want to cahce empty columns
        return _2dVersion;
    } // _convertTo2DArray

    /**
     * Returns an integer denoting the "width" of an array,
     * which I define as the index of the last truthy value
     * minus the index of the first truthy value plus one.
     *
     * A negative width indicates that no truthy values were found.
     *
     * @param {!object[][]} array the array of whose "width" to calculate
     * @return the "width", as defined above, of array
     */
     _getArrayWidth(array) {
        let firstElementIndex = -1;
        let lastElementIndex = -1;
        array.forEach((row) => {
            row.forEach((elem, i) => {
                if (elem && (firstElementIndex < 0 || i < firstElementIndex)) {
                    firstElementIndex = i;
                    lastElementIndex = i;
                } else if (elem && i > lastElementIndex) {
                    lastElementIndex = i;
                }// if
            });
        });
        return [lastElementIndex - firstElementIndex + 1, firstElementIndex];
    } // getArrayWidth

    /**
     * Trims columns that contain no truthy values.
     * @param {!object[]][]} array
     */
    _trimExcess(array) {
        const [width, first] = this._getArrayWidth(array);
        array.forEach((row) => {
            row.splice(0, first); // the first truthy index is also the number of elements before that index
            row.splice(width, row.length); // the width indicates the distance from the first truthy index to the last
        });
    } // trimExcess

} // CharacterMapper

// Because not all browsers support using `static`
/** Value representing that a pixel of the character is present. */
CharacterMapper.pixelPresent = 1;
/** Value representing that a pixel of the character is not present. */
CharacterMapper.pixelNotPresent = 0;