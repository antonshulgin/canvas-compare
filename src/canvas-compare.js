// jshint esnext: true
(function (exports, undefined) {
	'use strict';

	exports.canvasCompare = canvasCompare;

	const ERR_NO_PARAMS = 'No params provided';
	const ERR_NO_BASE_IMAGE_URL = 'No valid baseImageUrl provided';
	const ERR_NO_TARGET_IMAGE_URL = 'No valid targetImageUrl provided';

	function canvasCompare(params) {
		const internals = {};
		if (!isObject(params)) {
			panic(ERR_NO_PARAMS);
			return;
		}
		setBaseImageUrl(params.baseImageUrl);
		if (!getBaseImageUrl()) {
			return;
		}
		setTargetImageUrl(params.targetImageUrl);
		if (!getTargetImageUrl()) {
			return;
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
