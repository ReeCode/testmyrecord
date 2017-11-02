
//判断浏览器
var browser = userBrowser();
function userBrowser(){
    var browserName=navigator.userAgent.toLowerCase();
    if(/msie/i.test(browserName) && !/opera/.test(browserName)){
        return "IE";
    }else if(/firefox/i.test(browserName)){
        return "Firefox";
    }else if(/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName)){
        return "Chrome";
    }else if(/opera/i.test(browserName)){
        return "Opera";
    }else if(/webkit/i.test(browserName) &&!(/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName))){
        return "Safari";
    }else{ return "unKnow"; }
}


//从一个数组中随机抽取n个元素组成新数组
function getRandom(opt) {
	var old_arry = opt.arry,
	    range = opt.range;
	//防止超过数组的长度
	range = range > old_arry.length?old_arry.length:range;
	var newArray = [].concat(old_arry), //拷贝原数组进行操作就不会破坏原数组
	    valArray = [];
	for (var n = 0; n < range; n++) {
	    var r = Math.floor(Math.random() * (newArray.length));
	    valArray.push(newArray[r]);
	    //在原数组删掉，然后在下轮循环中就可以避免重复获取
	    newArray.splice(r, 1);
	}
	return valArray;
}

//比较大小
function compare(value1,value2){
	if(value1 < value2){
		return -1;
	} else if(value1 > value2){
		return 1;
	} else{
		return 0;
	}
}

//判断是否处于全屏状态
function f_IsFullScreen() { 
	return (document.body.scrollHeight == window.screen.height && document.body.scrollWidth == window.screen.width); 
}