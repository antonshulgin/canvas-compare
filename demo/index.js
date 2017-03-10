// jshint esnext: true
(function (window) {
	'use strict';

	let scale = 1;
	let slider;

	const demo = {};

	demo.update = update;

	window.demo = demo;
	window.addEventListener('load', init, false);

	function init() {
		slider = document.getElementById('slider');
		update();
	}

	function update(event) {
		scale = event ? (parseFloat(event.target.value) || 1) : 1;
		slider.disabled = true;
		const imagesToCompare = window.canvasCompare({
			baseImageUrl: './images/base.jpg',
			targetImageUrl: './images/target.jpg',
			scale: scale
		});
		imagesToCompare
			.compare()
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

		const preview = document.getElementById('preview');
		preview.src = canvas.toDataURL();
		preview.width = Math.round(width / scale) || 1;
		preview.height = Math.round(height / scale) || 1;
		preview.style.imageRendering = 'optimizespeed'; // disable interpolation
		slider.disabled = false;
	}

})(this);
