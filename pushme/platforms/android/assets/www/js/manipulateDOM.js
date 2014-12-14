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
		showCategorizedItems();

		// queryIdが変化したら呼ぶ
		$('#queryId').change(function(){
			var queryData = {"tag" : $('#queryId').val()};
			showCategorizedItems(queryData.tag);
		});

		// submit押されたら呼ぶ
		$('#submitId').click(function(){
			var queryData = {"tag" : $('#queryId').val()};
			showCategorizedItems(queryData.tag);
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
		getCategorizedItemsfromDB(query).then(function(items){
			categorizedData = items;
			var itemListHtml = makeShownItemListHtml(categorizedData);

			$('#itemlist').html(itemListHtml);
			// 詳細情報を追加
			makeAccordion();
		});
	}
}

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
			itemListHtml += '<input type="button" name="detail" value="詳細"></div>';
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
