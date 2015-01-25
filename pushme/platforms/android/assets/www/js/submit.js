/**
 * @fileOverview データを取得して必要な件数を抽出し、HTML出力します。
 */
 // データの取得を一度に抑えるために、DB内の全データを格納する
var storedData;

// 登録する情報
var cate;
var name;
var desc;

/**
 * DOMロード完了時に呼び出される。
 * レコードの一括取得、カテゴリの抽出を行う。
 */
$(function(){
	// データベースのオープンに成功したら
	openDB().then(function(){
		// DBからすべてのレコードを取得
		getAllItemsfromDB().then(function(items){
			storedData = items;
			// 取得したレコードからカテゴリ一覧を作成し、プルダウンに追加
			var categoryOptionsHtml = makeCateOptionsHtmlExceptAll(storedData);
			$('#queryId').append(categoryOptionsHtml);
		}, function(err){
			alert(err);
		});
	}, function(err){
		alert(err);
	});
});

/**
 * 受け取ったデータから重複のないカテゴリ一覧抽出する。
 * 抽出したカテゴリ一覧はhtmlのselectのoptionとして書き出す。
 * @param {String|Array} originalData カテゴリ抽出対象となる元データ
 * @return {String} 抽出したカテゴリから構成される<option>タグ
 */
function makeCateOptionsHtmlExceptAll(originalData){
	var cateArray = new Array();
	var cateOption = '';
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

$('#regConfirm').dialog({
	autoOpen: false,
	resizable: false,
	modal: true,
	height: 250,
	width: 300,
	buttons: {
		"Yes": function(){
			$(this).dialog("close");
			openDB().then(function(){
				addItemtoDB(cate, name, desc).then(function(){
        			$('#regComplete').dialog("open");
				}, function(err){
					alert(err);
				});
			});
		},
		"resubmit": function(){
			$(this).dialog("close");
			openDB().then(function(){
				addItemtoDB(cate, name, desc).then(function(){
        			$('#repregComplete').dialog("open");
				}, function(err){
					alert(err);
				});
			});
		},
		"Cancel": function(){
			$(this).dialog("close");
		}
	}
});

$('#regComplete').dialog({
    autoOpen: false,
    resizable: false,
    modal: true,
    height: 200,
    width: 250,
    buttons: {
        "OK": function(){
            $(this).dialog("close");
            location.href = "./index.html";
        }
    }
});

$('#repregComplete').dialog({
    autoOpen: false,
	resizable: false,
    modal: true,
    height: 200,
    width: 250,
    buttons: {
        "OK": function(){
			$(this).dialog("close");
			$('#name').val("");
			$('#description').val("");
        }
    }
});

$('#requireAlart').dialog({
    autoOpen: false,
    resizable: false,
    modal: true,
    height: 200,
    width: 250,
    buttons: {
        "OK": function(){
            $(this).dialog("close");
        }
    }
});

$('#confirmAdd').click(function(){
	cate = $('#getqueryId').val();
    name = $('#name').val();
    desc = $('#description').val();
    if( cate == "" || name == ""){
    	$('#requireAlart').dialog("open");
    } else {
		$('#regConfirm').html("以下の項目で登録しますか？<br>カテゴリ: " + cate + "<br>名前: " + name + "<br>説明: " + desc);
		$('#regConfirm').dialog("open");
	}
});