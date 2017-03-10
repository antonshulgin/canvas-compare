// jshint esnext: true
(function (exports, undefined) {
	'use strict';

	exports.canvasCompare = canvasCompare;

	const ImageData = window.ImageData;
	const ERR_NO_PARAMS = 'No params provided';
	const ERR_NO_IMAGE_URL = 'No valid imageUrl provided';
	const ERR_NO_BASE_IMAGE_URL = 'No valid baseImageUrl provided';
	const ERR_NO_BASE_IMAGE_DATA = 'No valid baseImageData provided';
	const ERR_NO_TARGET_IMAGE_URL = 'No valid targetImageUrl provided';
	const ERR_NO_TARGET_IMAGE_DATA = 'No valid targetImageData provided';
	const ERR_NO_IMAGE_DATA = 'No valid ImageData provided';

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
		setScale(params.scale);

		externals.compare = compare;

		return externals;

		function compare() {
			return new Promise(promiseCompare);

			function promiseCompare(resolve, reject) {
				const baseImageUrl = getBaseImageUrl();
				if (!baseImageUrl) {
					reject(ERR_NO_BASE_IMAGE_URL);
					return;
				}
				const targetImageUrl = getTargetImageUrl();
				if (!targetImageUrl) {
					reject(ERR_NO_TARGET_IMAGE_URL);
					return;
				}
				return readImages(baseImageUrl, targetImageUrl, getScale())
					.then(onReadImages)
					.catch(panic);

				function onReadImages(imageDatas) {
					if (!setBaseImageData(imageDatas[0])) {
						reject('Failed to set baseImageData');
						return;
					}
					if (!setTargetImageData(imageDatas[1])) {
						reject('Failed to set targetImageData');
						return;
					}
					const baseImageData = getBaseImageData();
					const targetImageData = getTargetImageData();
					const isMatchingWidth = (baseImageData.width === targetImageData.width);
					const isMatchingHeight = (baseImageData.height === targetImageData.height);
					if (!isMatchingWidth || !isMatchingHeight) {
						reject('Size mismatch');
						return;
					}
					return readDiffData(baseImageData, targetImageData)
						.then(onReadDiffData)
						.catch(panic);

					function onReadDiffData(diffData) {
						setDiffData(diffData);
						resolve(getDiffData());
					}
				}
			}
		}

		function getDiffData() {
			return internals.diffData;
		}

		function setDiffData(diffData) {
			if (!isImageData(diffData)) {
				panic(ERR_NO_IMAGE_DATA);
				return;
			}
			internals.diffData = diffData;
			return getDiffData();
		}

		function getScale() {
			return internals.scale;
		}

		function setScale(scale) {
			internals.scale = sanitizeScale(scale);
		}

		function getTargetImageData() {
			return internals.targetImageData;
		}

		function setTargetImageData(targetImageData) {
			if (!isImageData(targetImageData)) {
				panic(ERR_NO_TARGET_IMAGE_DATA);
				return;
			}
			internals.targetImageData = targetImageData;
			return getTargetImageData();
		}

		function getBaseImageData() {
			return internals.baseImageData;
		}

		function setBaseImageData(baseImageData) {
			if (!isImageData(baseImageData)) {
				panic(ERR_NO_BASE_IMAGE_DATA);
				return;
			}
			internals.baseImageData = baseImageData;
			return getBaseImageData();
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

	// Instance-independent logic

	function readDiffData(baseImageData, targetImageData) {
		const CHANNEL_R = 0;
		const CHANNEL_G = 1;
		const CHANNEL_B = 2;
		const CHANNEL_A = 3;
		return new Promise(promiseReadDiffData);

		function promiseReadDiffData(resolve, reject) {
			if (!isImageData(baseImageData)) {
				reject(ERR_NO_BASE_IMAGE_DATA);
				return;
			}
			if (!isImageData(targetImageData)) {
				reject(ERR_NO_TARGET_IMAGE_DATA);
				return;
			}
			const dataLength = baseImageData.data.length;
			const dataWidth = baseImageData.width;
			const dataHeight = baseImageData.height;
			const diff = new Uint8ClampedArray(dataLength);
			let idx;
			let idxR;
			let idxG;
			let idxB;
			let idxA;
			for (idx = 0; idx < dataLength; idx += 4) {
				idxR = CHANNEL_R + idx;
				idxG = CHANNEL_G + idx;
				idxB = CHANNEL_B + idx;
				idxA = CHANNEL_A + idx;
				diff[idxR] = (baseImageData.data[idxR] - targetImageData.data[idxR]);
				diff[idxG] = (baseImageData.data[idxG] - targetImageData.data[idxG]);
				diff[idxB] = (baseImageData.data[idxB] - targetImageData.data[idxB]);
				diff[idxA] = 255; // ignore transparency for now
			}
			const diffData = new ImageData(diff, dataWidth, dataHeight);
			resolve(diffData);
		}
	}

	function sanitizeScale(scale) {
		const MIN_SCALE = 0.01;
		const MAX_SCALE = 1;
		if (!isNumber(scale)) {
			return MAX_SCALE;
		}
		if (scale < MIN_SCALE) {
			return MIN_SCALE;
		}
		if (scale > MAX_SCALE) {
			return MAX_SCALE;
		}
		return scale;
	}

	function readImages(baseImageUrl, targetImageUrl, scale) {
		scale = sanitizeScale(scale);
		if (!isNonEmptyString(baseImageUrl)) {
			return Promise.reject(ERR_NO_BASE_IMAGE_URL);
		}
		if (!isNonEmptyString(targetImageUrl)) {
			return Promise.reject(ERR_NO_TARGET_IMAGE_URL);
		}
		return Promise.all([
			readImage(baseImageUrl, scale),
			readImage(targetImageUrl, scale)
		]);
	}

	function readImage(imageUrl, scale) {
		scale = sanitizeScale(scale);
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
				const width = image.width * scale;
				const height = image.height * scale;
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const context = canvas.getContext('2d');
				context.drawImage(image, 0, 0, width, height);
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
		console.error('[canvas-compare] ' + reason);
	}

})(this);
