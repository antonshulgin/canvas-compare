# canvas-compare

Compare two images to get their by-pixel diff, similarity percentage and stuff.

# Usage

```javascript
const promiseCompare = canvasCompare({
	baseImageUrl: '/path/to/base/image.jpeg',
	targetImageUrl: '/path/to/target/picture.png',
	scale: 0.5, // 0.01..1, optional, defaults to 1
	threshold: 10, // 0..255, optional, defaults to 0
	isNormalized: true // Boolean, optional, defaults to false
});

promiseCompare.then(function(result) {
	// Do things with result
});

promiseCompare.catch(function (reason) {
	// Handle the error
});
```

## `baseImageUrl`
Non-empty string, required.

## `targetImageUrl`
Non-empty string, required.

## `scale`
Float number between `0.01` and `1`, optional, defaults to `1`.

The lower the value, the smaller the resulting diff. Might be helpful when dealing with large images.

## `threshold`
Integer between `0` and `255`, optional, defaults to `0`.

## `isNormalized`
Boolean, optional, defaults to `false`.
