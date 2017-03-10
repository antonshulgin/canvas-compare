// jshint esnext: true
(function (exports, undefined) {
	'use strict';

	exports.canvasCompare = canvasCompare;

	const ERR_NO_PARAMS = 'No params provided';
	const ERR_NO_IMAGE_URL = 'No imageUrl provided';
	const ERR_NO_BASE_IMAGE_URL = 'No valid baseImageUrl provided';
	const ERR_NO_TARGET_IMAGE_URL = 'No valid targetImageUrl provided';

	function canvasCompare(params) {
		const internals = {};
		const externals = {};
		if (!isObject(params)) {
			panic(ERR_NO_PARAMS);
			return;
		}
		if (!setBaseImageUrl(params.baseImageUrl)) {
			return;
		}
		if (!setTargetImageUrl(params.targetImageUrl)) {
			return;
		}

		externals.compare = compare;

		return externals;

		function compare() {
			const baseImageUrl = getBaseImageUrl();
			if (!baseImageUrl) {
				return;
			}
			const targetImageUrl = getTargetImageUrl();
			if (!targetImageUrl) {
				return;
			}
		}

		function getTargetImageUrl() {
			return internals.targetImageUrl;
		}

		function setTargetImageUrl(targetImageUrl) {
			if (!isNonEmptyString(targetImageUrl)) {
				panic(ERR_NO_TARGET_IMAGE_URL);
				return;
			}
			internals.targetImageUrl = targetImageUrl;
			return getTargetImageUrl();
		}

		function getBaseImageUrl() {
			return internals.baseImageUrl;
		}

		function setBaseImageUrl(baseImageUrl) {
			if (!isNonEmptyString(baseImageUrl)) {
				panic(ERR_NO_BASE_IMAGE_URL);
				return;
			}
			internals.baseImageUrl = baseImageUrl;
			return getBaseImageUrl();
		}
	}

	function readImage(imageUrl) {
		return new Promise(promiseReadImage);

		function promiseReadImage(resolve, reject) {
			if (!isNonEmptyString(imageUrl)) {
				reject(ERR_NO_IMAGE_URL);
				return;
			}
			const image = new Image();
			image.src = imageUrl;
			image.addEventListener('load', onLoad, false);
			image.addEventListener('error', onError, false);

			function onLoad() {
				const canvas = document.createElement('canvas');
				const width = image.width;
				const height = image.height;
				canvas.width = width;
				canvas.height = height;
				const context = canvas.getContext('2d');
				context.drawImage(image, 0, 0);
				const imageData = context.getImageData(0, 0, width, height);
				if (!isImageData(imageData)) {
					reject('Failed to extract imageData from ' + imageUrl);
					return;
				}
				resolve(imageData);
			}

			function onError() {
				reject('Failed to load ' + imageUrl);
			}
		}
	}

	// Utility stuff

	function isNonEmptyArray(item) {
		return (toStringCall(item) === '[object Array]') &&
			(item.length > 0);
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
