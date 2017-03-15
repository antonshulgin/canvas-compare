// jshint esnext: true
(function (outside) {
	'use strict';

	const ImageData = outside.ImageData;

	outside.canvasCompare = canvasCompare;

	function canvasCompare(params) {
		const instance = produceInstance(params);

		if (!instance) {
			return Promise.reject('Failed to instantiate');
		}

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
		return new Promise(promiseCompare);

		function promiseCompare(resolve, reject) {
			const baseImage = instance.getBaseImage();
			const targetImage = instance.getTargetImage();
			const isSameWidth = (baseImage.width === targetImage.width);
			const isSameHeight = (baseImage.height === targetImage.height);
			if (!isSameWidth || !isSameHeight) {
				return reject('Image size mismatch');
			}
			const baseData = baseImage.data;
			const targetData = targetImage.data;
			const dataLength = baseData.length;
			const diffData = new Uint8ClampedArray(dataLength);
			var idxR, idxG, idxB, idxA;
			var diffR, diffG, diffB;
			for (var idx = 0; idx < dataLength; idx += 4) {
				idxR = idx + 0;
				idxG = idx + 1;
				idxB = idx + 2;
				idxA = idx + 3;
				diffR = Math.abs(baseData[idxR] - targetData[idxR]);
				diffG = Math.abs(baseData[idxG] - targetData[idxG]);
				diffB = Math.abs(baseData[idxB] - targetData[idxB]);
				diffData[idxR] = applyAdjustments(diffR, instance);
				diffData[idxG] = applyAdjustments(diffG, instance);
				diffData[idxB] = applyAdjustments(diffB, instance);
				diffData[idxA] = 255;
			}
			const width = baseImage.width;
			const height = baseImage.height;
			const diffImage = new ImageData(diffData, width, height);
			return resolve(produceDiffResult(diffImage, instance));
		}
	}

	function applyAdjustments(value, instance) {
		var adjustedValue = value;
		adjustedValue = applyThreshold(adjustedValue, instance.getThreshold());
		adjustedValue = applyNormalization(adjustedValue, instance.isNormalized());
		return adjustedValue;
	}

	function applyNormalization(value, isNormalized) {
		if (!isNormalized) {
			return value;
		}
		return (value > 0) ? 255 : 0;
	}

	function applyThreshold(value, threshold) {
		return (value > threshold) ? value : 0;
	}

	function readImages(instance) {
		const baseImageUrl = instance.getBaseImageUrl();
		const targetImageUrl = instance.getTargetImageUrl();
		const resolution = instance.getResolution();
		return Promise.all([
			readImage(baseImageUrl, resolution),
			readImage(targetImageUrl, resolution)
		]);
	}

	function readImage(imageUrl, resolution) {
		return new Promise(promiseReadImage);

		function promiseReadImage(resolve, reject) {
			const image = new Image();
			image.src = imageUrl;
			image.addEventListener('load', onLoad, false);
			image.addEventListener('error', onError, false);

			function onLoad() {
				const width = image.width * resolution;
				const height = image.height * resolution;
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const context = canvas.getContext('2d');
				context.drawImage(image, 0, 0, width, height);
				const imageData = context.getImageData(0, 0, width, height);
				if (!isImageData(imageData)) {
					return reject('Failed to extract ImageData from `' + imageUrl + '`');
				}
				return resolve(imageData);
			}

			function onError() {
				return reject('Failed to load `' + imageUrl + '`');
			}
		}
	}

	// Diff result logic
	
	function produceDiffResult(diffImage, instance) {
		const internals = {};
		const externals = {};

		if (!setImage(diffImage)) { return; }

		externals.getImage = getImage;
		externals.getPixels = getPixels;
		externals.getPercentage = getPercentage;
		externals.producePreview = producePreview;
		externals.getExecutionTime = getExecutionTime;

		setExecutionTime(instance.getTimestamp());

		return externals;

		function getExecutionTime() {
			return internals.executionTime;
		}

		function setExecutionTime(startDate) {
			internals.executionTime = (new Date()) - startDate;
		}

		function producePreview() {
			const image = getImage();
			const width = image.width;
			const height = image.height;
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext('2d');
			context.putImageData(image, 0, 0);
			const imageElement = new Image();
			imageElement.src = canvas.toDataURL();
			imageElement.style.cssText = [
				'image-rendering: optimizespeed',
				'image-rendering: pixelated'
			].join(';');
			const resolution = instance.getResolution();
			imageElement.width = Math.round(width / resolution);
			imageElement.height = Math.round(height / resolution);
			return imageElement;
		}

		function getPercentage() {
			const image = getImage();
			const pixels = getPixels();
			const totalPixels = image.data.length / 4;
			const percent = totalPixels / 100;
			return pixels / percent;
		}

		function getPixels() {
			const image = getImage();
			const data = image.data;
			const dataLength = data.length;
			var pixels = 0;
			var idxR, idxG, idxB;
			for (var idx = 0; idx < dataLength; idx += 4) {
				idxR = idx + 0;
				idxG = idx + 1;
				idxB = idx + 2;
				if (data[idxR] || data[idxG] || data[idxB]) {
					pixels += 1;
				}
			}
			return pixels;
		}

		function getImage() {
			return internals.image;
		}

		function setImage(imageData) {
			if (!isImageData(imageData)) {
				return panic('No diff ImageData provided');
			}
			internals.image = imageData;
			return getImage();
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

		setTimestamp();
		setResolution(params.resolution);
		setThreshold(params.threshold);
		setNormalized(params.isNormalized);

		externals.getTargetImageUrl = getTargetImageUrl;
		externals.getBaseImageUrl = getBaseImageUrl;
		externals.getResolution = getResolution;
		externals.getThreshold = getThreshold;
		externals.setBaseImage = setBaseImage;
		externals.getBaseImage = getBaseImage;
		externals.setTargetImage = setTargetImage;
		externals.getTargetImage = getTargetImage;
		externals.isNormalized = isNormalized;
		externals.getTimestamp = getTimestamp;

		return externals;

		function getTimestamp() {
			return internals.timestamp;
		}

		function setTimestamp() {
			internals.timestamp = new Date();
		}

		function getTargetImage() {
			return internals.targetImage;
		}

		function setTargetImage(imageData) {
			if (!isImageData(imageData)) {
				return panic('No targetImageData provided');
			}
			internals.targetImage = imageData;
			return getTargetImage();
		}

		function getBaseImage() {
			return internals.baseImage;
		}

		function setBaseImage(imageData) {
			if (!isImageData(imageData)) {
				return panic('No baseImageData provided');
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

		function isNormalized() {
			return internals.isNormalized;
		}

		function setNormalized(isNormalized) {
			internals.isNormalized = !!isNormalized;
		}

		function setThreshold(threshold) {
			internals.threshold = sanitizeThreshold(threshold);
		}

		function getResolution() {
			return internals.resolution;
		}

		function setResolution(resolution) {
			internals.resolution = sanitizeResolution(resolution);
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

	function sanitizeResolution(resolution) {
		const MIN_RESOLUTION = 0.01;
		const MAX_RESOLUTION = 1;
		if (!isNumber(resolution)) {
			return MAX_RESOLUTION;
		}
		if (resolution > MAX_RESOLUTION) {
			return MAX_RESOLUTION;
		}
		if (resolution < MIN_RESOLUTION) {
			return MIN_RESOLUTION;
		}
		return resolution;
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
		console.error('[canvas-compare]: ' + reason);
		return;
	}

})(this);
