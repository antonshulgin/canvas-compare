// jshint esnext: true
(function () {
	'use strict';

	window.addEventListener('load', init, false);

	function init() {
		/* global canvasCompare */
		if (!canvasCompare) {
			console.log('no canvasCompare');
			return;
		}
		canvasCompare({
			baseImage: './images/base.jpg',
			targetImage: './images/target.jpg'
		});
	}

})();
