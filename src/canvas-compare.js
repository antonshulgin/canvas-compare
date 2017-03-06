// jshint esnext: true
(function (exports, undefined) {
	'use strict';

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
				readDiffData()
					.then(function (diffData) {
						console.log(diffData);
					})
					.catch(panic);
			})
			.catch(panic);

		function readDiffData() {
			const CHANNEL_R = 0;
			const CHANNEL_G = 1;
			const CHANNEL_B = 2;
			const CHANNEL_A = 3;
			return new Promise(function (resolve, reject) {
				const baseImage = getBaseImage();
				if (!baseImage) {
					reject('baseImage is not set');
					return;
				}
				const baseData = baseImage.data;
				const targetImage = getTargetImage();
				if (!targetImage) {
					reject('targetImage is not set');
					return;
				}
				const targetData = targetImage.data;
				if (targetData.length !== baseData.length) {
					reject('mismatching image sizes');
					return;
				}
				const len = baseData.length;
				const width = baseImage.width;
				const height = baseImage.height;
				const diff = new Uint8ClampedArray(len);
				let idx = 0;
				let idxR, idxG, idxB;
				for (idx; idx < len; idx += 4) {
					idxR = idx + CHANNEL_R;
					idxG = idx + CHANNEL_G;
					idxB = idx + CHANNEL_B;
					diff[idxR] = baseData[idxR] - targetData[idxR];
					diff[idxG] = baseData[idxG] - targetData[idxG];
					diff[idxB] = baseData[idxB] - targetData[idxB];
					diff[idx + CHANNEL_A] = 255;
				}
				const diffData = new window.ImageData(diff, width, height);
				resolve(diffData);
			});
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
					const width = image.width;
					const height = image.height;
					canvas.width = width;
					canvas.height = height;
					const context = canvas.getContext('2d');
					context.drawImage(image, 0, 0);
					const imageData = context.getImageData(0, 0, width, height);
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
