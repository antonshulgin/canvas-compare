// jshint esnext: true
(function (exports, undefined) {
	'use strict';

	const CHANNEL_R = 0;
	const CHANNEL_G = 1;
	const CHANNEL_B = 2;
	const CHANNEL_A = 3;

	exports.canvasCompare = canvasCompare;

	function canvasCompare(params) {
		if (!isObject(params)) {
			panic('no parameters provided');
			return;
		}

		const internals = {};

		readImages()
			.then(function (imageData) {
				setBaseImage(imageData[0]);
				setTargetImage(imageData[1]);
				compareChannel(CHANNEL_R);
				compareChannel(CHANNEL_G);
				compareChannel(CHANNEL_B);
			})
			.catch(panic);

		// channel:
		// 0 - R
		// 1 - G
		// 2 - B
		function compareChannel(channel) {
			if (!isValidChannel(channel)) {
				panic('no valid channel provided');
				return;
			}
			const baseImage = getBaseImage();
			if (!baseImage) {
				return;
			}
			const baseData = baseImage.data;
			const targetImage = getTargetImage();
			if (!targetImage) {
				return;
			}
			const targetData = targetImage.data;
			if (targetData.length !== baseData.length) {
				panic('mismatching image sizes');
				return;
			}
			const len = baseData.length;
			const width = baseImage.width;
			const height = baseImage.height;
			let diff = new Uint8ClampedArray(len);
			let idx = 0;
			for (idx; idx < len; idx += 4) {
				diff[idx + channel] = baseData[idx] - targetData[idx];
				diff[idx + CHANNEL_A] = 255;
			}
			const diffData = new window.ImageData(diff, width, height);
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext('2d');
			context.putImageData(diffData, 0, 0);
			document.body.appendChild(canvas);
			console.log(diffData);
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

		function getTargetImage() {
			return internals.targetImage;
		}

		function setTargetImage(targetImage) {
			if (!isImageData(targetImage)) {
				panic('no valid targetImage provided');
				return;
			}
			internals.targetImage = targetImage;
		}

		function getBaseImage() {
			return internals.baseImage;
		}

		function setBaseImage(baseImage) {
			if (!isImageData(baseImage)) {
				panic('no valid baseImage provided');
				return;
			}
			internals.baseImage = baseImage;
		}
	}

	// Utility stuff

	function isValidChannel(item) {
		return isNumber(item) &&
			(item >= CHANNEL_R) &&
			(item <= CHANNEL_B);
	}

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
