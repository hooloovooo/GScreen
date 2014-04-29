navigator.getUserMedia  = navigator.getUserMedia ||
						  navigator.webkitGetUserMedia ||
						  navigator.mozGetUserMedia ||
						  navigator.msGetUserMedia;

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
})();

(function() {
	window.onload = function() {
		var video = document.createElement("video");
		var canvas = document.querySelector('canvas');
		var backCanvas = document.createElement("canvas");
		var bctx = backCanvas.getContext("2d");
		var ctx = canvas.getContext('2d');

		backCanvas.width = canvas.width;
		backCanvas.height = canvas.height;

		function draw() {
			bctx.drawImage(video, 0, 0, canvas.width, canvas.height);

			var idata = bctx.getImageData(0, 0, canvas.width, canvas.height);
			var data = idata.data;
			
			// Loop through the pixels, turning them grayscale
			for(var i = 0; i < data.length; i+=4) {
				var r = data[i];
				var g = data[i+1];
				var b = data[i+2];
				var brightness = ( 3 * r + 4 * g + b ) >>> 3;
				data[i] = brightness;
				data[i+1] = brightness;
				data[i+2] = brightness;
			}

			idata.data = data;

			ctx.putImageData(idata,0,0);

			window.requestAnimationFrame(draw);
		}

		video.addEventListener("play", function() {
			draw();
		});

		navigator.getUserMedia({video: true}, function(stream) {
			video.src = window.URL.createObjectURL(stream);
			video.play();
		}, function( err ) {
			console.log(err);
		});
	}

} ())