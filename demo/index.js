// jshint esnext: true
(function (window) {
	'use strict';

	window.addEventListener('load', init, false);

	function init() {
		window.imagesToCompare = window.canvasCompare({
			baseImageUrl: './images/base.jpg',
			targetImageUrl: './images/target.jpg',
			precision: 0.1
		});
		window.imagesToCompare.compare()
			.then(onCompare)
			.catch(console.log);
	}

	function onCompare(diffData) {
		const canvas = document.createElement('canvas');
		canvas.width = diffData.width;
		canvas.height = diffData.height;
		const context = canvas.getContext('2d');
		context.putImageData(diffData, 0, 0);
		const root = document.getElementById('root');
		root.appendChild(canvas);
	}

})(this);
