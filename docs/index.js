// jshint esnext: true
(function (window, canvasCompare) {
	'use strict';

	window.addEventListener('load', onLoad, false);

	var isPreviewPending = false;

	function onLoad() {
		if (!canvasCompare) { return; }

		initWebcam();
	}

	function initWebcam() {
		const frames = [];
		const video = document.getElementById('video');
		video.width = 160;
		video.height = 120;

		const userMediaParams = { video: true, audio: false };
		navigator.mediaDevices.getUserMedia(userMediaParams)
			.then(onGetUserMedia)
			.catch(console.error);

		function onGetUserMedia(stream) {
			video.srcObject = stream;
			video.play();
			setInterval(takePicture, 160);
		}

		function updatePreview(canvas) {
			frames.unshift(canvas);
			frames.length = 2;
			if (!frames[0] || !frames[1]) { return; }
			isPreviewPending = true;
			const compareParams = {
				baseImageUrl: frames[0].toDataURL(),
				targetImageUrl: frames[1].toDataURL(),
				scale: 0.1,
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
				console.log({
					percentage: result.getPercentage(),
					executionTime: result.getExecutionTime()
				});
				isPreviewPending = false;
			}
		}

		function takePicture() {
			if (isPreviewPending) {
				console.log('skip');
				return;
			}
			const width = video.width;
			const height = video.height;
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext('2d');
			context.drawImage(video, 0, 0, width, height);
			updatePreview(canvas);
		}
	}

})(this, this.canvasCompare);
