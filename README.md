# canvas-compare

Compare two images to get their by-pixel diff, similarity percentage and stuff.


## Usage

```javascript
const promiseCompare = canvasCompare({
	baseImageUrl: '/path/to/base/image.jpeg',
	targetImageUrl: '/path/to/target/picture.png',
	scale: 0.5, // 0.01..1, optional, defaults to 1
	threshold: 10, // 0..255, optional, defaults to 0
	isNormalized: true // Boolean, optional, defaults to false
});

promiseCompare.then(function (result) {
	// Do things with result
});

promiseCompare.catch(function (reason) {
	// Handle the error
});
```


## Parameters

### params.baseImageUrl

Non-empty string, required.

### params.targetImageUrl

Non-empty string, required.

### params.scale

Float number between `0.01` and `1`, optional, defaults to `1`.

The lower the value, the smaller the resulting diff. Might be helpful when dealing with large images.

### params.threshold

Integer between `0` and `255`, optional, defaults to `0`.

If the passed value is greater than `threshold`, it drops to `0`. Useful to filter out noise and adjust overall sensitivity.

### params.isNormalized (Not implemented)

Boolean, optional, defaults to `false`.

If the passed value is not a zero, it's set to `255`. In short all the values in a normalized image are either `0`, or `255`.


## Result

The `result` object is returned when the promise is resolved. It consists of a bunch of getters:

### result.getImage(isNormalized)

Returns `ImageData` with the diff.

### result.getPixels()

Returns a number of non-zero-value pixels in the diff.

### result.getPercentage()

Returns percentage of non-zero-value pixels in the diff.

### result.producePreview()

Returns an `<img>` element with the diff representation.
