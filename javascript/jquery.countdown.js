/**
*   countdown.js
*   updata time 2016.2.23
*
*
*   配置参数
*      | date      倒计时时间  单位:秒 无默认值
*      | digit     显示位数    默认为3
*      | run       是否默认初始化完成就开始计时  默认为false
*      | delay     延迟倒计时  单位：秒 默认0
*   返回值
*      | start     方法 计时开始
*      | pause     方法 暂停及时
*      | reset     方法 重置倒计时
*
*    
 */

(function ($) {

    $.fn.downCount = function (options, callback) {
        var settings = $.extend({
                date: null,
                digit: 3,
                run: false,
                delay: 0
            }, options);

        // Save container
        var container = this;

        // Throw error if date is not set
        if (!settings.date) {
            $.error('Date is not defined.');
        }else{
            var _currentTime = settings.date;
        }

        //为局域化参数
        var _digit = settings.digit,
            _run = settings.run,
            _delay = settings.delay;

        //console.log(_run);

        //计时器
        var _timer=null,
            flagTimer = 0;


        //更新时间
        var updataTime =function(){
            var hour=-1,min=-1,sec=-1;
            switch(_digit){                   //匹配位数
                case 1:
                    sec = _currentTime;
                    sec = cutNum(sec);
                    container.html(sec);
                    break;
                case 2:
                    min = Math.floor(_currentTime/60);
                    sec = _currentTime%60;
                    min = cutNum(min);
                    sec = cutNum(sec);
                    container.html(min+" : "+sec);
                    break;
                case 3:
                    hour = Math.floor(_currentTime/3600);
                    min = Math.floor(_currentTime/60)-hour*60;
                    sec = _currentTime%60;
                    hour = cutNum(hour);
                    min = cutNum(min);
                    sec = cutNum(sec);
                    container.html(hour+"："+min+"："+sec);
                    break;
                default:
                    $.error('Error digit number: ' + _digit);
            }
        }

        updataTime();

        //分割字符，如果中包含数字1 则包含在<span>标签对中
        function cutNum(str){
            var strCut="";
            str = str<10?"0"+str:str+"";
            for( var i =0; i< str.length; i++){
                strCut = strCut+ "<span>"+str.charAt(i)+"</span>";
            }
            return strCut;
        }

        //更新当前时间
        function mainFun(){
            if( --_currentTime == 0){ clearInterval(_timer); flagTimer=0;  if (callback && typeof callback === 'function') callback(); }
            updataTime();
        }

        //计时开始&&继续计时
        function fooCd(){
            if(_currentTime != 0 && flagTimer == 0){
                flagTimer = -1;
                setTimeout(function(){ _timer = setInterval(function(){ mainFun();},1000); },_delay*1000);
            }
        }

        //如果 初始化信息为自动计时 则自动计时
        if(_run){
            fooCd();
        }

        //计时暂停
        function pauseCd(){
            clearInterval(_timer);
            flagTimer=0;
        }

        //重新计时
        function resetCd(){
            clearInterval(_timer);
            flagTimer=0;
            _currentTime = settings.date;
            updataTime();
            if(_run){
                fooCd();
            }
        }

        return{
            start: fooCd,
            pause: pauseCd,
            reset: resetCd
        }
    };

})(jQuery);