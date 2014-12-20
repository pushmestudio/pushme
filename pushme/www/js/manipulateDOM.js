/**
 * @fileOverview データを取得して必要な件数を抽出し、HTML出力します。
 */
 // データの取得を一度に抑えるために、DB内の全データを格納する
var storedData;

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
			var categoryOptionsHtml = makeCateOptionsHtml(storedData);
			$('#queryId').append(categoryOptionsHtml);
			// DOMを更新
			var itemListHtml = makeShownItemListHtml(storedData);
			$('#itemlist').html(itemListHtml);
			// 各種ボタン機能の埋め込み
			makeAccordion();
			makeEdit();

			// queryIdが変化したら呼ぶ
			$('#queryId').change(function(){
				var queryData = {"tag" : $('#queryId').val()};
				categorizedData = extractByCate(storedData, queryData.tag);
				// DOMを更新
				var itemListHtml = makeShownItemListHtml(categorizedData);
				$('#itemlist').html(itemListHtml);
				// 各種ボタン機能の埋め込み
				makeAccordion();
				makeEdit();
			});

			// submitが押されたら呼ぶ
			$('#submitId').click(function(){
				var queryData = {"tag" : $('#queryId').val()};
				categorizedData = extractByCate(storedData, queryData.tag);
				// DOMを更新
				var itemListHtml = makeShownItemListHtml(categorizedData);
				$('#itemlist').html(itemListHtml);
	//			showCategorizedItems();
				// 各種ボタン機能の埋め込み
				makeAccordion();
				makeEdit();
			});

			console.dir(storedData);
		}, function(err){
			alert(err);
		});
	}, function(err){
		alert(err);
	});
});

/**
 * ◆◆◆◆◆◆◆◆◆現在未使用◆◆◆◆◆◆◆◆◆◆◆◆
 * 指定されたカテゴリのレコードを抽出し、htmlに書き出す
 * @param {String|Array} query 抽出を行うカテゴリ
 */
function showCategorizedItems(query){
	if(typeof query === "undefined" || query.length <= 0){
		var itemListHtml = makeShownItemListHtml(storedData);
		$('#itemlist').html(itemListHtml);
		// 詳細情報を追加
		makeAccordion();
	} else {
		getCategorizedItemsfromDB(query).then(function(categorizedData){
			var itemListHtml = makeShownItemListHtml(categorizedData);

			$('#itemlist').html(itemListHtml);
			// 詳細情報を追加
			makeAccordion();
		});
	}
}

/**
 * 受け取ったデータ及びクエリに基づき、クエリの内容に合致したデータを抽出する。
 * クエリが空だった場合には受け取ったデータをそのまま返す。
 * @param {String|Array} originalData 抽出対象となる元データ
 * @param {String} [query] 抽出条件となるカテゴリを示すクエリ
 * @return {String|Array} クエリの条件に合致したデータ
 */
var extractByCate = function(originalData, query){
	var categorisedData = new Array();
	if(typeof query === "undefined" || query.length <= 0){
		categorisedData = originalData;
	} else {
		for(var i = 0, n = originalData.length; i < n; i++){
			if(query === originalData[i].category){
				categorisedData.push(originalData[i]);
				console.debug(originalData[i]);
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
	var cateOption;
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

/**
 * 編集が押されたときの処理を記述する。
 */
 function makeEdit(){
 	var name = "";
 	$('input[name="edititem"]').click(function(){
 		oldname = $(this).parent().children('div[name="title"]').text();
 		$('#editRegItem').dialog("open");
 	});
}

/**
 * 詳細情報を表示するアコーディオンを作成する。
 */
function makeAccordion(){
	$(function(){
		$('.accordion input[name="detail"]').click(function(){
			$(this).parent().next("ul").slideToggle();
			$(this).toggleClass("open");
		});
	});
}

/**
 * 受け取ったデータからhtml上に、一覧表示で使用するリストを作成する
 * @param {String|Array} extData 抽出済みのデータ
 * @return {String} itemListを構成するタグ
 */
function makeShownItemListHtml(extData){
	var itemListHtml = "";
	if(extData.length > 0){
		itemListHtml += '<form name="itemlist" class="pure-form pure-form-aligned">';
		itemListHtml += '<div class="pure-g">';
		itemListHtml += '<span class="accordion">';

		for(var i = 0, n = extData.length; i < n; i++){
			var name = extData[i].name;
			var cate = extData[i].category;
			var desc = extData[i].description;

			itemListHtml += '<div name="arrow" class="pure-u-1 pure-u-md-1-4">';
			itemListHtml += '<div name="card">';
			itemListHtml += '<div name="title"><label for="item' + i + '">' + name + '</label></div>';
			itemListHtml += '<input type="button" name="detail" value="詳細">';
			itemListHtml += '<input type="button" name="edititem" value="編集"></div>';
			itemListHtml += '<ul>';
			itemListHtml += '<li>カテゴリ:' + cate + '</li>';
			itemListHtml += '<li>説明:' + desc + '</li></ul></div>';
		}
		itemListHtml += '</span></div></div>';
		itemListHtml += "</form>";
	} else {
		itemListHtml = '<p name="itemlist">結果が見つかりませんでした。</p>';
	}

	return itemListHtml;
}


/**
 * sotredDataの中身を更新(再取得)する
 * 更新するのはメモリ上に保存されているデータである
 * @param {String|Array} originalData 抽出対象となる元データ
 * @param {String} [query] 抽出条件となるカテゴリを示すクエリ
 * @return {String|Array} クエリの条件に合致したデータ
 */
function updateStoredData(oldname, newcate, newname, newdesc){
	for(var i = 0, n = storedData.length; i < n; i++){
		if(oldname === storedData[i].name){
			storedData[i].category = newcate;
			storedData[i].name = newname;
			storedData[i].description = newdesc;
		}
	}
	// 変更されたアイテムのカテゴリがカテゴリ一覧にあるかを確認し、プルダウンに追加
	var categoryOptionsHtml = addCateOptionsHtml(newcate);
	$('#queryId').append(categoryOptionsHtml);
	var queryData = {"tag" : $('#queryId').val()};
	categorizedData = extractByCate(storedData, queryData.tag);
	// DOMを更新
	var itemListHtml = makeShownItemListHtml(categorizedData);
	$('#itemlist').html(itemListHtml);
	// 各種ボタン機能の埋め込み
	makeAccordion();
	makeEdit();
}

function addCateOptionsHtml(newcate){
	objectList = $('#queryId').children('option[name]');
	cateArray = new Array();
	var cateOption;
	for(var i = 0; i < objectList.length; i++){
		cateArray.push($(objectList[i]).val());
	//	console.debug(objectList[i]);
	}
	console.debug(cateArray);
	if(cateArray.indexOf(newcate) === -1){
		cateOption += '<option value="' + newcate + '" name="' + newcate + '">' + newcate + '</option>';
	}
	return cateOption;
}