// jshint esnext: true
(function (window, canvasCompare) {
	'use strict';

	window.addEventListener('load', onLoad, false);

	function onLoad() {
		if (!canvasCompare) { return; }

		initWebcam();
	}

	function initWebcam() {
		const frames = [];
		const videoContainer = document.getElementById('videoContainer');
		videoContainer.width = 320;
		videoContainer.height= 240;

		const userMediaParams = { video: true, audio: false };
		navigator.mediaDevices.getUserMedia(userMediaParams)
			.then(onGetUserMedia)
			.catch(console.error);

		function onGetUserMedia(stream) {
			videoContainer.srcObject = stream;
			videoContainer.play();

			setInterval(takePicture, 200);
		}

		function updatePreview(canvas) {
			frames.unshift(canvas);
			frames.length = 2;
			if (!frames[0] || !frames[1]) { return; }
			const compareParams = {
				baseImageUrl: frames[0].toDataURL(),
				targetImageUrl: frames[1].toDataURL(),
				scale: 0.01,
				threshold: 20,
				isNormalized: true
			};
			canvasCompare(compareParams)
				.then(onCompare)
				.catch(console.error);

			function onCompare(result) {
				if (!result) { return; }
				const preview = document.getElementById('previewContainer');
				preview.innerHTML = '';
				preview.appendChild(result.producePreview());
			}
		}

		function takePicture() {
			const width = videoContainer.width;
			const height = videoContainer.height;
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext('2d');
			context.drawImage(videoContainer, 0, 0, width, height);
			updatePreview(canvas);
		}
	}

})(this, this.canvasCompare);
