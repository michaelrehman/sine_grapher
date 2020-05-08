# TODO
A list of things that have yet to be implemented.

- [ ] [Sort](#sort)
- [x] [Map Out Characters in Coordinates](#map-out-characters-in-coordinates)
- [ ] [Move Circles to Mapped Coordinates](#move-circles-to-mapped-coordinates)
- [ ] [Check for BKSPC and Remove Character from Canvas](#check-for-bkspc-and-remove-character-from-canvas)

## Sort
This is to avoid looping through the loop unnecessarily with `Array.prototype.sort`.

Under `main.js`'s `FUNCTIONS`
```javascript
/**
 * Returns the index where newCircle can be inserted into
 * a Circle array such that the array is sorted by color.
 *
 * @private
 * @param {Circle}   newCircle     a new circle object
 * @param {Circle[]} circleArray   the array to sort through
 * @param {number}   originalIndex the index that newCircle
 *                                 was going to be inserted at
 * @return the index where newCircle can be inserted
 *         such that the array is sorted by color
 */
_getInsertIndexByColor(newCircle, circleArray, originalIndex) {
    let index = originalIndex - 1; // to get the previous circle
    let circleInArray = circleArray[index];
    while (index > 0 && newCircle.compareTo(circleInArray) > 0) {
        // update the index and get the next circle
        circleInArray = circleArray[--index];
    } // while
    return index;
}, // _getInsertIndexByColor
```

Under `main.js`'s `FUNCTIONS._createCircles()`
```javascript
// Done this way to avoid looping through the
// array twice with Array.sort and boost performance.
for (let i = 0; i < amount; i++) {
    const newCircle = this._createCircle();
    const insertIndex = this._getInsertIndexByColor(newCircle, circles, i);
    // start at insertIndex, delete 0 elements, and add the new circle
    circles.splice(insertIndex, 0, newCircle);
} // for
```

Under `Circle.js`
```javascript
/**
 * Returns 1 if this is greater than otherCircle
 * as determined by JavaScripts greater
 * than operator (>), and -1 otherwise.
 * @param {Circle} otherCircle the circle to compare this to
 * @return 1 if this is greater than otherCircle
 *         as determined by JavaScripts greater
 *         than operator (>), and -1 otherwise
 */
compareTo(otherCircle) {
    return this._color > otherCircle._color;
} // compareTo
```

#### Thoughts
The `_getInsertIndexByColor` method still loops through the array and if I knew how, I would provide time complexity estimate to gauge how effective this implementation is
Perhaps I should optimize `FUNCTIONS._createCircle` instead by setting a randomly determined quota of each color that sum up to `CIRCLE_AMOUNT`.

## Map Out Characters in Coordinates
- [x] represent each Character as a 2D number array
   - [x] create a secondary canvas element, draw the character, get array from image data, delete/clear extra canvas
   - [x] convert to 2D array
- [x] use a scalar to create coordinates from array indexes

## Move Circles to Mapped Coordinates
- [x] Generate and enlarge new circles
- [x] Animate circles in
- [ ] Move already existing characters when more are added or deleted (i.e., keep characters centered and have them wrap even with resize)
  - Includes updating "cursor position"

## Check for BKSPC and Remove Character from Canvas
- [ ] Keep track of which circles belong to which characters
- [ ] Update the destination of currently traveling circles
  - Includes updating "cursor position"