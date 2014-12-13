/**
 * @fileOverview TBA
 */

 var storedData;

/**
 * DOMロード完了時に呼び出される。
 * レコードの一括取得、カテゴリの抽出を行う。
 */


// データベースのオープンに成功したら

function hoge(){openDB().then(function(){
	// DBからすべてのレコードを取得
	getAllItemsfromDB().then(function(items){
//	storedData = items;
    storedData = (new Function("return " + JSON.stringify(items)))();
    console.debug(storedData);
	// 取得したレコードからカテゴリ一覧を作成し、プルダウンに追加
    return storedData;
	}, function(err){
        console.debug(err);
	});
}, function(err){
    console.error(err);
});}