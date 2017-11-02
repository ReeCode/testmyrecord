if(typeof(scoreItem) === "undefined"){
	 var scoreItem = [[1,0],[1,0]];
}

var select = function(_index){
	//选择题类型
	var $thisScreen = $(".screen:visible"),
	      $qusTar = $thisScreen.find(".qusBox:visible"),			//当前问题
	      _thisScreenQusLength = $thisScreen.find(".qusBox").length,	//当前屏幕的问题数
	      $submit = $thisScreen.find(".submit"),
	      $prevQus = $thisScreen.find(".prevQus"),
	      $nextQus = $thisScreen.find(".nextQus"),
	      $feedbackBtn = $thisScreen.find(".feedbackBtn"),
	      $ansBoxP = $thisScreen.find(".ansBox p");

	scoreItem[_index][0] = _thisScreenQusLength;

	$(".submit,.prevQus,.nextQus").off("click");
	if($thisScreen.find(".qusBox").index($qusTar) === 0){
		setQusPro();
	}

	$ansBoxP.on("click",function(){
		var $this = $(this),
			$tp = $this.parent();
		if($qusTar.data("ansStatus") == 0 ){			//如果未回答正确前 可以进行尝试
			if($tp.hasClass('multiple')&&$this.hasClass('active')){				//多选
				$this.removeClass('active');
			}else if($tp.hasClass('multiple')){
				$this.addClass('active');
			}else{
				$this.addClass('active').siblings().removeClass('active');
			}

			$tp.find(".rightFb,.wrongFb").remove();
			$tp.next(".qusAns").css("visibility","hidden");
		}
	})

	$submit.on("click",function(){
		if($qusTar.find(".active").length&&$qusTar.data("ansStatus") != 1){
			$qusTar.find(".rightFb,.wrongFb").remove();
			$qusTar.find(".qusAns").css("visibility","visible");
			if($qusTar.find(".ansBox").hasClass('multiple')){		//多选
				var multipleFlag = false;
				$qusTar.find(".active").each(function(){
					if($(this).hasClass('bingo')){
						$(this).append("<i class='rightFb'></i>");
					}else{
						multipleFlag = true;
						$(this).append("<i class='wrongFb'></i>");
					}
				});

				$qusTar.find(".bingo").each(function(){
					if(!$(this).hasClass('active')){
						multipleFlag = true;
						$(this).append("<i class='wrongFb'></i>");
					}
				})

				if(!multipleFlag){
					$qusTar.data("ansStatus","1");
					scoreItem[_index][1]++;
				}

			}else{													//单选
				if($qusTar.find(".active").hasClass('bingo')){
					$qusTar.find(".active").append("<i class='rightFb'></i>");
					$qusTar.data("ansStatus","1");
					scoreItem[_index][1]++;
				}else{
					$qusTar.find(".active").append("<i class='wrongFb'></i>");
				}
			}
		}else if($qusTar.data("ansStatus") == 1){
		}else{
			alert("请选择选项！");
		}
	})

	$prevQus.on("click",function(){
		$nextQus.removeClass('hideBtn');
		$feedbackBtn.addClass('hideBtn');
		if($qusTar.prev().length!=0&&$qusTar.prev().hasClass('qusBox')){
			$qusTar.prev().show().siblings(".qusBox").hide();
			$qusTar = $qusTar.prev();
			setQusPro();

			if($qusTar.prev().length==0||!$qusTar.prev().hasClass('qusBox') ){ $(this).addClass('hideBtn'); }
		}
	})

	$nextQus.on("click",function(){
		$prevQus.removeClass('hideBtn');
		if($qusTar.next().length!=0&&$qusTar.next().hasClass('qusBox')){
			$qusTar.next().show().siblings(".qusBox").hide();
			$qusTar = $qusTar.next();
			setQusPro();
			if($qusTar.next().length==0||!$qusTar.next().hasClass('qusBox')){ $(this).addClass('hideBtn'); $feedbackBtn.removeClass('hideBtn'); }
		}
	})

	function setQusPro(){
		var qusVIndex = $thisScreen.find(".qusBox").index($qusTar);
			perBlockWidth = parseInt($(".screen").width())/(_thisScreenQusLength);

		$thisScreen.find(".qusProgress div").animate({"width": perBlockWidth*(qusVIndex+1)});
	}
};