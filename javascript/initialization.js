$(document).ready(function() {

	//
	var localSrc = document.location.href,
		localIndex = localSrc.split("#")[1];

	if (localIndex) {
		$(".screen").eq(localIndex).show().siblings().hide();
		if (localIndex == 0) {
			$(".prevBtn").addClass('prevNone');
		} else if (localIndex == $(".screen:last").index()) {
			$(".nextBtn").addClass('nextNone');
		}
	} else {
		$(".prevBtn").addClass('prevNone');
	}

	//调整屏幕的缩小比例，以适应屏幕大小
	function zoomPage() {
		//var dbcw = document.body.clientWidth;
		// var dbcw = document.body.offsetWidth;
		var dbcw = $(window).width();
		var prevZoom = $("body").attr("zoom");
		var zoom = 1;
		if (dbcw < 1280) {
			zoom = Math.floor(dbcw / 12.8) / 100; //向下取整，保留两位小数
		} else if (dbcw < 600) {
			zoom = 0.5;
		}
		// console.log(zoom);
		$("body").css({
			"transform": "scale(" + zoom + ")",
			"-webkit-transform": "scale(" + zoom + ")",
			"-moz-transform": "scale(" + zoom + ")"
		}).attr("zoom",zoom);
		if (zoom != 1) {
			$("body").css({
				"transform": "scale(" + zoom + ")",
				"-webkit-transform": "scale(" + zoom + ")",
				"-moz-transform": "scale(" + zoom + ")"
			}).attr("zoom",zoom);
		} else if (prevZoom < 0) { //如果上一次zoom小于0 直接跳转到zoom 为1，则缩放值恢复
			$("body").css({
				"transform": "scale(" + zoom + ")",
				"-webkit-transform": "scale(" + zoom + ")",
				"-moz-transform": "scale(" + zoom + ")"
			}).attr("zoom",zoom);
		}
	}
	zoomPage();

	function fullPage() {
		var dbcw = document.body.offsetWidth;
		var zoom = Math.floor(dbcw / 12.8) / 100; //向下取整，保留两位小数

		if (dbcw < 600) {
			zoom = 0.5;
		}

		if (zoom != 1 && browser != "IE") {
			var style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = ":-webkit-full-screen{transform:scale(" + zoom + ");-webkit-transform:scale(" + zoom + ");}" +
				":-moz-full-screen .mozFullFix{-moz-transform:scale(" + zoom + ");}";
			document.getElementsByTagName('head').item(0).appendChild(style);
			// console.log(style.innerHTML);
		}
	}
	fullPage();

	$(window).resize(function() {
		zoomPage();
		fullPage();
	});

	//配置信息
	//将解锁信息存储一个json类型的对象，存储到localStorage中。
	function getLcs(str_ls){
		var notFirst = -1;
		if( localStorage.getItem(str_ls) ){		//系统存在历史
			notFirst = localStorage.getItem(str_ls);
		}else{											//系统中没有目录解锁信息
			localStorage.setItem(str_ls,notFirst);
		}

		return notFirst;
	}

	var notFirst = getLcs("notFirst"),
	      notFirst2 = getLcs("notFirst2");
	if( notFirst != -1){
		$("#firstTips").hide();
	}
	if( notFirst2 != -1){
		$("#firstTips2").hide();
	}
});