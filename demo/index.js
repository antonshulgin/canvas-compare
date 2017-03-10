// jshint esnext: true
(function (window) {
	'use strict';

	window.addEventListener('load', init, false);

	const precision = 0.04;

	function init() {
		window.imagesToCompare = window.canvasCompare({
			baseImageUrl: './images/base.jpg',
			targetImageUrl: './images/target.jpg',
			//targetImageUrl: './images/mismatch.png',
			precision: precision
		});
		window.imagesToCompare.compare()
			.then(onCompare)
			.catch(console.error);
	}

	function onCompare(diffData) {
		const width = diffData.width;
		const height = diffData.height;

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');
		context.putImageData(diffData, 0, 0);

		const image = new Image();
		image.src = canvas.toDataURL();
		image.width = Math.round(width / precision) || 1;
		image.height = Math.round(height / precision) || 1;
		image.style.imageRendering = 'optimizespeed'; // disable interpolation

		const root = document.getElementById('root');
		root.appendChild(image);
	}

})(this);
