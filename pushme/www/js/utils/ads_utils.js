/**
 * @fileOverview 広告関連の機能
 * 実際に広告を配信する際は、このjsを読み込むと共に下記コードをhtml上に追加すること
 * 尚、リリース対象ではないものに対して本番用の広告を組み込まないこと(誤クリックが続くと広告配信停止の可能性がある)
 * 又、万が一各js内で画面上の表示サイズを変更するような(例：display=none)スクリプトを書く場合はそのスクリプトの最後でfooterFixedを呼ぶこと
 * 
 * テスト環境用
 * <div id="ads"><script type="text/javascript">var nend_params = {"media":82,"site":58536,"spot":127513,"type":1,"oriented":1};</script></div>
 * 本番用
 * <div id="ads"><script type="text/javascript">var nend_params = {"media":22843,"site":116935,"spot":305355,"type":1,"oriented":3};</script></div>
 * @copyright PushMe Studio 2015
 */
// id="ads"をフッターとして指定
var footerId = "ads";
new function() {
  var adsHtml;
  adsHtml = '<div>';
  adsHtml += '<script type="text/javascript" src="http://js1.nend.net/js/nendAdLoader.js"></script>';
  adsHtml += '</div>';
  $('#ads').append(adsHtml);
    
    // From here is under the MIT license by Kazuma Nishihata.
    addEvent(window,"load",footerFixed);
}

function footerFixed() {
    // ドキュメントの高さ取得
    var dh = document.getElementsByTagName("body")[0].clientHeight;
    // フッターのトップからの位置を指定
    document.getElementById(footerId).style.top = "0px";
    var ft = document.getElementById(footerId).offsetTop;
    // フッターの高さ取得
    var fh = document.getElementById(footerId).offsetHeight;
    // ウインドウの高さ取得
    if (window.innerHeight) {
        var wh = window.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight != 0) {
        var wh = document.documentElement.clientHeight;
    }
    
    if(ft + fh < wh) {
        document.getElementById(footerId).style.position = "relative";
        document.getElementById(footerId).style.top = (wh - (fh + ft + 1)) + "px";
    }
}

// イベントリスナ登録
function addEvent(elm , listener , fn){
    try {
        elm.addEventListener(listener, fn, false);
    } catch(e) {
        elm.attachEvent("on" + listener, fn);
    }
}


/* 下記は広告表示On/Off切り替え用の記述です。
function changeAdsState(){
  var adsState = getAdsState();
  if(!adsState){
    adsState = 'off';
    console.debug("adsState not contain" + adsState);
  } else if (adsState == 'off'){
    adsState = 'on';
    console.debug("ads state changed off to on" + adsState);
  } else {
    adsState = 'off';
    console.debug("ads state changed on to off" +adsState);
  }
  
  setCookie('adsState', adsState, 500);
  showAds();
}

function getAdsState(){
  var adsState = getCookie('adsState');
  console.log("adsState is: " + adsState);
  return adsState;
}

function showAds(){
  var adsState = getAdsState();
  console.debug("showAds basedOn adsState" + adsState);
  var el = document.getElementById('ads'); // 広告表示枠のdiv
  if(adsState == 'on'){
    el.style.display = 'inline';
    alert('Thank you for your support!');
  } else {
    el.style.display = 'none';
    alert('Ads allow us to develop and deliver more functions. If you change your mind, please enable it.');
  }
}
*/