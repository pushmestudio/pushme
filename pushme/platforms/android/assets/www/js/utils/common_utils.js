/**
 * @fileOverview 共通機能として使う関数を集めたファイルです
 * @copyright PushMe Studio 2015
 */

 
/**
 * 実際に広告を配信する際は、このjsを読み込むと共に下記コードをhtml上に追加すること
 * テスト環境用
 * <div id="ads"><script type="text/javascript">var nend_params = {"media":82,"site":58536,"spot":127513,"type":1,"oriented":1};</script></div>
 * 本番用
 * <div id="ads"><script type="text/javascript">var nend_params = {"media":22843,"site":116935,"spot":305355,"type":1,"oriented":3};</script></div>
 * 
 * #ads {
 * 	position: fixed;
 * 	bottom: 0px;
 * 	width: 100%;
 * 	margin: 0 auto;
 * }
 * 上記をcssに足すことで広告表示を、ページ下部中央固定にできる
 */
new function() {
  var adsHtml;
  adsHtml = '<div>';
  adsHtml += '<script type="text/javascript" src="http://js1.nend.net/js/nendAdLoader.js"></script>';
  adsHtml += '</div>';
  $('#ads').append(adsHtml);
}

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
    $('#shareFail').stop(true, true).fadeIn(250).delay(1500).fadeOut(250);
    console.warn("Nothing to do in shareText()");
  }
}

/**
 * データを送信用に整形する。
 * @param {String} txt 共有したいテキストデータ
 * @return {String} formattedTxt 整形済テキストデータ
 */
function formatForSend(txt){
  var formattedTxt = "";
  formattedTxt = "[" + txt + "] is chosen from the list! Have a nice day~:D #PushMe";
  return formattedTxt;
}

/**
 * 呼び出された時点の時刻を取得する。
　* @return {String} yyyymmddhhnnssの形式で表現される時刻
 */
function getTimeStamp(){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours();
    var min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
    var sec = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();
    var timeStamp = "" + year + month + day + hour + min +sec;
    return timeStamp;
}

/**
 * 受け取ったデータ及びクエリに基づき、クエリの内容に合致したデータを抽出する。
 * クエリが空だった場合には受け取ったデータをそのまま返す。
 * @param {String|Array} originalData 抽出対象となる元データ
 * @param {String} [query] 抽出条件となるカテゴリを示すクエリ
 * @return {String|Array} クエリの条件に合致したデータ
 */
function extractByCate(originalData, query){
  var categorisedData = new Array();
  if(typeof query === "undefined" || query.length <= 0){
    categorisedData = originalData;
  } else {
    for(var i = 0, n = originalData.length; i < n; i++){
      if(query === originalData[i].category){
        categorisedData.push(originalData[i]);
      }
    }
  }
  return categorisedData;
};

/**
 * 受け取ったデータから重複のないカテゴリ一覧抽出する。
 * 抽出したカテゴリ一覧はhtmlのselectのoptionとして書き出す。
 * @param {String|Array} originalData カテゴリ抽出対象となる元データ
 * @return {String} 抽出したカテゴリから構成される<option>タグ
 */
function makeCateOptionsHtml(originalData){
  var cateArray = new Array();
  var cateOption = '<option value="">ALL</option>';
    for(var i = 0, n = originalData.length; i < n; i++){
      var cate = originalData[i].category;
      if(cateArray.indexOf(cate) != -1){
        continue;//既にカテゴリ内にあるので追加しない
      } else {
        cateArray.push(cate); // カテゴリ一覧にカテゴリを追加
        cateOption += '<option value="' + cate + '" name="' + cate + '">' + cate + '</option>';
      }
    }
  return cateOption;
}