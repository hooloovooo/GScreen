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

function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;

    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h, s, l;

    if (max == min) {
      h = 0;
    } else if (r == max) {
      h = (g - b) / delta;
    } else if (g == max) {
      h = 2 + (b - r) / delta;
    } else if (b == max) {
      h = 4 + (r - g) / delta;
    }

    h = Math.min(h * 60, 360);

    if (h < 0) {
      h += 360;
    }

    l = (min + max) / 2;

    if (max == min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }

    return [h, s * 100, l * 100];
  }


(function() {
	window.onload = function() {
		var cameraVideo = document.createElement("video");
		var cameraCanvas = document.querySelector('canvas');
		var cameraBackCanvas = document.createElement("canvas");
		var cBCtx = cameraBackCanvas.getContext("2d");
		var cameraCtx = cameraCanvas.getContext('2d');

		var backdropVideo = document.createElement("video");
		var backdropCanvas = document.createElement("canvas");
		var bdCtx = backdropCanvas.getContext("2d");
		document.getElementById("videoContainer").appendChild(backdropCanvas);


		cameraBackCanvas.width = cameraCanvas.width;
		cameraBackCanvas.height = cameraCanvas.height;
		backdropCanvas.height = cameraCanvas.height;
		backdropCanvas.width = cameraCanvas.width;

		backdropCanvas.id = "backdropCanvas";

		var rgbPattern = [
			0,
			255,
			0
		];
		var tolerance = 20;

		function draw() {
			cBCtx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
			bdCtx.drawImage(backdropVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);

			var vdata = bdCtx.getImageData(0, 0, cameraCanvas.width, cameraCanvas.height);
			var idata = cBCtx.getImageData(0, 0, cameraCanvas.width, cameraCanvas.height);
			var data = idata.data;

			for(var i = 0, n = data.length; i < n; i += 4) {
				var diff = Math.abs(data[i] - rgbPattern[0]) + Math.abs(data[i+1] - rgbPattern[1]) + Math.abs(data[i+2] - rgbPattern[2]);
				data[i + 3] = (diff*diff)/tolerance;
			}

			idata.data = data;

			cameraCtx.putImageData(idata,0,0);

			window.requestAnimationFrame(draw);
		}

		function setColorPattern(x, y) {
			var p = cameraCtx.getImageData(x, y, 1, 1);
			console.log(p);
			rgbPattern = [
				p.data[0],
				p.data[1],
				p.data[2]
			];

			console.log(rgbPattern);
		}

		cameraVideo.addEventListener("play", function() {
			draw();
		});

		cameraCanvas.addEventListener("click", function( ev ) {
			setColorPattern(ev.x, ev.y);
		});



		navigator.getUserMedia({video: true}, function(stream) {
			cameraVideo.src = window.URL.createObjectURL(stream);
			backdropVideo.src = "video/big_buck_bunny_720p_stereo.ogg";
			backdropVideo.play();
			cameraVideo.play();
		}, function( err ) {
			console.log(err);
		});

		$("#toleranceSlider").slider({
			max: 300,
			value: 50,
			slide: function(ev) {
				tolerance = $(this).slider("value");
			}
		});
	}

} ())