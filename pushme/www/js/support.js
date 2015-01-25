/**
 * @fileOverview フィードバックとか、アプリenableにするとかのやつです
 *
 * Some of rights are under the MIT license by Kazuma Nishihata [to-R] 2007
 * http://blog.webcreativepark.net
 */

new function(){
  var adsHtml;
  adsHtml = '<div>';
  adsHtml += '<script type="text/javascript" src="http://js1.nend.net/js/nendAdLoader.js"></script>';
  adsHtml += '</div>';
  $('#ads').append(adsHtml);
    
    // From here is under the MIT license by Kazuma Nishihata.
    var footerId = "ads";
    //メイン
    function footerFixed(){
        //ドキュメントの高さ
        var dh = document.getElementsByTagName("body")[0].clientHeight;
        //フッターのtopからの位置
        document.getElementById(footerId).style.top = "0px";
        var ft = document.getElementById(footerId).offsetTop;
        //フッターの高さ
        var fh = document.getElementById(footerId).offsetHeight;
        //ウィンドウの高さ
        if (window.innerHeight){
            var wh = window.innerHeight;
        }else if(document.documentElement && document.documentElement.clientHeight != 0){
            var wh = document.documentElement.clientHeight;
        }
        if(ft+fh<wh){
            document.getElementById(footerId).style.position = "relative";
            document.getElementById(footerId).style.top = (wh-fh-ft-1)+"px";
        }
    }
    
    //イベントリスナー
    function addEvent(elm,listener,fn){
        try{
            elm.addEventListener(listener,fn,false);
        }catch(e){
            elm.attachEvent("on"+listener,fn);
        }
    }

    addEvent(window,"load",footerFixed);
    addEvent(window,"resize",footerFixed);
    
}