// jshint esnext: true
(function (window) {
	'use strict';

	window.addEventListener('load', init, false);

	function init() {
		const canvasCompare = window.canvasCompare;
		if (!canvasCompare) {
			console.log('no canvasCompare');
			return;
		}
		const images = canvasCompare({
			baseImageUrl: './images/base.jpg',
			targetImageUrl: './images/target.jpg'
		});
		console.log(images);
	}

})(this);
