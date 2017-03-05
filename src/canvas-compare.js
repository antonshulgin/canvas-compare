// jshint esnext: true
(function (exports, undefined) {
	'use strict';

	exports.canvasCompare = canvasCompare;

	function canvasCompare(params) {
		if (!isObject(params)) {
			panic('no parameters provided');
			return;
		}

		const externals = {};

		readImages()
			.then(function (imageData) {
				const baseImage = imageData[0];
				const targetImage = imageData[1];
				console.log({
					baseImage: baseImage,
					targetImage: targetImage
				});
			})
			.catch(function (reason) {
				panic(reason);
				return;
			});

		return externals;

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
					return;
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
		const message = 'canvasCompare: ' + reason;
		console.error(message);
	}

})(this);
