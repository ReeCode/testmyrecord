var creatAna =function ($actScn){

	var lv1StrArr = new Array(),
		lv2StrArr = new Array();

	var colorArr = ["#e5354c","#f7a928","#7bded6","#c14341","#008cb5","#3e465e","#ec3b2e","#fff"];

	//初始化 canvas
	var $container = $actScn.find(".anaAni");
	var _width = $container.width(),
		_height =  $container.height();

	//定义边距
	var MARGIN = 30,
		textMaxWidth = 140,
		textMaxHeight= 70;
		// lineHeight = [32,27,20];			//行高

	//定义各级节点的半径
	var RaLv1 = 120,
		RaLv2 = 30,
		RaLv3 = 10;

	// 定义pie 和 线条宽度
	var pie2 = Math.PI * 2,
		lineHeight = 6;

	//各级点的位置
	var lv1Pos = [],	//[x,y]
		lv2Pos = [],	//[[],[]]  [x,y,d,p]	x横坐标；y纵坐标；d 三级点在 二级点的方向：1为正方向，-1为负方向；p 二级点在一级点的横纵方向0为横向，1为纵向
		lv3Pos = [];	//[[[],[]],[]]  三维数组

	var wLv2T3 = (_width-(MARGIN + textMaxWidth)*2)/6,		//第二级与第三级之间的横向距离，以此为基准，第一级与第二级之间的距离为其二倍
		hLv1T2 = 0,											//第一级与第二级之间的高度差
		lv3Cut = 20;										//第三级每项之间的距离

	//初始化 分支数组内容
	$actScn.find(".treeUl li").each(function(){
		var $this = $(this),
			_thisClass = $this.attr("class");

		var _branch = -1;

		switch(_thisClass){
			case "treeLv1":
				lv1StrArr.push($this.html());
				break;
			case "treeLv2":
				_branch = $this.data("branch");
				lv2StrArr[_branch] = new Array();
				lv2StrArr[_branch][0] = $this.html();
				break;
			case "treeLv3":
				_branch = $this.data("branch");
				if( !lv2StrArr[_branch][1] instanceof Array || !Array.isArray(lv2StrArr[_branch][1]) ){
					lv2StrArr[_branch][1] = new Array();
				}
				lv2StrArr[_branch][1].push($this.html());
				break;
			default:
				console.log("undefined class type :" + _thisClass);
		}
	})
	//console.log("lv1StrArr: "+lv1StrArr);
	//console.log("lv2StrArr: "+lv2StrArr);

	console.log(lv2StrArr);

	//初始化 数组位置
	//lv1Pos = [_width/2,MARGIN+RaLv1];
	switch(lv2StrArr.length){
		case 2:
			lv1Pos = [_width/2,_height/2];
			lv2Pos = [ [lv1Pos[0]-wLv2T3*2,_height/2,-1,0],[lv1Pos[0]+wLv2T3*2,_height/2,1,0] ];
			for(var i = 0 ; i < 2; i++){
				var dct = lv2Pos[i][2];
				lv3PosInit(i,dct);
			}
			break;
		case 3:
			lv1Pos = [_width/2,MARGIN+RaLv1];
			hLv1T2 = _height/2 - lv1Pos[1];		//[x,y,d,p]	x横坐标；y纵坐标；d 三级 在 二级点的方向：1为正方向，-1为负方向；p 二级点在一级点的横纵方向0为横向，1为纵向
			lv2Pos = [ [lv1Pos[0]-wLv2T3*2,_height/2,-1,0],[lv1Pos[0]-hLv1T2 ,lv1Pos[1] + RaLv1 + wLv2T3*1.2,1,1],[lv1Pos[0]+wLv2T3*2,_height/2,1,0] ];
			for(var i = 0 ; i < 3; i++){
				var dct = lv2Pos[i][2];
				lv3PosInit(i,dct);
			}
			break;
		case 4:
			lv1Pos = [_width/2,MARGIN+RaLv1];
			hLv1T2 = _height/2 - lv1Pos[1];	
			lv2Pos = [ [lv1Pos[0]-wLv2T3*2,lv1Pos[1],-1,0],[lv1Pos[0]-hLv1T2 ,lv1Pos[1] + RaLv1 + wLv2T3*1.2,-1,1],[lv1Pos[0]+hLv1T2 ,lv1Pos[1] + RaLv1 + wLv2T3*1.2,1,1],[lv1Pos[0]+wLv2T3*2,lv1Pos[1],1,0] ];
			for(var i = 0 ; i < 4; i++){
				var dct = lv2Pos[i][2];
				lv3PosInit(i,dct);
			}
			break;
		case 5:
			lv1Pos = [_width/2,MARGIN+RaLv1];
			break;
		case 6:
			lv1Pos = [_width/2,_height/2];
			break;
		default:
			console.log("undefined node2 amount: "+lv2StrArr.length);
	}

	//初始化点的位置
	function lv3PosInit (lv2Num,direction) {
		if(lv2StrArr[lv2Num].length == 1){
			lv3Pos[lv2Num] = 0
		}else{
			var myBrotherNum = lv2StrArr[lv2Num][1].length;

			lv3Pos[lv2Num] = new Array();
			for(var i=0 ; i< myBrotherNum ; i++ ){
				var x = lv2Pos[lv2Num][0] + direction*wLv2T3,
					y = 0;
				if(myBrotherNum%2){	//偶数个
					y = lv2Pos[lv2Num][1] + (i+1 - (myBrotherNum +1)/2)*textMaxHeight;
				}else{				//奇数个
					y = lv2Pos[lv2Num][1] + (i - (myBrotherNum - 1)/2)*textMaxHeight;
				}
				lv3Pos[lv2Num].push([x,y]);
			}
		}
	}

	//画点
	//需要信息
	//	|| arr 		圆心坐标，[x,y]
	//	|| radius 	半径 	
	//	|| c 		颜色 对应的colorArr 的序号
	// 返回值
	// 	|| 完成初始化信息的字符串 rtn
	// 对应css 类名
	// 	|| circle	圆&为animating标注改层执行动画为 circle 方式
	function drawCircle(arr,radius,c){
		var rtn = "<div class='circle animated' style='left:"+(arr[0]-radius)+"px; top:"+(arr[1]-radius)+"px; width:"+ radius*2 +"px; height:"+ radius*2 +"px; background-color:"+colorArr[c]+"' ></div>";

		return rtn;
	}

	function drawCircleLv1(arr,str,radius,c){
		var rtn = "<div class='circle animated' style='left:"+(arr[0]-radius)+"px; top:"+(arr[1]-radius)+"px; width:"+ radius*2 +"px; height:"+ radius*2 +"px; background-color:"+colorArr[c]+"' >";
			rtn = rtn + "<div class='circle lv1CStyle'><span>"+ str +"</span>";
			rtn = rtn + "<img src='images/ana/circle.png' class='lv1Img1' />";
			rtn = rtn + "<img src='images/ana/circle.png' class='lv1Img2' />";
			rtn = rtn + "</div></div>";
		return rtn;
	}

	function drawCircleLv2(arr,str,radius,c){
		var rtn = "<div class='circle animated lv2CStyle' style='left:"+(arr[0]-radius)+"px; top:"+(arr[1]-radius)+"px; width:"+ radius*2 +"px; height:"+ radius*2 +"px; background-color:"+colorArr[c]+"' ><span>"+str+"</span></div>";

		return rtn;
	}

	//绘制三角形
	//需要信息
	//	|| arr 		中心坐标，[x,y]
	//	|| radius 	半径 	
	//	|| c 		颜色 对应的colorArr 的序号
	// 返回值
	// 	|| 完成初始化信息的字符串 rtn
	// 对应css 类名
	// 	|| sharp	为animating标注改层执行动画为 sharp 方式
	// 	|| sharpTop	向上的三角形
	// 	|| sharpDown	向下的三角形
	// 	|| sharpLeft	向左的三角形
	// 	|| sharpRight	向右的三角形
	function drawSharp(arr,pos,c){
		var rtn = "";

		switch(pos){
			case "top":
				rtn = "<div class='sharp animated sharpTop'  style='left:"+(arr[0] - RaLv3)+"px; top:"+(arr[1] - RaLv3)+"px; border-top-color:"+colorArr[c]+";'></div>";
				break;
			case "bottom":
				rtn = "<div class='sharp animated sharpDown' style='left:"+(arr[0] - RaLv3)+"px; top:"+(arr[1] - RaLv3)+"px; border-bottom-color:"+colorArr[c]+";'></div>";
				break;
			case "left":
				rtn = "<div class='sharp animated sharpLeft' style='left:"+(arr[0] - RaLv3)+"px; top:"+(arr[1] - RaLv3)+"px; border-right-color:"+colorArr[c]+";'></div>";
				break;
			case "right":
				rtn = "<div class='sharp animated sharpRight' style='left:"+(arr[0] - RaLv3)+"px; top:"+(arr[1] - RaLv3)+"px; border-left-color:"+colorArr[c]+";'></div>";
				break;
			default:
				console.log("error pos type: "+pos);
		}
		return rtn;
	}


	// var temp = drawSharp([400,200],"top",1);
	// 	temp = temp + drawSharp([400,200],"bottom",2);
	// 	temp = temp + drawSharp([400,200],"left",3);
	// 	temp = temp + drawSharp([400,200],"right",4);
	// $container.append(temp);


	//书写文字
	//需要信息
	//	|| arr 		文字开始时的坐标，[x,y]
	// 	|| str 		文字
	// 	|| lv 		层级
	//	|| align 	对齐方式 	
	//	|| c 		颜色 对应的colorArr 的序号
	// 返回值
	// 	|| 完成初始化信息的字符串 rtn
	// 对应css 类名
	// 	|| word		为animating标注改层执行动画为 word 方式
	// 	|| wordLv1	一级标题样式
	// 	|| wordLv2	二级标题样式
	// 	|| wordLv3	三级标题样式
	// 	|| wordLv2O	二级序号样式
	function drawWord(arr,str,lv,align,c){
		var rtn = "";
		switch(lv){
			case 1:
				rtn="<div class='word animated wordLv1' style='left:"+arr[0]+"px;top:"+arr[1]+"px; text-align:"+align+"; color:"+colorArr[c]+";'>"+str+"</div>";
				break;
			case 2:
				rtn="<div class='word animated wordLv2' style='left:"+arr[0]+"px;top:"+arr[1]+"px;width:120px;text-align:"+align+"; color:"+colorArr[c]+";'>"+str+"</div>";
				break;
			case 3:
				rtn="<div class='word animated wordLv3' style='left:"+arr[0]+"px;top:"+arr[1]+"px;text-align:"+align+"; color:"+colorArr[c]+";'>"+str+"</div>";
				break;
			case 0:
				rtn="<div class='word animated wordLv2O' style='left:"+arr[0]+"px;top:"+arr[1]+"px; text-align:"+align+"; color:"+colorArr[c]+";'>"+str+"</div>";
				break;
			default:
				console.log("Error lv type: "+lv);
		}
		return rtn;
	}

	// var temp = drawWord([400,200],"testWord",1,"center",1);
		// temp = temp + drawWord([400,300],"testWord",2,"left",2);
	// 	temp = temp + drawSharp([400,200],"left",3);
	// 	temp = temp + drawSharp([400,200],"right",4);
	// $container.append(temp);

	//绘制两点之间的线
	//需要信息
	//	|| arrStart 	开始点坐标，[x,y]
	//	|| arrTarget 	结束点坐标，[x,y] 	
	//	|| c 		颜色 对应的colorArr 的序号
	//	|| lock		锁定方向	0 限制为 只在X轴方向；1限制为只在Y轴方向
	// 返回值
	// 	|| 完成初始化信息的字符串 rtn
	// 	   两点之间的折线路径
	// 对应css 类名
	// 	|| lineVer	纵向线段
	// 	|| lineHor	横向线段
	//  || line 	为animating标注改层执行动画为 line方式
	function drawLine(arrStart,arrTarget,c,lock){
		var _rangeX = arrTarget[0] - arrStart[0],
			_rangeY = arrTarget[1] - arrStart[1],
			_maxDistanc = Math.abs(_rangeX) + Math.abs(_rangeY);

		var turnPoint1 = [],
			turnPoint2 = [],
			dirn = [-1,0,0];			//记录方向 [横纵方向，x方向增加还是减少，y方向增加还是减少]		其中横纵方向中0表示横向，1表示纵向，增加还是减少 1表示增加，-1表示减少,0表示无变化

		var _dir = lock;

		if(_dir == undefined){
			_dir=Math.abs(_rangeX) >= Math.abs(_rangeY)?0:1;
		}

		if(_dir == 0 ){
			//如果X方向比较宽

			turnPoint1 = [ arrStart[0] + _rangeX/2,arrStart[1]];
			turnPoint2 = [ arrStart[0] + _rangeX/2,arrTarget[1]];

			dirn = [0,_rangeX/Math.abs(_rangeX),_rangeY/Math.abs(_rangeY)];
			if(_rangeX == 0){ dirn[1] = 0; }
			if(_rangeY == 0){ dirn[2] = 0; }

		}else if(_dir == 1){
			//如果Y方向比较宽

			turnPoint1 = [ arrStart[0],arrStart[1] + _rangeY/2 ];
			turnPoint2 = [ arrTarget[0],arrStart[1] + _rangeY/2 ];

			dirn = [1,_rangeX/Math.abs(_rangeX),_rangeY/Math.abs(_rangeY)];
			if(_rangeX == 0){ dirn[1] = 0; }
			if(_rangeY == 0){ dirn[2] = 0; }
		}

		// console.log(turnPoint1);
		// console.log(turnPoint2);

		var rtn = "";
		if(dirn[0] == 0 ){	//横向

			if(dirn[1] > 0 ){	//第一个转折点之间的线段 方向右
				rtn = "<div class='lineHor line' style='left:" + arrStart[0] + "px; top:" + (arrStart[1]-lineHeight/2) + "px; background-color:" + colorArr[c] + ";' data-aninfo='w-"+ (Math.abs(turnPoint1[0]-arrStart[0])+lineHeight) +"' ></div>";
			}
			else{				//第一个转折点之间的线段 方向左
				rtn = "<div class='lineHor line' style='right:" + (_width - arrStart[0]) + "px; top:" + (arrStart[1]-lineHeight/2)  + "px; background-color:" + colorArr[c] + ";' data-aninfo='w-"+ Math.abs(turnPoint1[0]-arrStart[0]) +"' ></div>";
			}

			if(dirn[2] > 0){	//第二条线段 方向下
				rtn = rtn + "<div class='lineVer line' style='left:" + turnPoint1[0]  + "px; top:" + (turnPoint1[1]+lineHeight/2)  + "px; background-color:" + colorArr[c] + ";' data-aninfo='h-"+ Math.abs(turnPoint2[1]-turnPoint1[1]) +"' ></div>";
			}else if(dirn[2]!=0){	//第二条线段 方向上
				rtn = rtn + "<div class='lineVer line' style='left:" + turnPoint1[0]  + "px; bottom:" + (_height - turnPoint1[1]+lineHeight/2)  + "px; background-color:" + colorArr[c] + ";' data-aninfo='h-"+ Math.abs(turnPoint2[1]-turnPoint1[1]) +"' ></div>";
			}

			if(dirn[1] > 0 ){	//第三条线段 方向右
				rtn = rtn + "<div class='lineHor line' style='left:" + turnPoint2[0]  + "px; top:" + (turnPoint2[1]-lineHeight/2)  + "px; background-color:" + colorArr[c] + ";' data-aninfo='w-"+ Math.abs(turnPoint2[0]-arrTarget[0]) +"' ></div>";
			}
			else{				//第三条线段 方向左
				rtn = rtn + "<div class='lineHor line' style='right:" + (_width - turnPoint2[0]) + "px; top:" + (turnPoint2[1]-lineHeight/2) + "px; background-color:" + colorArr[c] + ";' data-aninfo='w-"+ Math.abs(turnPoint2[0]-arrTarget[0]) +"' ></div>";
			}

		}else{				//纵向
			if(dirn[2] > 0 ){	//第一条线段 方向下
				rtn = "<div class='lineVer line' style='left:" + (arrStart[0]-lineHeight/2) + "px; top:" + arrStart[1]  + "px; background-color:" + colorArr[c] + ";' data-aninfo='h-"+ (Math.abs(turnPoint1[1]-arrStart[1])+lineHeight) +"' ></div>";
			}
			else{
				rtn = "<div class='lineVer line' style='left:" + (arrStart[0]-lineHeight/2) + "px; bottom:" + (_height - arrStart[1] ) + "px; background-color:" + colorArr[c] + ";' data-aninfo='h-"+ Math.abs(turnPoint1[1]-arrStart[1]) +"' ></div>";
			}

			if(dirn[1]>0){
				rtn = rtn + "<div class='lineHor line' style='left:" + (turnPoint1[0]-lineHeight/2) + "px; top:" + turnPoint1[1]  + "px; background-color:" + colorArr[c] + ";' data-aninfo='w-"+ Math.abs(turnPoint2[0]-turnPoint1[0]) +"' ></div>";
			}else if(dirn[1]!=0){
				rtn = rtn + "<div class='lineHor line' style='right:" + (_width - turnPoint1[0] + lineHeight/2) + "px; top:" + turnPoint1[1]  + "px; background-color:" + colorArr[c] + ";' data-aninfo='w-"+ Math.abs(turnPoint2[0]-turnPoint1[0]) +"' ></div>";
			}

			if(dirn[2] > 0 ){
				rtn = rtn + "<div class='lineVer line' style='left:" + (turnPoint2[0]-lineHeight/2) + "px; top:" + turnPoint2[1]  + "px; background-color:" + colorArr[c] + ";' data-aninfo='h-"+ Math.abs(turnPoint2[1]-arrTarget[1]) +"' ></div>";
			}
			else{
				rtn = rtn + "<div class='lineVer line' style='left:" + (turnPoint2[0]-lineHeight/2) + "px; bottom:" + (_height - turnPoint2[1] ) + "px; background-color:" + colorArr[c] + ";' data-aninfo='h-"+ Math.abs(turnPoint2[1]-arrTarget[1]) +"' ></div>";
			}
		}

		return rtn;

	}

	function creatAniDom(){
		var branchLv2 = lv2StrArr.length;		//二级节点个数
		var rtn = "";	//返回值

		//创建第一个节点	drawCircle(arr,radius,c)
		rtn = rtn + drawCircleLv1(lv1Pos,lv1StrArr[0],RaLv1,colorArr.length-2);
		rtn = rtn + "<div class='div animated arrow' style='left:"+(lv1Pos[0] + RaLv1/4)+"px; top:"+(lv1Pos[1] - RaLv1 - RaLv1/4)+"px;'><img src='images/ana/arrow.png' /></div>";


		//创建 分支节点
		for(var i=0; i < branchLv2; i++ ){
			rtn = rtn + creatBranch(i);
		}
		return rtn;
	}

	function creatBranch(b){
		var rtn = "";

		var directionHor = lv2Pos[b][2],		//水平方向
			directionVer = lv2Pos[b][3];

		//绘制一级点至二级点之间的线段	drawLine(arrStart,arrTarget,c)
		if(!directionVer){
			rtn = rtn + drawLine([lv1Pos[0]+directionHor*RaLv1,lv1Pos[1]],[lv2Pos[b][0]-directionHor*RaLv2,lv2Pos[b][1]],b);
		}else{
			rtn = rtn + drawLine([lv1Pos[0],lv1Pos[1] + directionVer*RaLv1],[lv2Pos[b][0],lv2Pos[b][1] - directionVer*RaLv2],b);
		}

		//绘制二级点及序号 	drawCircleLv2(arr,str,radius,c)
		var temp = "0"+(b+1);
		// console.log(lv2Pos[b]);
		rtn = rtn + drawCircleLv2(lv2Pos[b],temp,RaLv2,b);
		//绘制二级描述文字	drawWord(arr,str,lv,align,c)
		rtn = rtn + drawWord([lv2Pos[b][0],lv2Pos[b][1]+RaLv2*1.5+10],lv2StrArr[b][0],2,"center",b);
		//绘制三级节点
		if(lv2StrArr[b].length != 1 ){
			var lv3Branch = lv2StrArr[b][1].length;	//三级节点个数
			for(var i=0; i< lv3Branch; i++){
				rtn = rtn + creatBranchLv3(i);
			}
		}


		function creatBranchLv3(p){
			var rtnLv3 = "";

			//绘制二级点与三级点之间的折线
			rtnLv3 = rtnLv3 + drawLine([lv2Pos[b][0] + directionHor*RaLv2,lv2Pos[b][1]],[lv3Pos[b][p][0] - directionHor*RaLv3 ,lv3Pos[b][p][1]],b,0);

			//绘制三角形&绘制文字	drawSharp(arr,pos,c)
			if(directionHor > 0){	//正方向
				rtnLv3 = rtnLv3 + drawSharp(lv3Pos[b][p],"right",b);

				// 绘制三级文字
				var rdd;
				if(RaLv3 == 0){rdd = 10; }
				else{rdd = RaLv3; }
				rtnLv3 = rtnLv3 + drawWord([lv3Pos[b][p][0] + 2*rdd,lv3Pos[b][p][1]],lv2StrArr[b][1][p],3,"left",b);
			}else if(directionHor < 0){	//负方向
				rtnLv3 = rtnLv3 + drawSharp(lv3Pos[b][p],"left",b);

				// 绘制三级文字
				rtnLv3 = rtnLv3 + drawWord([lv3Pos[b][p][0] - textMaxWidth,lv3Pos[b][p][1]],lv2StrArr[b][1][p],3,"left",b);
			}
			return rtnLv3;
		}

		return rtn;

	}

	return creatAniDom();
	//var tt = creatAniDom();
	//$container.html(tt);
	//$container.find(">div:first").addClass('animating')
	//ani($container);

}
var timePoint = [];

var analysis = function($actScn){
	var tt = creatAna($actScn),
		$container = $actScn.find(".anaAni");
	$container.html(tt);
	$container.find(">div:first").addClass('animating');

	if(timePoint[0]==undefined && timePoint.length !=$container.find(">div").length){
		$.each($container.find(">div"),function(index){
			if(index == 0){
				timePoint[0] = 0;
				return true;
			}
			if($(this).prev().hasClass('line')){
				timePoint[index] = timePoint[index-1] + 150;
			}
			if($(this).prev().hasClass('circle')){
				timePoint[index] = timePoint[index-1] + 500;
			}
			if($(this).prev().hasClass('sharp')){
				timePoint[index] = timePoint[index-1] + 500;
			}
			if($(this).prev().hasClass('div')){
				timePoint[index] = timePoint[index-1] + 2500;
			}
			if($(this).prev().hasClass('word')){
				timePoint[index] = timePoint[index-1] + 2500;
			}
		});
	}

	ani($container);
}



var dragAns = function($actScn,st){
	// console.log($actScn);
	// console.log(stayTime);
	//重新装入Dom
	var tt = creatAna($actScn),
		$container = $actScn.find(".anaAni");
	$container.html(tt);

	//根据时间确定节点
	var itemIndex = findItem(timePoint,st);

	//节点之前的元素全部显示
	$.each($container.find(">div").eq(itemIndex).prevAll(),function(){
		var $this = $(this);
		if($this.hasClass('line')){ //线类型
			var aninfo = $this.data("aninfo");
			aninfo = aninfo.split("-");

			if(aninfo[0] == "w"){		//横线
				$this.css({"width":aninfo[1]+"px"});
			}else if(aninfo[0] == "h"){	//竖线
				$this.css({"height":aninfo[1]+"px"});
			}
		}else if($this.hasClass('circle')){	//圆类型
			$this.addClass("bounceIn");
		}else if($this.hasClass('sharp')){	//尖角类型
			$this.addClass("fadeIn");
		}else if($this.hasClass('div')){		//自定义图像类型
			$this.addClass("fadeIn");
		}else if($this.hasClass('word')){		//文字类型
			$this.addClass("fadeIn");
		}
	})

	//节点之后的元素 执行动画
	$container.find(">div").eq(itemIndex).addClass('animating');
	anaFlag=0;
	ani($container);


	//查找元素
	function findItem(arr,item){
		for(var i = 0; i< arr.length; i++){
			if(i+1 == arr.length){
				return i;
			}
			if(arr[i]<item&&arr[i+1]>item){
				return i;
			}
		}
	}
}

var timerAna=null;
var ani = function($container){

	// console.log(111);

	if(anaFlag == 1 ){	//暂停
		// console.log(333);
		clearTimeout(timerAna);
		timerAna=null;
		return false;
	}

	// console.log(222);

	var $animate = $container.find(".animating");
	// console.log($animate);
	// console.log( $animate );
	if($animate.hasClass('line')){ //线类型
		var aninfo = $animate.data("aninfo");
		aninfo = aninfo.split("-");

		if(aninfo[0] == "w"){		//横线
			$animate.animate({"width":aninfo[1]+"px"},150,"linear",function(){
				nextAni($animate);
			});
		}else if(aninfo[0] == "h"){	//竖线
			$animate.animate({"height":aninfo[1]+"px"},150,"linear",function(){
				nextAni($animate);
			});
		}

	}else if($animate.hasClass('circle')){	//圆类型
		$animate.addClass("bounceIn");
		timerAna = setTimeout(function(){
			nextAni($animate);
		},500);
		// console.log($animate.is(":animated"));

	}else if($animate.hasClass('sharp')){	//尖角类型
		$animate.addClass("fadeIn");
		timerAna = setTimeout(function(){
			nextAni($animate);
		},500);
		
	}else if($animate.hasClass('div')){		//自定义图像类型
		// $animate.addClass(function(){
			// naDelay($animate,1000);
			// return "fadeIn";
		// });
		$animate.addClass("fadeIn");
		timerAna = setTimeout(function(){
			nextAni($animate);
		},2500)
	}else if($animate.hasClass('word')){		//文字类型
		$animate.addClass("fadeIn");
		timerAna = setTimeout(function(){
			nextAni($animate,1500);				//每段文字后延迟1.5秒执行下一个动画
		},1000);
	}

	function nextAni($this,delayT){
		// console.log(anaFlag);
		if(anaFlag == 1 ){	//暂停
			clearTimeout(timerAna);
			timerAna = null;
			return false;
		}
		if($this.next().length!=0){
			$this.removeClass("animating").next().addClass("animating");
			if(delayT!=undefined){	//如果设置延迟
				timerAna = setTimeout(function(){
					ani($container);
				},delayT);
			}else{
				ani($container);
			}
		}else{
			$this.removeClass("animating");
		}
	}
}
