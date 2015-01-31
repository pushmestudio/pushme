/**
 * @fileOverview 共通機能として使う関数を集めたファイルです
 */

/**
 * 他のアプリにインテントを渡しデータを共有する。
 * 共有のためのデータの整形も行う。
 * BridgeはAndroid(Java)で定義している
 * @param {String} txt 共有したいテキストデータ
 */
function shareText(txt){
  var ua = navigator.userAgent;
  if (ua.search(/Android/) != -1) {
    Bridge.shareText(formatForSend(txt));// Android native定義の機能を呼び出す
  } else {
    alert("申し訳ございませんが、非対応端末です");
    console.debug("Nothing to do in shareText()");
  }
}

/**
 * データを送信用に整形する。
 * @param {String} txt 共有したいテキストデータ
 * @return {String} formattedTxt 整形済テキストデータ
 */
function formatForSend(txt){
  var formattedTxt = "";
  formattedTxt = "今回決まったのは [" + txt + "] です！";
  return formattedTxt;
}


/**
 * クッキーをセットする
 * @param {String} cname セットしたいCookieのkey
 * @param {String} cvalue セットしたいCookieのvalue
 * @param {Integer} exdays Cookieの有効日数
 */
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000)); //日数*24時間*60分*60秒*1000ミリ秒
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
  
  console.debug(name + "=" + cvalue + "; " + expires);
}

/**
 * クッキーから値をゲットする
 * @param {String} cname Cookieからゲットしたいvalueのkey
 * @return {String} cnameとマッチしたCookieのvalue
 */
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';'); // Cookie分解
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1); // 先頭文字だけ除く
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length); // nameにいれたものとマッチすれば返す
  }
  return ""; // for文内で全てマッチしなかったら空値を返す
}
