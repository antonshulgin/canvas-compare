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
		const video = document.getElementById('video');
		video.width = 160;
		video.height = 120;
		const movementDetectionNotice = document.getElementById('movementDetectionNotice');
		const movementPercentage = document.getElementById('movementPercentage');
		const preview = document.getElementById('preview');
		const controls = document.forms.controls;
		var isPreviewPending = false;
		var isMovementDetected = false;

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
			const resolution = parseFloat(controls.resolution.value);
			const threshold = parseInt(controls.threshold.value);
			const movementGate = parseInt(controls.movementGate.value);
			const isNormalized = controls.isNormalized.checked;
			isPreviewPending = true;
			const compareParams = {
				baseImageUrl: frames[0].toDataURL(),
				targetImageUrl: frames[1].toDataURL(),
				resolution: resolution,
				threshold: threshold,
				isNormalized: isNormalized
			};
			canvasCompare(compareParams)
				.then(onCompare)
				.catch(console.error);

			function onCompare(result) {
				if (!result) { return; }
				const image = result.producePreview();
				preview.src = image.src;
				isMovementDetected = (result.getPercentage() > movementGate);
				isPreviewPending = false;
				if (isMovementDetected) {
					movementDetectionNotice.classList.remove('hidden');
					movementPercentage.textContent = '(' + result.getPercentage().toFixed(2) + '%)';
					return;
				}
				movementDetectionNotice.classList.add('hidden');
			}
		}

		function takePicture() {
			if (isPreviewPending) {
				console.log('frame skipped');
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
