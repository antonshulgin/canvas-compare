// jshint esnext: true
(function (outside, undefined) {
	'use strict';

	outside.canvasCompare = canvasCompare;

	function canvasCompare(params) {
		const instance = produceInstance(params);

		if (!instance) { return; }

		return readImages(instance)
			.then(onReadImages)
			.catch(panic);

		function onReadImages(images) {
			instance.setBaseImage(images[0]);
			instance.setTargetImage(images[1]);
			return compare(instance);
		}
	}

	// Instance-independent logic

	function compare(instance) {
		const baseImage = instance.getBaseImage();
		const targetImage = instance.getTargetImage();
		const threshold = instance.getThreshold(); 
	}

	function readImages(instance) {
		const baseImageUrl = instance.getBaseImageUrl();
		const targetImageUrl = instance.getTargetImageUrl();
		const scale = instance.getScale();
		return Promise.all([
			readImage(baseImageUrl, scale),
			readImage(targetImageUrl, scale)
		]);
	}

	function readImage(imageUrl, scale) {
		return new Promise(promiseReadImage);

		function promiseReadImage(resolve, reject) {
			const image = new Image();
			image.src = imageUrl;
			image.addEventListener('load', onLoad, false);
			image.addEventListener('error', onError, false);

			function onLoad() {
				const width = image.width * scale;
				const height = image.height * scale;
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const context = canvas.getContext('2d');
				context.drawImage(image, 0, 0, width, height);
				const imageData = context.getImageData(0, 0, width, height);
				if (!isImageData(imageData)) {
					reject('Failed to extract ImageData from `' + imageUrl + '`');
				}
				resolve(imageData);
			}

			function onError() {
				reject('Failed to load `' + imageUrl + '`');
			}
		}
	}

	// Instance logic

	function produceInstance(params) {
		const internals = {};
		const externals = {};

		if (!isObject(params)) {
			return panic('No parameters provided');
		}
		if (!setBaseImageUrl(params.baseImageUrl)) { return; }
		if (!setTargetImageUrl(params.targetImageUrl)) { return; }

		setScale(params.scale);
		setThreshold(params.threshold);

		externals.getTargetImageUrl = getTargetImageUrl;
		externals.getBaseImageUrl = getBaseImageUrl;
		externals.getScale = getScale;
		externals.getThreshold = getThreshold;
		externals.setBaseImage = setBaseImage;
		externals.getBaseImage = getBaseImage;
		externals.setTargetImage = setTargetImage;
		externals.getTargetImage = getTargetImage;

		return externals;

		function getTargetImage() {
			return internals.targetImage;
		}

		function setTargetImage(imageData) {
			if (!isImageData(imageData)) {
				return panic('No targetImageData prodided');
			}
			internals.targetImage = imageData;
			return getTargetImage();
		}

		function getBaseImage() {
			return internals.baseImage;
		}

		function setBaseImage(imageData) {
			if (!isImageData(imageData)) {
				return panic('No baseImageData prodided');
			}
			internals.baseImage = imageData;
			return getBaseImage();
		}

		function getTargetImageUrl() {
			return internals.targetImageUrl;
		}

		function setTargetImageUrl(targetImageUrl) {
			if (!isNonEmptyString(targetImageUrl)) {
				return panic('Failed to set targetImageUrl: `' + targetImageUrl + '`');
			}
			internals.targetImageUrl = targetImageUrl;
			return getTargetImageUrl();
		}

		function getBaseImageUrl() {
			return internals.baseImageUrl;
		}

		function setBaseImageUrl(baseImageUrl) {
			if (!isNonEmptyString(baseImageUrl)) {
				return panic('Failed to set baseImageUrl: `' + baseImageUrl + '`');
			}
			internals.baseImageUrl = baseImageUrl;
			return getBaseImageUrl();
		}

		function getThreshold() {
			return internals.threshold;
		}

		function setThreshold(threshold) {
			internals.threshold = sanitizeThreshold(threshold);
		}

		function getScale() {
			return internals.scale;
		}

		function setScale(scale) {
			internals.scale = sanitizeScale(scale);
		}
	}

	// Utility stuff

	function sanitizeThreshold(threshold) {
		const MIN_THRESHOLD = 0;
		const MAX_THRESHOLD = 255;
		if (!isNumber(threshold)) {
			return MIN_THRESHOLD;
		}
		if (threshold > MAX_THRESHOLD) {
			return MAX_THRESHOLD;
		}
		if (threshold < MIN_THRESHOLD) {
			return MIN_THRESHOLD;
		}
		return threshold;
	}

	function sanitizeScale(scale) {
		const MIN_SCALE = 0.1;
		const MAX_SCALE = 1;
		if (!isNumber(scale)) {
			return MAX_SCALE;
		}
		if (scale > MAX_SCALE) {
			return MAX_SCALE;
		}
		if (scale < MIN_SCALE) {
			return MIN_SCALE;
		}
		return scale;
	}

	function isImageData(item) {
		return toStringCall(item) === '[object ImageData]';
	}

	function isNumber(item) {
		return (toStringCall(item) === '[object Number]') &&
			isFinite(item);
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
		console.error(reason);
		return;
	}

})(this);
