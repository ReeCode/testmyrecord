/* * 卡牌游戏
*
*
*
*
*
*
* */

//初始化时间
var countdown = $('.countdownBox').downCount({
	date: '60'
}, function () {
	$(".failBox,.grayBg").show();
	playSound("fail");
});


var mateNum = [];

var cardInit = function(){
	$(".ruleBox").show().siblings('.pushOut').hide();
	$(".cardBox").hide();
	countdown.reset();

	var cardNum =  $(".cardBox .cardItem").length;
	
	mateNum[0] = (Math.floor(cardNum/2));
	mateNum[1] = null;

	//暂时先固定
	var SPACEHOR = 50,	//水平间距
		SPACEVER = 30,	//垂直间距
		_numVer = 2,	//行数
		_numHor = 4;	//列数
	switch(cardNum){
		case 6:
			SPACEHOR = 120,	//水平间距
			SPACEVER = 30,	//垂直间距
			_numVer = 2;
			_numHor = 3;
			break;
		case 8:
			SPACEHOR = 45,	//水平间距
			SPACEVER = 30,	//垂直间距
			_numVer = 2;
			_numHor = 4;
			break;
		case 10:
			SPACEHOR = 20,	//水平间距
			SPACEVER = 30,	//垂直间距
			_numVer = 2;
			_numHor = 5;
			break;
		case 12:
			SPACEHOR = 105,	//水平间距
			SPACEVER = 30,	//垂直间距
			_numVer = 3;
			_numHor = 4;
			$(".cardItem .cardFace span").css({"line-height":"21px","font-size":"18px"});
			break;
		case 14:
			SPACEHOR = 56,	//水平间距
			SPACEVER = 30,	//垂直间距
			_numVer = 3;
			_numHor = 5;
			$(".cardItem .cardFace span").css({"line-height":"21px","font-size":"18px"});
			break;
		case 16:
			SPACEHOR = 25,	//水平间距
			SPACEVER = 12,	//垂直间距
			_numVer = 3;
			_numHor = 6;
			$(".cardItem .cardFace span").css({"line-height":"21px","font-size":"18px"});
			break;
		case 18:
			SPACEHOR = 25;
			SPACEVER = 12;
			_numVer = 3;
			_numHor = 6;
			$(".cardItem .cardFace span").css({"line-height":"21px","font-size":"18px"});
			break;
		default:
			console.log("Undefined cardNum : "+ cardNum);
	}

	var posArray = new Array(); //存储位置，卡片位置随机抽取 left,top

	//初始化位置
	var ciW = parseInt($(".cardBox").width()),
		ciH = parseInt($(".cardBox").height()),
		scale = parseInt($(".cardItem").width())/parseInt($(".cardItem").height()),	//图片比例
		tarWidth = ciW/_numHor - SPACEHOR,
		tarHeight = Math.floor(tarWidth/scale);							//计算过的图片尺寸 高度
		// tarWidth = Math.floor(tarHeight*scale);						//计算过的图片尺寸 宽度

	$(".cardItem .cardFace").css({"line-height":tarHeight+"px"}).find("img").css({"max-width":tarWidth*0.82+"px"});

	// 上下左右边距
	var _rangeHor = Math.floor(ciW - tarWidth*_numHor - SPACEHOR*(_numHor-1))*1.3,
		_rangeVer = 20;							//上下边距距离

	if(cardNum == 10){ _rangeVer = 40; }

	ciW = ciW - _rangeHor*2;
	ciH = ciH - _rangeVer*2;

	function initPosArray(){					//计算位置
		for(var i=0; i<_numVer;i++){
			for(var j=0; j<_numHor;j++){
				if(i==0){
					if(j==0){
						posArray.push([_rangeHor,_rangeVer]);
					}else{
						posArray.push([ciW/_numHor*j+_rangeHor,_rangeVer]);
					}
				}else{
					if(j==0){
						posArray.push([_rangeHor,ciH/_numVer*i+_rangeVer]);
					}else{
						posArray.push([ciW/_numHor*j+_rangeHor,ciH/_numVer*i+_rangeVer]);
					}
				}
			}
		}
	}
	initPosArray();

	var nPosArray = getRandom({"arry":posArray,"range":cardNum}),	//位置随机
		arrayIndex = 0;

	//布局卡片
	$(".cardBox .cardItem").each(function(){	//高度必须有，否则手机端有bug
		if(!$(this).find(".correctSide").hasClass('out')){
			setCardFlip($(this));
		}
		$(this).width(tarWidth).height(tarHeight).show().animate({"left":nPosArray[arrayIndex][0],"top":nPosArray[arrayIndex][1]},500);
		$(this).find(".cardBack").removeClass("cardBackEven");
		if((nPosArray[arrayIndex][0]-_rangeHor)/(ciW/_numHor)%2){		//偶数位置添加特殊卡片背景
			$(this).find(".cardBack").addClass("cardBackEven");
		}
		arrayIndex++;
	})
}

//重新开始
$(".restart").on("click",function(){
	cardInit();
	$(".grayBg").hide();
	$(this).parents(".pushOut").hide();
})

//开始
$(".cardStartBtn").on("click",function(){
	countdown.start();
	$(this).parents(".pushOut").hide();
	$(".cardBox").fadeIn();

})

//失败
//$(".ctdOverBtn").on("click",function(){
//	$(".failBox,.grayBg").show();
//	playSound("fail");
//})

//弹出提示
$(".tipsBtn").on("click",function(){
	$(this).parents(".pushOut").hide();
	$("#tipsBox").show();
})

//弹出提示 正确
$(".winTips").on("click",function(){
	$(this).parents(".pushOut").hide();
	$("#winTipsBox").show();
})

var cardScore = (function(){

	//var cardNum =  $(".cardBox .cardItem").length,
	//	mateNum = Math.floor(cardNum/2);
	//var mateNum = mate;
	//返回成绩
	var rtn=[1,0];

	//双击锁
	var doubleClickLock = true;
		//mateNum[1] = null;		//储存上一张卡牌
	$(".cardItem").on("click", function() {
		if(doubleClickLock){//禁双击
			doubleClickLock = false;
			setTimeout(function(){doubleClickLock = true},300);
			setCardFlip($(this));

			if( mateNum[1] ){
				if(mateNum[1].is($(this))){
					mateNum[1] = null;
				}else{
					jugementCard($(this));
				}
			}else{
				mateNum[1] = $(this);
			}
		}
	});

	function setPoCenter($po){
		var poW = $po.width(),
			poH = $po.height();

		$po.css({"margin-left":-poW/2,"margin-top":-poH/2});

	}

	function jugementCard($thisCard){
		var lastMateId = mateNum[1].data("mateId"),
			thisMateId = $thisCard.data("mateId");

		setTimeout(function(){
			if(lastMateId == thisMateId){	//匹配成功
				$thisCard.hide();
				mateNum[1].hide();
				mateNum[0]--;					//剩余匹配卡牌组数
				playSound("success");
			}else{
				setCardFlip($thisCard);
				setCardFlip(mateNum[1]);
				playSound("warn");
			}
			mateNum[1] = null;

			if(mateNum[0] == 0){
				$("#win,.grayBg").show();
				playSound("done");
				countdown.pause();
				rtn[1] = 1;
			}
		},450);
	}

	return rtn;

})();

//翻牌效果
function setCardFlip($this){
	var $to = $this.find(".out");
		$to.siblings().addClass("out").removeClass("in");
	setTimeout(function() {
		$to.addClass("in").removeClass("out");
	}, 225);
}

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