// jshint esnext: true
(function (window) {
	'use strict';

	let scale = 1;
	let rounding = 0;
	let sliderScale;
	let sliderRounding;

	const demo = {};

	demo.update = update;

	window.demo = demo;
	window.addEventListener('load', onLoad, false);

	function onLoad() {
		sliderScale = document.getElementById('sliderScale');
		sliderRounding = document.getElementById('sliderRounding');
		update();
	}

	function update() {
		scale = parseFloat(sliderScale.value) || 1;
		rounding = parseFloat(sliderRounding.value) || 0;
		sliderScale.disabled = true;
		sliderRounding.disabled = true;
		const imagesToCompare = window.canvasCompare({
			baseImageUrl: './images/base.jpg',
			//targetImageUrl: './images/base.jpg',
			targetImageUrl: './images/target.jpg',
			scale: scale,
			rounding: rounding
		});
		imagesToCompare
			.compare()
			.then(onCompare)
			.catch(console.error);

		function onGetDiffPercentage(diffPercentage) {
			const header = document.getElementById('diffPercentage');
			header.textContent = diffPercentage;
		}

		function onCompare() {
			const diffData = imagesToCompare.getDiffData();
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
			sliderScale.disabled = false;
			sliderRounding.disabled = false;

			imagesToCompare
				.getDiffPercentage()
				.then(onGetDiffPercentage)
				.catch(console.log);
		}
	}

})(this);
