// jshint esnext: true
(function (exports, undefined) {
	'use strict';

	exports.canvasCompare = canvasCompare;

	function canvasCompare(params) {
		if (!isObject(params)) {
			panic('no parameters provided');
			return;
		}

		readImages()
			.then(function (imageData) {
				const baseImage = imageData[0];
				const targetImage = imageData[1];
				compareChannel(0, baseImage, targetImage);
			})
			.catch(panic);

		// channel:
		// 0 - R
		// 1 - G
		// 2 - B
		// 3 - A
		function compareChannel(channel, baseImage, targetImage) {
			if (!isNumber(channel)) {
				panic('no valid channel provided');
				return;
			}
			let idx = channel;
			if (!isImageData(baseImage)) {
				panic('no valid baseImage provided');
				return;
			}
			const baseData = baseImage.data;
			const width = baseImage.width;
			const height = baseImage.height;
			if (!isImageData(targetImage)) {
				panic('no valid targetImage provided');
				return;
			}
			const targetData = targetImage.data;
			if (targetData.length !== baseData.length) {
				panic('images have different sizes');
				return;
			}
			const len = baseData.length;
			let diff = new Uint8ClampedArray(len);
			for (idx; idx < len; idx += 4) {
				diff[idx] = baseData[idx] - targetData[idx];
				diff[idx + 3] = 255;
			}
			const diffData = new window.ImageData(diff, width, height);
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext('2d');
			context.putImageData(diffData, 0, 0);
			document.body.appendChild(canvas);
		}

		function readImages() {
			return Promise.all([
				readImageData(params.baseImage),
				readImageData(params.targetImage)
			]);
		}

		function readImageData(imageUrl) {
			return new Promise(function (resolve, reject) {
				if (!isNonEmptyString(imageUrl)) {
					reject('no image URL provided');
					return;
				}

				const image = new Image();
				image.src = imageUrl;
				image.addEventListener('load', onLoad, false);
				image.addEventListener('error', onError, false);

				function onError() {
					reject('failed to load image `' + imageUrl + '`');
				}

				function onLoad() {
					const canvas = document.createElement('canvas');
					canvas.width = image.width;
					canvas.height = image.height;

					const context = canvas.getContext('2d');
					context.drawImage(image, 0, 0);

					const imageData = context.getImageData(0, 0, image.width, image.height);

					resolve(imageData);
				}
			});
		}
	}

	// Utility stuff

	function isNumber(item) {
		return (toStringCall(item) === '[object Number]') &&
			isFinite(item);
	}

	function isImageData(item) {
		return toStringCall(item) === '[object ImageData]';
	}

	function isNonEmptyString(item) {
		return (toStringCall(item) === '[object String]') &&
			(item.length > 0);
	}

	function isObject(item) {
		return toStringCall(item) === '[object Object]';
	}

	function toStringCall(item) {
		return Object.prototype.toString.call(item);
	}

	function panic(reason) {
		console.error('canvas-compare: ' + reason);
	}

})(this);
