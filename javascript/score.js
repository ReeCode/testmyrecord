
// console.log(scoreItem);

var score = function(_index){
	var dataArr = [],
		colorArr = ["#efab37","#0b3d5d"];

	var pi2 = Math.PI*2,
		radii = 128;

	var $thisScreen = $(".screen:visible"),
	      $errorIcon = $thisScreen.find(".errorIcon"),
	      $rightIcon = $thisScreen.find(".rightIcon"),
	      $sharpBox = $thisScreen.find(".sharpBox"),
	      $errorSharp,$rightSharp;

	(function(){			//初始化
		dataArr = [scoreItem[0][1]/scoreItem[0][0],scoreItem[1][1]/scoreItem[1][0]];
		$rightIcon.find("div").html("正确率：" + Math.round(dataArr[_index]*10000)/100+ "%");
		$errorIcon.find("div").html("错误率：" + Math.round((1-dataArr[_index])*10000)/100+ "%");

		$sharpBox.html("<div class='rightSharp'></div><div class='errorSharp'></div>");
		$(".errorIcon,.rightIcon").removeAttr("style");

		$errorSharp = $thisScreen.find(".errorSharp");
		$rightSharp = $thisScreen.find(".rightSharp");
		var canvas = $thisScreen.find(".pie")[0],
 	    	      c =canvas.getContext("2d");
 	    	c.clearRect(0,0,2*radii,2*radii);
	})();

	function sharpRun(){
		if(dataArr[_index] != 1){
			var tarAgl =  parseInt((1-dataArr[_index])*179-46);
			iconPos($errorIcon,tarAgl,0);
			$errorSharp.css({"transform":"rotate("+ tarAgl +"deg)","opacity":1});
		}
		if(dataArr[_index] != 0){
			var tarAgl2 = parseInt(135- dataArr[_index]*179);
			iconPos($rightIcon,tarAgl2,1);
			$rightSharp.css({"transform":"rotate("+ tarAgl2 +"deg)","opacity":1});
		}
	}

	function iconPos($Icon,iAgl,aglPos){
		var iLeft = parseInt($Icon.css("left")),
			iTop = parseInt($Icon.css("top")),
			iWidth = parseInt($Icon.css("width")),
			iHeight = parseInt($Icon.css("height"));

		var sin = parseInt(Math.sin(iAgl*pi2/360)*radii);
			cos = parseInt(Math.cos(iAgl*pi2/360)*radii);

		switch(aglPos){
			case 0:
				if( iAgl < 0 ){ $Icon.css({"left":iLeft - radii + cos,"top": iTop+ sin }); }
				else if( iAgl >= 0 && iAgl < 90 ){ $Icon.css({"left":iLeft - radii + cos,"top": iTop+ sin + iHeight}); }
				else if( iAgl >=90){ $Icon.css({"left":iLeft - radii + cos-iWidth,"top": iTop+ sin + iHeight + 10}); }
				break;
			case 1:
				if( iAgl < 0 ){ $Icon.css({"left":iLeft + radii - cos,"top": iTop - sin + iHeight*2 }); }
				else if( iAgl >= 0 && iAgl < 90 ){ $Icon.css({"left":iLeft + radii - cos,"top": iTop - sin }); }
				else if( iAgl >=90){ $Icon.css({"left":iLeft + radii - cos + iWidth,"top": iTop - sin  }); }
				break;
			default:
				console.log("错误的aglPos: " + aglPos);
		}

		setTimeout(function(){ $Icon.fadeIn(); },800);
	}

 	//动画显示饼图
 	function drawCircle(canvasId, data_arr, color_arr) {
 	    var eTime = 1000,       //执行时间  1s
 	        perTime = 25;       //每帧时间
 	    var bits = eTime / perTime,
 	        runBits = 0;

 	    var canvas = $thisScreen.find(canvasId)[0];
 	    var c =canvas.getContext("2d");
 	    //c.font ="12px Times New Roman";
 	    var startAgl = -Math.PI*0.25;
 	    var agl;

 	    canvas.width = 2*radii;
 	    canvas.height = 2*radii;

 	    var timer = setInterval(function(){
 	    	c.clearRect(0,0,2*radii,2*radii);
 	        runBits++;
 	        //绘制饼图
 	        agl = (1-data_arr[_index]) / bits * runBits * pi2 + startAgl;
 	        c.fillStyle=color_arr[0];
 	        c.beginPath();
 	        c.moveTo(radii,radii);
 	        c.arc(radii, radii, radii, startAgl, agl, false);
 	        c.lineTo(radii,radii);
 	        c.fill();

 	        aglPi2 = data_arr[_index] / bits * runBits * pi2 + agl;
 	        c.fillStyle=color_arr[1];
 	        c.beginPath();
 	        c.moveTo(radii,radii);
 	        c.arc(radii, radii, radii, agl, aglPi2, false);
 	        c.lineTo(radii,radii);
 	        c.fill();

 	        if(runBits == bits){
 	            clearInterval(timer);
 	        }
 	    },perTime);
 	    sharpRun();
 	}

    drawCircle(".pie",dataArr,colorArr);

}