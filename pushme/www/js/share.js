/**
 * @fileOverview 他のアプリケーションとの連携に必要な処理を実施します。
 */

/**
 * 他のアプリにインテントを渡しデータを共有する。
 * 共有のためのデータの整形も行う。
 * @param {String} txt 共有したいテキストデータ
 */
function shareText(txt){
    Bridge.shareText(formatForSend(txt));// native定義の機能を呼び出す
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