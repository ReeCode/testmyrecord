/* * 听声选择游戏
*
*
*
*
*
*
* */

//定时器
var soundTimer = null;


/* 初始化*/
var soundInit = function(){
	//清空计时器
	clearInterval(soundTimer);
	soundTimer = null;

	//显示开始界面
	$(".soundBegin").show().siblings('div').hide();

	//初始化题目
	$(".soundArea .soundQus").eq(0).show().siblings('div').hide();

	//移除反馈信息
	$(".sRightFb,.sWrongFb").remove();

}

// 返回成绩
var soundScore = (function(){

	var soundTimer2 = null;
	//存储成绩
	var rtn = [];
	rtn[0] = $(".soundQus").length;
	rtn[1] = 0;

	//存储错误的内容
	var errorWords=[];

	var maxNum = 5,
		countNum = maxNum;

	var maxOrder = $(".soundArea .soundQus").length;


	/* 开始 */
	$(".soundStart").on("click",function(){
		var $this = $(this),
			$tp = $(this).parents(".soundBegin");

		//清除计时器
		clearTimeout(soundTimer2);
		soundTimer2 == null;

		//清空错误词汇
		errorWords=[];
		//恢复倒计时
		countNum = maxNum;
		if(countNum >= 10){
			$(".countDown").html("<span>"+parseInt(countNum/10)+"</span><span>"+countNum%10+"</span>");
		}else{
			$(".countDown").html("<span>0</span><span>"+countNum+"</span>");
		}

		//重新开始后，该项目成绩为0
		rtn[1] = 0;

		//更新当前order
		updataSoundOrder(1);

		$tp.hide().next().show();

		$qusV = $tp.next().find(".soundQus:visible");

		var soundId = $qusV.attr("id");
			playSoundS(soundId);
		
		soundTimer = setInterval(function(){
			if(countNum >= 10){
				$(".countDown").html("<span>"+parseInt(countNum/10)+"</span><span>"+countNum%10+"</span>");
				countNum--;
			}else if(countNum !=0 && countNum <=99){
				$(".countDown").html("<span>0</span><span>"+countNum+"</span>");
				countNum--;
			}else if(countNum === 0){
				$(".countDown").html("<span>0</span><span>"+countNum+"</span>");
				$qusV = $tp.next().find(".soundQus:visible");
				soundNextShow($qusV,true);
			}
		},1000);

	});



	/* 选项选择 */
	var oneFlag = true;
	$(".soundQus li").on("click",function(){

		//反馈
		if(oneFlag){
			oneFlag = false;
			if($(this).hasClass('bingo')){
				$(this).append("<i class='sRightFb'></i>");
				rtn[1]++;
			}else{
				$(this).append("<i class='sWrongFb'></i>");
				var _errorWord = $(this).siblings('.bingo').find("span").html();
				setErrorWords(_errorWord);
			}

			var $tp = $(this).parents(".soundQus");
			//切换下一组
			soundNextShow($tp,false);
		}

	})

	function updataSoundOrder(tIndex){
		$(".soundOrder").html(tIndex+"/"+maxOrder);
	}

	function setErrorWords(errorWord){
		var _strError = "<li title='"+errorWord+"' ><span>"+ errorWord +"</span><i class='soundBtnS'></i></li>";
			errorWords.push(_strError);
	}

	function soundNextShow($tp,passFlag){
		if(passFlag){	//表示未选择
			var _errorWord = $tp.attr("id");
			setErrorWords(_errorWord);
		}
		var $next = $tp.next();
		if($next.length != 0){		//后续卡组
			soundTimer2 = setTimeout(function(){
				var nOrder = $next.index()+1;
				updataSoundOrder(nOrder);
				countNum = maxNum;
				$tp.hide().next().show();
				var soundId = $next.attr("id");
				playSoundS(soundId);
				oneFlag = true;
			},600);
		}else{						//无后续卡组
			soundTimer2 = setTimeout(function(){
				if(errorWords.length == 0){
					$tp.parents(".soundArea").next().find(".fbWin").show().siblings('div').hide();
				}else{
					$tp.parents(".soundArea").next().find(".fbFail").show().siblings('div').hide();
					$tp.parents(".soundArea").next().next().find("ul").html(errorWords);
				}
				$tp.parents(".soundArea").hide().next().show();
				clearInterval(soundTimer);
				oneFlag = true;
			},600);
		}
	}

	//查看错词
	$(".showErrorWords").on("click",function(){
		$(this).parents(".allFb").hide().next().show();
	})

	//错误词汇发音
	$(document).on("click",".errorWords li",function(){
		var soundId = $(this).attr("title");
		playSoundS(soundId);
	})

	//答题中重复发音
	$(".soundBtn").on("click",function(){
		var soundId = $(this).parents(".soundArea").find(".soundQus:visible").attr("id");
		playSoundS(soundId);
	})

	//重新开始
	$(".funSRetry").on("click",function(){
		soundInit();
	});

	return rtn;
})();

//播放音效
function playSoundS(url){
	$("#sound").remove();
	$("body").append('<audio id="sound" autoplay="autoplay" src="sound/listen/'+url+'.mp3" style="display:none;"></audio>');
	setTimeout(function(){$("#sound")[0].play();},100);
}