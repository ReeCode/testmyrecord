$(document).ready(function() {

	/* *************************** */
	/* ********** 控制条 ********* */
	/* *************************** */
	//screen自定义标签涵义
	//	||data-order	当前屏幕在总屏幕中的显示顺序
	//	||data-type		当前屏幕类型
	//		|| 值 0		当前屏幕 不计算时间 为操作类 类型页面
	//		||    1		当前屏幕 计算时间 但不是视频
	//		||    2		当前屏幕 计算时间 且页面只包含一个视频
	//		||    3		当前屏幕 计算时间 为重点分析页面
	//	||data-time		当前屏幕停留的时间
	//		|| 例 00:10 停留时间为10秒
	//		||    infinite	无限制 需与 data-type = 0 时使用

	//初始化信息
	var $activeScreen = $(".screen:visible"),	//当前的屏幕
		screenType = $activeScreen.data("type"),//当前屏幕类型
		maxOrder = $(".screen:last").index()+1;	//总共的order
		$dialog = $("#dialog"),						//缓存对话播放
		$lexicon = $("#lexicon"),					//缓存单词播放
		$dialogReplay = $("#dialogReplay"),				//缓存重新播放
		$recordReplay = $("#recordReplay"),				//缓存录音播放
		mediaRecorder = null,
		stayTime = 0,							//在当前屏幕停留的时间
		allTime = "",							//当前页停留的最大的时间
		volume = 1,							//声音系数，默认为1，全局
		stayTo = null,							//更新停留时间的 setTimeout
		barMove = null,						//进度条
		MediaPlayer = null,						//视频
		dialogStatus = -1,						//音频状态
		dialogTemp = "",						//缓存音频地址
		dialogTime = null,						//对话 setTimeout
		playStatus = 0,						//播放状态
		scoreFlag = true,						//反馈标志位
		timeArray = new Array("-1");					//存储时间


	//开始
	$(".playBtn").on("click",function(){
		//控制音频状态
		$dialogReplay[0].pause();
		if($dialog[0].paused&&dialogStatus!==-1){
			if(dialogStatus === 0){    	//如果在 setTimeout 期间
				clearTimeout(dialogTime);
				dialogTime = null;
				dialogStatus = 2;
			}else if(dialogStatus===2){	//在setTimeout 结束后 立即播放
				$dialog.attr("src",dialogTemp);
				dialogTemp = "";
				dialogStatus = 1;
			}else{				//其他情况，播放音频
				$dialog[0].play();
			}
		}else if(dialogStatus===1){		//如果是正常的播放，暂停播放
			$dialog[0].pause();
		}

		//控制动画状态
		switch(screenType){
			case 0:
				pBtnHandleType0();
				break;
			case 1:
				pBtnHandleType1($(this));
				break;
			case 2:
				pBtnHandleType2($(this));
				break;
			case 3:
				pBtnHandleType3($(this));
				break;
			default:
				console.log("错误的screenType类型："+screenType);
		}

		//初始化信息
		if($(".lexiconDes").is(":visible")){ $(".lexiconDes").hide(); }
		if($(".dlError").length !== 0 || $(".dlRight").length !== 0){
			$(".dlist").slideUp();
			$(".likeDLShowed").find(".dlistAns").html($('.likeDLShowed').find('.bingo').text());
			$(".likeDLShowed").removeClass("dlRight dlError likeDLShowed");
		}
	})

	// 获取音频时长
	// var getAudioTime = function(_url){
	// 	var _audio = new Audio(_url),
	// 	      _duration;

	// 	_audio.onloadedmetadata = function(){
	// 		_duration = _audio.duration;
	// 		return _duration;
	// 	}
	// }

	// 求和
	function sum(arr) {
	    return eval(arr.join("+"));
	};

	//前 n 项 求和
	function sumItem(arr,firstItem,lastItem){
		var _sum = 0,
		      i = firstItem,
		      _last = lastItem;

		for(; i < _last ; i++){
			_sum = _sum + parseFloat(arr[i]);
		}

		return _sum;
	}

	//初始化显示信息
	//	|| 参数 $actScn 为当前活动的屏幕
	//初始化控制条底部的显示信息 例如：当前为第几屏，当前屏幕时间等
	//需要初始化的信息
	//	||	1、更新$ativeScreen , screenType
	//	||	2、更新屏幕号
	//	||	3、playBtn恢复
	//	||	4、进度条归0
	//	||	5、清楚stayTime,更新allTime
	function initContol($actScn){
		// var order = $actScn.data("order");
		var order = parseInt($actScn.index())+1;

		//视频信息
		// if($(".screen .MediaPlayer").length){
		// 	MediaPlayer = $(".screen .MediaPlayer")[0];
		// 	if(browser == "IE"){
		// 		MediaPlayer.controls.stop();
		// 	}else{
		// 		MediaPlayer.load();
		// 	}
		// }
		//清除视频信息
		clearInterval(barMove);
		barMove = null;
		dialogStatus = -1;
		$dialog.attr("src","");

		screenType = $actScn.data("type");		//更新屏幕类型
		allTime = $actScn.data("time");		//更新allTime

		timeArray = new Array("-1");

		if(screenType == 2||screenType == 3){
			// $(".progress").addClass('canClick');
			$actScn.find(".dialogItem").each(function(index){
				timeArray[index] = $(this).data("time");
			});
			var _sum = sum(timeArray),
			      _length = timeArray.length,
			      i = 0,
			      _width = parseInt($(".progress").width());
			      _s = "";
			for(; i<_length ; i++){
				_s = _s + "<div style=' width:" + timeArray[i]/_sum*_width  +"px'></div>";
			}

			$("#adjustProgress").html(_s);
		}else{
			// $(".progress").removeClass('canClick');
			$("#adjustProgress").html("");
		}

		playStatus = 0;				//更新播放状态
		$(".playBtn").removeClass('pauseBtn');	//更新播放按钮为开始按钮
		clearTimeout(stayTo);				//清除stayTo
		stayTime = 0;					//更新当前时间为0
		$(".progress div.pro").stop().width("0px");	//更新进度条为空

		$(".orderBox").html(parseInt(order)+" / "+parseInt(maxOrder)); //指示order 位置变为目录二字
		if(allTime == "infinite"){
			$(".time").html("");			//时间无限制
		}else{
			$(".time").html("00:00/"+allTime.split(".")[0]);
		}

		// anaFlag = 0;					//重置重点分析标志位
		$(".playBtn").trigger('click');
		initDialog($actScn,0);

	}

	initContol($activeScreen);

	$(document).on("click","#adjustProgress>div",function(){
		var $this = $(this),
		      $pro = $(".progress"),
		      $proBar = $pro.find(".pro"),
		      _maxWidth = parseInt($pro.width()),
		      _dialogFlag = $this.index(),
		      _left = $this.position().left;

		if(typeof mediaRecorder == "null"){ mediaRecorder.stop(); }
		$(".recording").removeClass("recording");
		$(".funPlayRecord").removeClass("pauseIcon").addClass("cantClick");
		$(".funPlaySound").removeClass("cantClick voiceing");

		if(!$(".playBtn").hasClass("pauseBtn")){
			$(".playBtn").trigger("click");
		}

		clearInterval(barMove);
		barMove = null;
		clearInterval(stayTo);
		stayTo = null;

		stayTime = sumItem(timeArray,0,_dialogFlag);

		if(screenType == 2 ){
			barMove = setInterval(function(){
				var _tarWidth = (parseFloat(stayTime) + 0.1)/getTime(allTime)*_maxWidth;
				$(".progress div.pro").css({"width":_tarWidth});
				},100);

			stayTo = setInterval(function(){ stayTime = parseFloat(stayTime)+0.1; updataTimeShow(); if( parseInt(stayTime) == getTime(allTime)){ clearInterval(stayTo); $(".nextBtn").trigger('click'); } },100);
		}

		if(screenType == 3 ){
			$(".progress div.pro").css({"width":(parseFloat(stayTime) + 0.1)/getTime(allTime)*_maxWidth});
		}
		initDialog($activeScreen,_dialogFlag);
	});

	//初始化对话
	function initDialog($actScn,_dialogFlag){
		$(".lexiconDes").hide();
		$(".voiceing").removeClass("voiceing");
		if(typeof mediaRecorder == "null"){ mediaRecorder.stop(); }
		$dialogReplay[0].pause();
		clearTimeout(dialogTime);			//清除dialogeTime

		// dialog 初始化
		if( $actScn.find(".dialogItem").length ){
			var $dialogList = $actScn.find(".dialogItem"),
			      _dLength = $dialogList.length,
			      _delayTime = parseInt($dialogList.eq(_dialogFlag).data("delay"))*100,
			      _initShow = $dialogList.eq(_dialogFlag).data("initShow"),
			      _animate = $dialogList.eq(_dialogFlag).data("animate"),
			      _co = -1;

			// console.log(screenType);

			$dialogList.removeClass("animated fadeInUp fadeInLeft flipInX opacity zindex");

			if(_initShow !==undefined){
				var _initArray = _initShow.split(","),
				      _iaLength = _initArray.length,
				      i = 1;

				if(_initArray[0] === "o1"){
					$actScn.find(".otherAnimate>.setHide").show().siblings().hide();
				}else if(_initArray[0] === "o0"){
					$actScn.find(".otherAnimate>.setShow").show().siblings().hide();
				}

				for(; i < _iaLength ; i++){
					$dialogList.eq(_initArray[i]).addClass("opacity");
				}

				// 隐藏
				// for(; i < _iaLength ; i++){
				// 	if(_temp.length !==0){
				// 		_temp = _temp + ",";
				// 	}
				// 	_temp = _temp + ":eq(" + _initArray[i] + ")";
				// }
				// if(_temp.length !==0){{
				// 	$dialogList.not(_temp).removeClass("animated fadeInUp fadeInLeft flipInX opacity zindex");
				// }

			}
			// 装入 dialog
			if(_delayTime){
				dialogStatus = 0;
				dialogTemp = "./audio/"+ $dialogList.eq(_dialogFlag).data("sourse") + ".mp3";
				dialogTime = setTimeout(function(){
					$dialog.attr("src",dialogTemp);
					if(_animate!==undefined){
						$dialogList.eq(_dialogFlag).addClass("animated " + _animate + " zindex");
					}else{
						$dialogList.eq(_dialogFlag).addClass("animated fadeInUp zindex");
					}
					dialogStatus = 1;
				},_delayTime);
			}else{
				dialogStatus = 1;
				$dialog.attr("src","./audio/"+$dialogList.eq(_dialogFlag).data("sourse")+".mp3");
				if(_animate!==undefined){
					$dialogList.eq(_dialogFlag).addClass("animated " + _animate + " zindex");
				}else{
					$dialogList.eq(_dialogFlag).addClass("animated fadeInUp zindex");
				}
			}
		}

		if(screenType == 2){
			$dialog.off("ended");
			$dialog.on("ended",function(){
				_dialogFlag = _dialogFlag+1;
				_animate = $dialogList.eq(_dialogFlag).data("animate");
				_co = $dialogList.eq(_dialogFlag).data("co");
				 // var _tempurl = "./audio/"+ $dialogList.eq(_dialogFlag).data("sourse") + ".mp3";

				if(_dialogFlag < _dLength){
					if(_delayTime){
						dialogStatus = 0;
						dialogTemp = "./audio/"+ $dialogList.eq(_dialogFlag).data("sourse") + ".mp3";
						dialogTime = setTimeout(function(){
							$dialog.attr("src",dialogTemp);
							$dialogList.eq(_dialogFlag-1).removeClass("animated fadeInUp fadeInLeft flipInX zindex");
							if(_animate!==undefined){
								$dialogList.eq(_dialogFlag).addClass("animated " + _animate + " zindex");
							}else{
								$dialogList.eq(_dialogFlag).addClass("animated fadeInUp zindex");
							}
							dialogStatus = 1;
						},_delayTime);
					}else{
						dialogStatus = 1;
						$dialog.attr("src","./audio/"+$dialogList.eq(_dialogFlag).data("sourse")+".mp3");
						$dialogList.eq(_dialogFlag-1).removeClass("animated fadeInUp fadeInLeft flipInX zindex");
						if(_animate!==undefined){
							$dialogList.eq(_dialogFlag).addClass("animated " + _animate + " zindex");
						}else{
							$dialogList.eq(_dialogFlag).addClass("animated fadeInUp zindex");
						}
					}

					if(_co!==undefined){
						switch(_co){
							case 0:
								$dialogList.not(":eq("+ _dialogFlag +")").removeClass("opacity");
								break;
							case 1:
								$dialogList.not(":eq("+ _dialogFlag +")").not(".ost").removeClass("opacity");
								break;
							default:
								console.log("undefinition type _co: " + _co);
						}
						// setTimeout(function(){$dialogList.removeClass("opacity");},1000);
						// console.log(1111);
					}

					var _titleShow = $dialogList.eq(_dialogFlag).data("titleShow");
					if(_titleShow!==undefined){
						$(".otherAnimate").addClass("animated08 lightSpeedInLeft").find(".setHide").show().siblings().hide();
					}
					// $dialog.attr("src","./audio/"+$dialogList.eq(_dialogFlag).data("sourse")+".mp3");
				}else{
					clearTimeout(dialogTime);
					dialogTime = null;
					dialogStatus = -1;
				}
			})
		}
	}
	/********播放器代码********/
	// function initVideo(url){
	// 	var video_html='';
	// 	if(browser == "IE"){
	// 		var maxRes;
	// 		maxRes = "video/"+url+".wmv";
	// 		video_html = video_html + "<object classid='CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6' height='522' width='928' class='MediaPlayer' type='application/x-oleobject' codebase='http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701'>";
	// 		video_html = video_html + '<param name="uiMode" value="none"/>';
	// 		video_html = video_html + '<param name="URL" value="'+maxRes+'" />';
	// 		video_html = video_html + '<param name="WindowlessVideo" value="1" />';
	// 		video_html = video_html + '<param name="autoStart" value="false">';
	// 		video_html = video_html + '</object>';
	// 	}else{
	// 		video_html = video_html + '<video src="video/'+url+'.mp4" preload="auto" class="MediaPlayer" height="522" width="928"></video>';
	// 	}
	// 	return video_html;
	// }

	// $(".videoBox").each(function(){
	// 	var url = $(this).attr("id");
	// 	$(this).html(initVideo(url));
	// 	//setVolume($(this).find(".MediaPlayer")[0]);
	// })

	function updataProgress(){
		// var zoom = $("body").attr("zoom");
		var $pro = $(".progress");
		clearInterval(barMove);
		barMove = null;

		var maxWidth = parseInt($pro.width());

		switch(screenType){
			case 0:
				break;
			case 1:
				$pro.find("div.pro").animate({"width":maxWidth},getTime(allTime)*1000+200,"linear");		//增加200毫米时间 使进度条感觉更和时间相当
				break;
			case 2:
				barMove = setInterval(function(){
					var tarWidth = (stayTime+0.1)/getTime(allTime)*maxWidth;
					$pro.find("div.pro").css({"width":tarWidth});
					},100);
				break;
			case 3:
				barMove = setInterval(function(){
					var tarWidth = (stayTime+0.1)/getTime(allTime)*maxWidth;
					$pro.find("div.pro").css({"width":tarWidth});
					},100);
				break;
			default:
				console.log("错误的screenType类型："+screenType);
		}
	}

	//更新在本页停留时间 0.1秒stayTime+ 0.1
	function updataTime(){
		stayTo = setInterval(function(){ stayTime = stayTime+0.1; updataTimeShow(); if( parseInt(stayTime) == getTime(allTime)){ clearInterval(stayTo); $(".nextBtn").trigger('click'); } },100);
	}

	//更新显示时间
	function updataTimeShow(){
		$(".time").html(setTime(stayTime)+"/"+allTime.split(".")[0]);
	}

	//字符串转换为秒 例 01:15 => 75
	//	||参数 str 为 时间显示格式，返回，秒数
	function getTime(str){
		var time = str.split(":"),
			second = 0;
		switch(time.length){
			case 1:
				second = parseInt(time);
				break;
			case 2:
				second = parseInt(time[0])*60 + parseInt(time[1]);
				break;
			case 3:
				second = parseInt(time[0])*3600 + parseInt(time[1])*60 +parseInt(time[0]);
				break;
			default:
				console.log("错误的时间位数："+time.length);
		}
		return second;
	}

	//描述转换为显示时间 例 75 => 01:15
	//	|| 参数 time		传递进入的时间 单位为秒
	//	|| 参数 bit		传递返回时间的格式显示几位 默认为2 即返回 00:00 型数据

	function setTime(time,bit){
		var hour = Math.floor(time/3600),
			minute = Math.floor(time/60) - hour*60,
			second = parseInt(time%60);

		if(bit==undefined){ bit = 2; }	//默认为2

		var str = "";

		switch(bit){
			case 1:
				str = completeTime(second);
				break;
			case 2:
				str = completeTime(minute)+":"+completeTime(second);
				break;
			case 3:
				str = completeTime(hour)+":"+completeTime(minute)+":"+completeTime(second);
				break;
			default:
				console.log("错误的时间位数："+bit);
		}
		return str;

	}

	//补全时间数 里 7 => 07
	function completeTime(num){
		var str = "";

		if(num>=10){
			str = num;
		}else{
			str = "0"+num;
		}
		return str;
	}
	//处理 screenType 为 0 时 的播放按钮
	//	功能：当前屏幕为操作类型的页面时，初始化页面
	//
	//	screenType 为全局变量，规定当前屏幕的状态
	//	||data-type		当前屏幕类型
	//		|| 值 0		当前屏幕 不计算时间 为操作类 类型页面
	//		||    1		当前屏幕 计算时间 但不是视频
	//		||    2		当前屏幕 计算时间 且页面只包含一个视频
	//		||    3		当前屏幕 计算时间 为重点分析页面
	function pBtnHandleType0(){
		var handle = $activeScreen.data("handle");
		      _scoreIndex = $activeScreen.data("score");
		//console.log(handle);

		switch(handle){
			case "score":
				if(scoreFlag){ score(_scoreIndex);scoreFlag = false; }
				else{ $(".nextBtn").trigger('click');scoreFlag=true; }
				break;
			case "card":
				cardInit();
				break;
			case "select":
				select(_scoreIndex);
				break;
			case "drag":
				dragInit();
				break;
			case "sound":
				soundInit();
				break;
			default:
				console.log("未定义handle类型："+handle);
		}

	}

	//处理 screenType 为 1 时 的播放按钮
	//	||参数 $tar 为当前的播放按钮
	//
	//	screenType 为全局变量，规定当前屏幕的状态
	//	||data-type		当前屏幕类型
	//		|| 值 0		当前屏幕 不计算时间 为操作类 类型页面
	//		||    1		当前屏幕 计算时间 但不是视频
	//		||    2		当前屏幕 计算时间 且页面只包含一个视频
	//		||    3		当前屏幕 计算时间 为重点分析页面
	function pBtnHandleType1($tar){
		switch(playStatus){
			case 0:					//初次点击
				updataTime();
				updataProgress();
				$tar.addClass("pauseBtn");
				playStatus = 1;
				break;
			case 1:					//点击暂停
				$(".progress div.pro").pause();
				clearInterval(stayTo);
				$tar.removeClass("pauseBtn");
				playStatus = 2;
				break;
			case 2:					//点击继续
				$(".progress div.pro").resume();
				stayTo = setInterval(function(){ stayTime = stayTime+0.1; updataTimeShow(); if( parseInt(stayTime) == getTime(allTime)){ clearInterval(stayTo); $(".nextBtn").trigger('click'); } },100);
				$tar.addClass("pauseBtn");
				playStatus = 1;
				break;
			default:
				console.log("错误的playStatus："+playStatus);
		}
	}


	//处理 screenType 为 2 时 的播放按钮 即整个屏幕都是对话时
	//	||参数 $tar 为当前的播放按钮
	//
	//	screenType 为全局变量，规定当前屏幕的状态
	//	||data-type		当前屏幕类型
	//		|| 值 0		当前屏幕 不计算时间 为操作类 类型页面
	//		||    1		当前屏幕 计算时间 但不是视频
	//		||    2		当前屏幕 计算时间 且页面只包含一个视频
	//		||    3		当前屏幕 计算时间 为重点分析页面
	function pBtnHandleType2($tar){
		var $pro = $(".progress"),
			maxWidth = parseInt($pro.width());
		// progressHandle($pro,"hor");
		switch(playStatus){
			case 0:					//初次点击
				updataTime();
				updataProgress();
				$tar.addClass("pauseBtn");
				playStatus = 1;
				break;
			case 1:					//点击暂停
				clearInterval(barMove);
				clearInterval(stayTo);
				$tar.removeClass("pauseBtn");
				playStatus = 2;
				break;
			case 2:
				barMove = setInterval(function(){
					var tarWidth = (stayTime+0.1)/getTime(allTime)*maxWidth;
					$pro.find("div.pro").css({"width":tarWidth});
					},100);
				stayTo = setInterval(function(){ stayTime = stayTime+0.1; updataTimeShow(); if( parseInt(stayTime) == getTime(allTime)){ clearInterval(stayTo); $(".nextBtn").trigger('click'); } },100);
				$tar.addClass("pauseBtn");
				playStatus = 1;
				break;
			default:
				console.log("错误的playStatus："+playStatus);
		}
	}

	//处理 screenType 为 3 时 的播放按钮
	//	||参数 $tar 为当前的播放按钮
	//
	//	screenType 为全局变量，规定当前屏幕的状态
	//	||data-type		当前屏幕类型
	//		|| 值 0		当前屏幕 不计算时间 为操作类 类型页面
	//		||    1		当前屏幕 计算时间 但不是视频
	//		||    2		当前屏幕 计算时间 且页面只包含一个视频
	//		||    3		当前屏幕 计算时间 为重点分析页面
	function pBtnHandleType3($tar){
	}

	//进度条控制
	//	|| 参数 $tar	目标选择器
	//	|| 参数 limit	限制
	//		|| hor		只水平方向	为进度控制
	//		|| ver		只垂直方向	为音量控制
	// function progressHandle($tar,limit){
	// 	var on=false;		//拖拽状态下的控制器
	// 	var offset=$tar.offset(),
	// 		maxWidth = parseInt($tar.width()),
	// 		maxHeight= parseInt($tar.height());
	// 	var zoom = 1;

	// 	if($("body").attr("zoom")!=undefined){
	// 		zoom = $("body").attr("zoom");
	// 	}

	// 	$tar.mousedown(function(e){
	// 		var $this = $(this);
	// 		offset=$tar.offset();	//重新定义，全屏状态与非全屏状态有差异

	// 		if(f_IsFullScreen()){	//如果是全屏状态下，重新定义
	// 		var dbcw = document.body.offsetWidth;
	// 			zoomF = Math.floor(dbcw/12.8)/100;
	// 			zoom = 1;
	// 		}

	// 		on=true;
	// 		if(on){
	// 			e=e || window.event;
	// 			var left=e.pageX-offset.left,
	// 				top=e.pageY-offset.top;
	// 				left=left/zoom;
	// 				top =top/zoom;
	// 				if(f_IsFullScreen()){				//如果是全屏状态下，重新定义
	// 					left = left/zoomF;
	// 					top = top/zoomF;
	// 				}

	// 			if(limit == "hor"&&screenType==2&&screenType==2){
	// 				if(left > maxWidth){ left = maxWidth; }
	// 				if(left < 0){ left = 0; }
	// 				// $(this).find('div').animate({"width":left},100);
	// 				clearInterval(barMove);
	// 				barMove = null;
	// 				$(this).find('div').animate({"width":left},50);
	// 				barMove = setInterval(function(){
	// 					var tarWidth = (stayTime+0.1)/getTime(allTime)*maxWidth;
	// 					$this.find("div").css({"width":tarWidth});
	// 					},100);
	// 				var newTime = parseInt(left/maxWidth*getTime(allTime)*10)/10;
	// 				stayTime = newTime;
	// 				// updataVideoTime(newTime);
	// 				updataTimeShow();
	// 			}else if(limit == "ver"){
	// 				if(top > maxHeight){ top = maxHeight; }
	// 				if(top < 0){ top = 0; }
	// 				$(this).find('div').animate({"height":maxHeight-top},100).siblings('i').animate({"top":top},100);
	// 				volume = parseInt((maxHeight-top)/maxHeight*100)/100;
	// 				changeVolunePic();

	// 				setVolume($(".MediaPlayer")[0]);
	// 			}
	// 		}
	// 	})

	// 	$tar.mousemove(function(e){
	// 		var $this = $(this);
	// 		offset=$tar.offset();			//重新定义，全屏状态与非全屏状态有差异
	// 		if(f_IsFullScreen()){			//如果是全屏状态下，重新定义
	// 		var dbcw = document.body.offsetWidth;
	// 			zoomF = Math.floor(dbcw/12.8)/100;
	// 			zoom = 1;
	// 		}
	// 		if(on){
	// 			e=e || window.event;
	// 			var left=e.pageX-offset.left,
	// 				top=e.pageY-offset.top;
	// 				left=left/zoom;
	// 				top =top/zoom;
	// 			if(f_IsFullScreen()){		//如果是全屏状态下，重新定义
	// 				left = left/zoomF;
	// 				top = top/zoomF;
	// 			}

	// 			e.preventDefault();
	// 			if(limit == "hor"&&screenType==2){
	// 				if(left > maxWidth){ left = maxWidth; }
	// 				if(left < 0){ left = 0; }
	// 				// $(this).find('div').css({"width":left});
	// 				clearInterval(barMove);
	// 				barMove = null;
	// 				$(this).find('div').css({"width":left});
	// 				barMove = setInterval(function(){
	// 					var tarWidth = (stayTime+0.1)/getTime(allTime)*maxWidth;
	// 					$this.find("div").css({"width":tarWidth});
	// 					},100);
	// 				var newTime = parseInt(left/maxWidth*getTime(allTime)*10)/10;
	// 				stayTime = newTime;
	// 				// updataVideoTime(newTime);
	// 				updataTimeShow();

	// 			}else if(limit == "ver"){
	// 				if(top > maxHeight){ top = maxHeight; }
	// 				if(top < 0){ top = 0; }
	// 				if(!$(this).find('div').is(":animated")){
	// 					$(this).find('div').css({"height":maxHeight-top}).siblings('i').css({"top":top});
	// 				}
	// 				volume = parseInt((maxHeight-top)/maxHeight*100)/100;
	// 				changeVolunePic();

	// 				//if(MediaPlayer){ setVolume($(".MediaPlayer")[0]);}
	// 				setVolume($(".MediaPlayer")[0]);
	// 			}
	// 		}
	// 	})

	// 	$tar.mouseup(function(){
	// 		on=false;
	// 	})
	// }

	//重点分析进度条控制
	//	|| 参数 $tar	目标选择器
	// function progressAns($tar){
	// 	var on=false;		//拖拽状态下的控制器
	// 	var offset=$tar.offset(),
	// 		maxWidth = parseInt($tar.width()),
	// 		maxHeight= parseInt($tar.height());
	// 	var zoom = 1;

	// 	if($("body").attr("zoom")!=undefined){
	// 		zoom = $("body").attr("zoom");
	// 	}

	// 	$tar.mousedown(function(e){
	// 		var $this = $(this);
	// 		offset=$tar.offset();	//重新定义，全屏状态与非全屏状态有差异

	// 		if(f_IsFullScreen()){	//如果是全屏状态下，重新定义
	// 		var dbcw = document.body.offsetWidth;
	// 			zoomF = Math.floor(dbcw/12.8)/100;
	// 			zoom = 1;
	// 		}
	// 		on=true;
	// 		if(on){
	// 			e=e || window.event;
	// 			var left=e.pageX-offset.left,
	// 				top=e.pageY-offset.top;
	// 				left=left/zoom;
	// 				top =top/zoom;
	// 				if(f_IsFullScreen()){				//如果是全屏状态下，重新定义
	// 					left = left/zoomF;
	// 					top = top/zoomF;
	// 				}

	// 			if(screenType==3){
	// 				if(left > maxWidth){ left = maxWidth; }
	// 				if(left < 0){ left = 0; }
	// 				clearInterval(barMove);
	// 				barMove = null;
	// 				$(this).find('div').animate({"width":left},50);
	// 				barMove = setInterval(function(){
	// 					var tarWidth = (stayTime+0.1)/getTime(allTime)*maxWidth;
	// 					$this.find("div").css({"width":tarWidth});
	// 					},100);

	// 				var newTime = parseInt(left/maxWidth*getTime(allTime)*10)/10;
	// 				stayTime = newTime;
	// 				updataTimeShow();
	// 			}
	// 		}
	// 	})

	// 	$tar.mousemove(function(e){
	// 		var $this = $(this);

	// 		offset=$tar.offset();			//重新定义，全屏状态与非全屏状态有差异

	// 		if(f_IsFullScreen()){			//如果是全屏状态下，重新定义
	// 		var dbcw = document.body.offsetWidth;
	// 			zoomF = Math.floor(dbcw/12.8)/100;
	// 			zoom = 1;
	// 		}
	// 		if(on){
	// 			e=e || window.event;
	// 			var left=e.pageX-offset.left,
	// 				top=e.pageY-offset.top;
	// 			left=left/zoom;
	// 			top =top/zoom;
	// 			if(f_IsFullScreen()){		//如果是全屏状态下，重新定义
	// 				left = left/zoomF;
	// 				top = top/zoomF;
	// 			}

	// 			e.preventDefault();
	// 			if(screenType==3){
	// 				if(left > maxWidth){ left = maxWidth; }
	// 				if(left < 0){ left = 0; }
	// 				clearInterval(barMove);
	// 				barMove = null;
	// 				$(this).find('div').css({"width":left});
	// 				var newTime = parseInt(left/maxWidth*getTime(allTime)*10)/10;
	// 				stayTime = newTime;
	// 				barMove = setInterval(function(){
	// 					var tarWidth = (stayTime+0.1)/getTime(allTime)*maxWidth;
	// 					$this.find("div").css({"width":tarWidth});
	// 					},100);
	// 				updataTimeShow();
	// 			}
	// 		}
	// 	})

	// 	$tar.mouseup(function(){
	// 		on=false;
	// 		anaFlag = 0;
	// 		dragAns($activeScreen,Math.round(stayTime*1000));
	// 	})
	// }

	//更新声音
	// function setVolume(player){
	// 	if(browser == "IE"){
	// 		player.settings.volume=volume*100;
	// 	}else{
	// 		player.volume=volume;
	// 	}
	// }

	//更新播放进度
	function updataVideoTime(newTime){
		if(browser == "IE"){
			MediaPlayer.Controls.CurrentPosition = newTime;
		}else{
			MediaPlayer.currentTime = newTime;
		}
	}

	//切换声音播放图片
	//		|| 0.6 以上 为两道标
	//		|| 0.6 以下 为一道标
	//		|| 0 为没有标志
	// function changeVolunePic(){
	// 	if(volume > 0.6){
	// 		$(".sound").removeClass('sound2 sound1');
	// 	}else{
	// 		$(".sound").addClass('sound1').removeClass('sound2');
	// 	}

	// 	if(volume == 0){
	// 		$(".sound").addClass('sound2').removeClass('sound1');
	// 	}
	// }

	//更新链接
	function updataUrl(thisNum){
        		var url = window.location.href,
        			jumpNum = url.split("#")[1];
        		if(jumpNum == undefined){
        			window.location.href = url + "#" +thisNum;
        		}else{
        			window.location.href = url.split("#")[0] + "#" +thisNum;
        		}
    	}

	//全屏处理
	function fullScreen(element) {
		if(element.requestFullScreen){
			element.requestFullScreen();
		}else if(element.webkitRequestFullScreen){
			element.webkitRequestFullScreen();
		}else if(element.mozRequestFullScreen){
			element.mozRequestFullScreen();
		}else if(element.msRequestFullscreen){
			element.fullScreen=1;
			element.msRequestFullscreen();
 		}
	}

	//退出全屏
	function fullScreenCancel() {
	  	if(document.exitFullscreen) {
	  	 	document.exitFullscreen();
	  	 } else if(document.mozCancelFullScreen) {
	  	  	document.mozCancelFullScreen();
	  	 } else if(document.webkitExitFullscreen) {
	  	  	document.webkitExitFullscreen();
	  	 }else if(document.msRequestFullscreen){
			document.fullScreen=0;
			document.msExitFullscreen();
 		}
	}

	//呼出进度跳转面板
	var tJmp = null;
	$(".orderBox").on("click",function(){
		$(".jumpBox").fadeIn();
		if(tJmp!=null){
			clearTimeout(tJmp);
		}
		tJmp = setTimeout(function(){ $(".jumpBox").fadeOut(); },1500);
	})
	$(".orderBox").on("mouseenter",function(){
		$(".jumpBox").fadeIn();
		if(tJmp!=null){
			clearTimeout(tJmp);
		}
		tJmp = setTimeout(function(){ $(".jumpBox").fadeOut(); },1500);
	})


	$(".jumpBox").on("mouseover",function(){
		clearTimeout(tJmp);
	})
	$(".jumpBox").on("mouseout",function(){
		tJmp = setTimeout(function(){ $(".jumpBox").fadeOut(); },600);
	})

	//呼出声音控制面板
	// var tSound = null;
	// $(".sound").on("click",function(){
	// 	$(".volume").fadeIn();
	// 	tSound = setTimeout(function(){ $(".volume").fadeOut(); },1500);
	// 	progressHandle($(".vProgress"),"ver");
	// })

	// $(".volume").on("mouseover",function(){
	// 	clearTimeout(tSound);
	// })
	// $(".volume").on("mouseout",function(){
	// 	tSound = setTimeout(function(){ $(".volume").fadeOut(); },600);
	// })

	//下一屏
	$(".nextBtn").on("click",function(){
		if(!$(this).hasClass("nextNone")){
			var tIndex = $activeScreen.index(),
				maxIndex = $(".screen:last").index();
			$activeScreen.next().show().siblings().hide();
			$activeScreen = $(".screen:visible");
			initContol($activeScreen);

			//暂停计时
			// if(typeof(countdown) !== "undefined"){	countdown.pause();	}
			// if(typeof(countdown2) !== "undefined"){	countdown2.pause();	}

			$(".prevNone").removeClass('prevNone');
			if(tIndex + 1 == maxIndex){
				$(this).addClass('nextNone');
			}

		}
	})

	//上一屏
	$(".prevBtn").on("click",function(){
		if(!$(this).hasClass("prevNone")){
			var tIndex = $activeScreen.index();
			$activeScreen.prev().show().siblings().hide();
			$activeScreen = $(".screen:visible");
			initContol($activeScreen);

			//暂停计时
			// if(typeof(countdown) !== "undefined"){	countdown.pause();	}
			// if(typeof(countdown2) !== "undefined"){	countdown2.pause();	}

			$(".nextNone").removeClass('nextNone');
			if(tIndex - 1 == 0){
				$(this).addClass('prevNone');
			}

		}
	})

	// 跳转
	$(".jumpBox li").on("click",function(){
		var jumpId = $(this).data("jumpId");
		$activeScreen = $(".screen").eq(jumpId);
		$activeScreen.show().siblings().hide();
		initContol($activeScreen);

		//暂停计时
		// if(typeof(countdown) !== "undefined"){	countdown.pause();	}
		// if(typeof(countdown2) !== "undefined"){	countdown2.pause();	}

		$(".nextNone").removeClass('nextNone');
		$(".prevNone").removeClass('prevNone');

		if(jumpId === 0){
			$(".prevBtn").addClass('prevNone');
		}
	})

	//全屏
	$(".fullScreen").on("click",function(){
		var $tar = $("#content")[0];

		if(!f_IsFullScreen()){	//不是全屏
			fullScreen($tar);
		}else{
			fullScreenCancel();
		}
	});

	// 翻译
	$(".translate").on("click",function(){
		$(this).toggleClass("translated");
		$(".chShow").toggle();
	})

	$(".funLexicon").on("click",function(){
		// console.log(playStatus);
		var $this = $(this),
		      _lex = $this.data("lex"),
		      $tarBox = $(".lexiconDes[data-lex=" + _lex+ "]");

		localStorage.setItem("notFirst",1);
		$("#firstTips").hide();

		if(playStatus === 1){
			$(".playBtn").trigger("click");
		}
		if(!$tarBox.is(":visible")){
			$(".lexiconDes").hide();
			$tarBox.show();
			$lexicon.attr("src","./audio/"+ $tarBox.data("sourse") +".mp3");
		}else{
			$(".funPlayLex").trigger("click");
		}
	});

	$(".funPlayLex").on("click",function(){
		$lexicon[0].play();
	});

	$(".funPlayTest").on("click",function(){
		$lexicon.attr("src","./audio/"+ $(this).data("sourse") +".mp3");
	});

	$(".funDownList>span").on("click",function(){
		var $this = $(this).parent();

		if(!$this.hasClass("likeDLShowed")){
			$this.addClass("likeDLShowed").find(".dlist").slideDown();
			if(playStatus === 1){$(".playBtn").trigger("click");}
		}else{
			$this.removeClass("likeDLShowed").find(".dlist").slideUp();
			if(playStatus === 2){$(".playBtn").trigger("click");}
		}

		localStorage.setItem("notFirst2",1);
		$("#firstTips2").hide();
	})
	$(".dlist>li").on("click",function(){
		var $this = $(this),
		      _lex = $this.parents(".funDownList").data("lex"),
		      $tarBox = $(".lexiconDes[data-lex=" + _lex+ "]");

		if($this.hasClass("bingo")){
			$this.addClass("dlRight").siblings().removeClass("dlRight dlError");
		}else{
			$this.addClass("dlError").siblings().removeClass("dlRight dlError");
		}

		if(!$tarBox.is(":visible")){
			$(".lexiconDes").hide();
			$tarBox.show();
			$lexicon.attr("src","./audio/"+ $tarBox.data("sourse") +".mp3");
		}
	})
	//下一关卡
	$(".funNext").on("click",function(){
		$(".nextBtn").trigger('click');
	})

	//播放当前对话录音
	$(".funPlaySound").on("click",function(){
		if(!$(this).hasClass("cantClick")){
			$dialog[0].pause();
			if($(this).hasClass("voiceing")){
				$(this).removeClass("voiceing");
				$dialogReplay[0].pause();
			}else{
				$(this).addClass("voiceing");
				$dialogReplay.attr("src",$dialog.attr("src"));
			}
		}
	})


	var mediaConstraints = {
	    audio: true
	};
	var recordUrl;
	window.URL = window.URL || window.webkitURL;
	// window.URL = window.URL || window.webkitURL;
	      // recordFile = new File('record.wav', { type: 'audio/wav' });

	      // console.log(recordFile);

	function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
	    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
	}

	function onMediaSuccess(stream) {
		mediaRecorder = new MediaStreamRecorder(stream);
		mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
		mediaRecorder.ondataavailable = function (blob) {
			recordUrl = window.URL.createObjectURL(blob);
		};
		mediaRecorder.start(20000);
		// console.log(111);

	}

	function onMediaError(e) {
	    console.error('media error', e);
	    $(".funPlaySound").removeClass("cantClick");
	    $(".recording").removeClass("recording");
	}

	//录音
	$(".funRecord").on("click",function(){
		if(!$(this).hasClass("recording")){
			$(this).addClass("recording").siblings().not(".funNextDlg").addClass("cantClick");
			$(".funPlaySound").removeClass("voiceing");
			$dialog[0].pause();
			$dialogReplay[0].pause();
			$recordReplay[0].pause();
			captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
		}else{
			mediaRecorder.stop();
			$(this).removeClass("recording");
			$(this).siblings().removeClass("cantClick");
		}
	})

	$dialogReplay.on("ended",function(){
		$(".voiceing").removeClass("voiceing");
	})

	$recordReplay.on("ended",function(){
		$(".pauseIcon").removeClass("pauseIcon");
	})

	//播放录音
	$(".funPlayRecord").on("click",function(){
		var $this = $(this);
		if(!$this.hasClass("cantClick")){
			if($this.hasClass("pauseIcon")){
				$recordReplay[0].pause();
				$this.removeClass("pauseIcon");
			}else{
				$dialog[0].pause();
				$dialogReplay[0].pause();
				$recordReplay.attr("src",recordUrl);
				$this.addClass("pauseIcon");
			}
		}
	})

	// 下一段录音
	$(".funNextDlg").on("click",function(){
		var _index = $(this).parents(".dialogItem").index()-1;
		$("#adjustProgress>div").eq(_index).trigger("click");
	})

});