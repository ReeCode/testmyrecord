/* * 拖拽游戏
*
*
*
*
*
*
* */

//初始化时间
var countdown2 = $('.countdownBox2').downCount({
	date: '30'
}, function () {
	playSound("fail");
	$(".dragFail,.grayBg").show();
});

var nPosArray=[],
	allBingoFlag=-1;
var dragInit = function(){
	$(".dragRuleBox").show().siblings('.dragPob,.dragTips').hide();
	$(".dragBox,.grayBg").hide();
	countdown2.reset();

	//初始化位置
	//配置初始化信息
	var _container = ".dragBox",	//卡片容器
		_gameCard = ".dragItem",	//卡片项
		_space = 15,				//随机范围
		_rangeHor = 30,				//左右边距距离
		_rangeVer = 50,				//上下边距距离
		_numHor = 5,				//水平分割数
		_numVer = 3;				//垂直分割数

	var posArray = new Array();	//存储位置，卡片位置随机抽取 left,top

	var ciW = parseInt($(_container).width()) - _rangeHor*2,
		ciH = parseInt($(_container).height()) - _rangeVer*2,
		cardNum = parseInt($(_container).find(_gameCard+":last").index())+1;
	allBingoFlag = cardNum/2;

	function initPosArray(){
		for(var i=0; i<_numVer;i++){
			for(var j=0; j<_numHor;j++){
				if(i==0){
					if(j==0){
						posArray.push([_rangeHor,_rangeVer]);
					}else{
						posArray.push([ciW/_numHor*j,_rangeVer]);
					}
				}else{
					if(j==0){
						posArray.push([_rangeHor,ciH/_numVer*i]);
					}else{
						posArray.push([ciW/_numHor*j,ciH/_numVer*i]);
					}
				}
			}
		}
	}

	initPosArray();

	nPosArray = getRandom({"arry":posArray,"range":cardNum});
	// var arrayIndex = 0;
	// $(_container).find(_gameCard).each(function(){
	// 	nPosArray[arrayIndex][0] = nPosArray[arrayIndex][0]+rtnRandom(_space);
	// 	nPosArray[arrayIndex][1] = nPosArray[arrayIndex][1]+rtnRandom(_space);
	// 	$(this).animate({"left":nPosArray[arrayIndex][0],"top":nPosArray[arrayIndex][1]},500);

	// 	arrayIndex++;
	// });
}
//生成随机数
function rtnRandom(opt){
	return Math.round(Math.random()*opt*2)-opt;
}

function dragPosInt(){
	var _container = ".dragBox",	//卡片容器
		_gameCard = ".dragItem",	//卡片项
		_space = 15;				//随机范围
	var arrayIndex = 0;
	$(_container).find(_gameCard).each(function(){
		nPosArray[arrayIndex][0] = nPosArray[arrayIndex][0]+rtnRandom(_space);
		nPosArray[arrayIndex][1] = nPosArray[arrayIndex][1]+rtnRandom(_space);
		$(this).show().animate({"left":nPosArray[arrayIndex][0],"top":nPosArray[arrayIndex][1]},500);

		arrayIndex++;
	});
}

//开始游戏
$(".dragStart").on("click",function(){
	$(this).parents(".dragPob").hide();
	$(".dragBox").fadeIn();
	// dragInit();
	dragPosInt();
	countdown2.start();
})
//弹出提示
$(".dShowTip").on("click",function(){
	var $tp = $(this).parents(".dragPob");
	$tp.hide();
	if($tp.hasClass('dragFail')){
		$(".dTipsBox").show();
	}else if($tp.hasClass('dragWin')){
		$(".dWTipsBox").show();
	}
})

//重新开始
$(".dRetry").on("click",function(){
	dragInit();
})


var dragScore = (function(){
	var _container = ".dragBox",	//卡片容器
		_gameCard = ".dragItem",	//卡片项
		_dragDev = 30;				//拖拽时误差

	var gcW = $(_container).find(_gameCard).width(),
		gcH = $(_container).find(_gameCard).height();

	//返回成绩
	var rtn=[1,0];


	//初始化 拖拽
	var $draggable = $(_gameCard).draggabilly({
		containment: _container
	})
	$draggable.on('dragStart',setDsStart);
	$draggable.on('dragEnd', listenerDs);

	//拖拽开始 设置
	function setDsStart(){
		$(this).css("z-index",1);
	}

	//监听拖拽结束事件
	function listenerDs(){

		var $this = $(this),
			draggie = $this.data('draggabilly'),
			thisIndex = $this.index(_gameCard),
			mateId = $this.data("mateId");

		var flag = -1;

		for(var i = 0;i < nPosArray.length;i++ ){
			if(i!=thisIndex&&draggie.position.x > nPosArray[i][0]-_dragDev*2 && draggie.position.x < nPosArray[i][0]+gcW && draggie.position.y > nPosArray[i][1]-_dragDev*2 && draggie.position.y < nPosArray[i][1]+gcH){
				var $tar = $(_container).find(_gameCard).eq(i),
					tarMateId = $tar.data("mateId");
				if(mateId == tarMateId){
					if(--allBingoFlag!=0){	//未匹配最后一对卡牌
						$(".dRightFb").css({"left":draggie.position.x-100,"top":draggie.position.y-50}).fadeIn();
						setTimeout(function(){$this.fadeOut();$tar.fadeOut();$(".dRightFb").fadeOut();},300);
						playSound("success");
					}else{					//最后一对开拍
						$this.fadeOut();$tar.fadeOut();
						$(".grayBg").show();
						$(this).parents(".screen").find(".dragWin").show();
						playSound("done");
						countdown2.pause();
						rtn[1] = 1;
					}
				}else{
					$(".dWrongFb").css({"left":draggie.position.x,"top":draggie.position.y}).fadeIn();
					setTimeout(function(){$(".dWrongFb").fadeOut();; $this.css("z-index","auto").animate({"left":nPosArray[thisIndex][0],"top":nPosArray[thisIndex][1]},500); },300);
					playSound("warn");
				}
				flag = 1;
				break;
			}
		}

		if(flag == -1){	//未匹配成功
			$this.animate({"left":nPosArray[thisIndex][0],"top":nPosArray[thisIndex][1]},300);
			$this.css("z-index","auto");
		}
		$this.css("z-index","auto");

	}

	return rtn;

})();

//播放音效
function playSound(url){
	$("#sound").remove();
	$("body").append('<audio id="sound" autoplay="autoplay" src="sound/'+url+'.wav" style="display:none;"></audio>');
	setTimeout(function(){$("#sound")[0].play();},100);
}

$(".prevPage").on("click",function(){
	var $this = $(this),
		$tpV = $(this).parents(".poCont").find(".poTable:visible");
	if($tpV.prev(".poTable").length !=0){
		$tpV.hide().prev().show();
		$this.siblings('a').show();
	}
	if($tpV.prev().prev().length == 0){
		$this.hide();
	}


})
$(".nextPage").on("click",function(){
	var $this = $(this),
		$tpV = $(this).parents(".poCont").find(".poTable:visible");
	if($tpV.next(".poTable").length !=0){
		$tpV.hide().next(".poTable").show();
		$this.siblings('a').show();
	}
	if($tpV.next(".poTable").next(".poTable").length == 0){
		$this.hide();
	}
})