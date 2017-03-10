// jshint esnext: true
(function (window) {
	'use strict';

	window.addEventListener('load', init, false);

	function init() {
		window.imagesToCompare = window.canvasCompare({
			baseImageUrl: './images/base.jpg',
			targetImageUrl: './images/target.jpg'
		});
		window.imagesToCompare.compare()
			.then(function (diffData) {
				console.log({ diffData: diffData });
			})
			.catch(function (reason) {
				console.log({ error: reason });
			});
	}

})(this);
