/**
 * @fileOverview データを取得して必要な件数を抽出し、HTML出力します。
 * @copyright PushMe Studio 2015
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
			clipOnRegitemlist();

			// queryIdが変化したら呼ぶ
			$('#queryId').change(function(){
				var queryData = {"tag" : $('#queryId').val()};
				categorizedData = extractByCate(storedData, queryData.tag);
				// DOMを更新
				var itemListHtml = makeShownItemListHtml(categorizedData);
				$('#itemlist').html(itemListHtml);
				// 各種ボタン機能の埋め込み
				clipOnRegitemlist();
			});

			// submitが押されたら呼ぶ
			$('#submitId').click(function(){
				var queryData = {"tag" : $('#queryId').val()};
				categorizedData = extractByCate(storedData, queryData.tag);
				// DOMを更新
				var itemListHtml = makeShownItemListHtml(categorizedData);
				$('#itemlist').html(itemListHtml);
				// 各種ボタン機能の埋め込み
				clipOnRegitemlist();
			});
		}, function(err){});
	}, function(err){});
});

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

/**
 * 編集が押されたときの処理を記述する
 */
$('#itemlist').on("click", 'button[name="edititem"]', function(){
 	oldname = $(this).parents('div[name="card"]').children('div[name="name"]').text();
	oldcate = $(this).parents('div[name="card"]').next().find('span[name="cate"]').text();
	olddesc = $(this).parents('div[name="card"]').next().find('span[name="desc"]').text();
	$('#newname').val(oldname);
	$('#newcate').val(oldcate);
	$('#newdesc').val(olddesc);
	$('#editRegItem').dialog("open");
});

/**
 * 削除ボタン押下でコールされるメソッド
 * 削除時に必要な削除対象の名前を抽出し、削除操作の確認ダイアログを呼出す
 */
$('#itemlist').on("click", 'button[name="deleteitem"]', function(){
	delname = $(this).parents('div[name="card"]').children('div[name="name"]').text();
	delcate = $(this).parents('div[name="card"]').next().find('span[name="cate"]').text();
	deldesc = $(this).parents('div[name="card"]').next().find('span[name="desc"]').text();
	$('#delItem').html("[Category]: " + delcate + "<br>[Subject]: " + delname + "<br>[Description]: " + deldesc);
	$('#delItem').dialog("open");
});

/**
 * 詳細情報を表示するアコーディオンを作成する
 */
$('#itemlist').on("click", '.accordion button[name="detail"]', function(){
	$(this).parents('div[name="card"]').next("ul").slideToggle();
	$(this).toggleClass("open");
});

/**
 * [画面操作] 登録データ一覧画面でクリップボタン押下で、クリップボタン(★<-->☆)を切替えるメソッド
 * [DB操作] ControllerとしてDBのclip属性を変更するメソッド呼出しを行うメソッド
 */
function clipOnRegitemlist(){
	for(var i = 0, n = storedData.length; i < n; i++){
		//name=="true"の時、既にクリップ済なので、UnClipボタンを表示
		if($('#clipFlagTrue_'+i).attr("name")=="true"){
			$('#clipFlagTrue_'+i).css("display", "inline");//UnClipボタン-->表示
			$('#clipFlagFalse_'+i).css("display", "none");//Clipボタン-->非表示
		//name=="false"の時、未クリップなので、Clipボタンを表示
		}else if ($('#clipFlagTrue_'+i).attr("name")=="false"){
			$('#clipFlagTrue_'+i).css("display", "none");//UnClipボタン-->非表示
			$('#clipFlagFalse_'+i).css("display", "inline");//Clipボタン-->表示
		}
	}
	//UnClipボタン押下で、UnClipをnoneに、Clipをinlineに変更
	$('button[value="UnClip"]').click(function(){
			$('#'+$(this).attr("id")).css("display","none");//UnClipボタン-->非表示に変更
			$('#'+$(this).next().attr("id")).css("display","inline");//Clipボタン-->表示に変更
			var clip2false = $(this).parents('div[name="card"]').children('div[name="name"]').text();
			offClipfromDB(clip2false);//DBのclip属性をfalseにするメソッド呼出(database.js)
			updateStoredDataForClipOnRegitemlist(clip2false, "false");//itemlist更新
	});
	//Clipボタン押下で、Clipをnoneに、UnClipをinlineに変更
	$('button[value="Clip"]').click(function(){
			$('#'+$(this).attr("id")).css("display","none");//Clipボタン-->非表示に変更
			$('#'+$(this).prev().attr("id")).css("display","inline");//UnClipボタン-->表示に変更
			var clip2true = $(this).parents('div[name="card"]').children('div[name="name"]').text();
			addClip(clip2true);//DBのclip属性をtrueにするメソッド呼出(database.js)
			updateStoredDataForClipOnRegitemlist(clip2true, "true");//itemlist更新
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
			clipFlag = extData[i].clip;
			itemListHtml += '<div name="arrow" class="pure-u-1">';
			itemListHtml += '<div name="card">';
			itemListHtml += '<div class="star-icon">';
			itemListHtml += '<button type="button" name="'+clipFlag+'" id="clipFlagTrue_'+i+'" value="UnClip" style="display: none;"><img src="../img/clip_true.png"></button>';
			itemListHtml += '<button type="button" name="'+clipFlag+'" id="clipFlagFalse_'+i+'" value="Clip" style="display: none;"><img src="../img/clip_false.png"></button>';
			itemListHtml += '</div>';
			itemListHtml += '<div name="name"><label for="item' + i + '">' + name + '</label></div>';
			itemListHtml += '<div name="buttons">';
			itemListHtml += '<button type="button" name="detail" class="pure-button"><img src="../img/accordion.png"></button>';
			itemListHtml += '<button type="button" name="edititem" class="pure-button"><img src="../img/edit.png"></button>';
			itemListHtml += '<button type="button" name="deleteitem" class="pure-button"><img src="../img/delete.png"></button>';
			itemListHtml += '</div>';
			itemListHtml += '</div><ul>';
			itemListHtml += '<li>[<span name="cate">' + cate + '</span>]</li>';
			itemListHtml += '<li><span name="desc">' + desc + '</span></li></ul></div>';
		}
		itemListHtml += '</span></div></div>';
		itemListHtml += "</form>";
	} else {
		itemListHtml = '<p name="itemlist">Results not found</p>';
	}
	return itemListHtml;
}

/**
 * sotredDataの中身を更新(再取得)する
 * 更新するのはメモリ上に保存されているデータである
 * @param {String} oldname 編集前の名前
 * @param {String} newcate 編集後のカテゴリ
 * @param {String} newname 編集後の名前
 * @param {String} newdesc 編集後の説明
 */
function updateStoredData(oldname, newcate, newname, newdesc){
	for(var i = 0, n = storedData.length; i < n; i++){
		if(oldname === storedData[i].name){
			storedData[i].category = newcate;
			storedData[i].name = newname;
			storedData[i].description = newdesc;
		}
	}
	categorizedData = extractByCate(storedData, newcate);
	oldCategorizedData = extractByCate(storedData, oldcate);
	if (oldCategorizedData.length==0){//カテゴリに該当するアイテムが０の時
		if (($('#queryId').val())!=""){
			var newCateHtml = '<select id="queryId">';
			newCateHtml += makeCateOptionsHtml(storedData);
			newCateHtml += '</select>';
			$('#queryId').replaceWith(newCateHtml);
			$('#queryId').val(newcate);
			var itemListHtml = makeShownItemListHtml(categorizedData);
		}else{
			var newCateHtml = '<select id="queryId">';
			newCateHtml += makeCateOptionsHtml(storedData);
			newCateHtml += '</select>';
			$('#queryId').replaceWith(newCateHtml);
			var itemListHtml = makeShownItemListHtml(storedData);
		}
	}else{//カテゴリに該当するアイテムが１つ以上ある時
		if (($('#queryId').val())!=""){
			$('#queryId').html(makeCateOptionsHtml(storedData));
			$('#queryId').val(newcate);
			var itemListHtml = makeShownItemListHtml(categorizedData);
		}else{
			$('#queryId').html(makeCateOptionsHtml(storedData));
			var itemListHtml = makeShownItemListHtml(storedData);
		}	
	}
	$('#itemlist').html(itemListHtml);
	reloadqueryIdChangeFunc();
}

/**
 * [画面操作] storedDataの中身を更新するメソッド
 * 削除後の基本動作：削除した際のカテゴリのアイテムを再描画
 * 削除後アイテム数が０の場合の動作：カテゴリALLのアイテムを再描画
 */
function updateStoredDataForDeleteProcess(delname){
	var check, targetCate;
	for(var i = 0, n = storedData.length; i < n; i++){
		if(delname === storedData[i].name){
			check = i;
			targetCate = storedData[i].category;
		}
	}
	storedData.some(function(v,check){
		if (v.name==delname){
			storedData.splice(check,1);
		}
	});
	categorizedData = extractByCate(storedData, targetCate);
	if (categorizedData.length==0){//カテゴリに該当するアイテムが０の時
		var newCateHtml = '<select id="queryId">';
		newCateHtml += makeCateOptionsHtml(storedData);
		newCateHtml += '</select>';
		$('#queryId').replaceWith(newCateHtml);
		var itemListHtml = makeShownItemListHtml(storedData);
	}else{//カテゴリに該当するアイテムが１つ以上ある時
		if (($('#queryId').val())!=""){
			$('#queryId').html(makeCateOptionsHtml(storedData));
			$('#queryId').val(targetCate);
			var itemListHtml = makeShownItemListHtml(categorizedData);
		}else{
			$('#queryId').html(makeCateOptionsHtml(storedData));
			var itemListHtml = makeShownItemListHtml(storedData);
		}	
	}
	$('#itemlist').html(itemListHtml);
	reloadqueryIdChangeFunc();//queryIdを再定義したため、リロード
}

/**
 * [画面操作] プルダウンメニューのカテゴリを操作した際に、自動的にカテゴリに合致したアイテムを再描画するメソッド
 */
var reloadqueryIdChangeFunc = function(){
	clipOnRegitemlist();
	$('#queryId').change(function(){
		var queryData = {"tag" : $('#queryId').val()};
		categorizedData = extractByCate(storedData, queryData.tag);
		var itemListHtml = makeShownItemListHtml(categorizedData);
		$('#itemlist').html(itemListHtml);
		clipOnRegitemlist();
	});
}

/**
 * [画面操作] 登録データ一覧画面でクリップ(★<-->☆)のOn/Offを反映させ、アイテムを再描画するメソッド
 * @param {string} clipNameOfFlagChanged : On/Offされた対象のアイテム名
 * @param {string} clipFlagChanged : "true" or "false"
 */
function updateStoredDataForClipOnRegitemlist(clipNameOfFlagChanged,clipFlagChanged){
	for(var i = 0, n = storedData.length; i < n; i++){
		if(clipNameOfFlagChanged === storedData[i].name){
			storedData[i].clip = clipFlagChanged;
		}
	}
	if (($('#queryId').val())!=""){
		var cateOfClip = $('#queryId').val()
		categorizedData = extractByCate(storedData, cateOfClip);
		var itemListHtml = makeShownItemListHtml(categorizedData);
	}else{
		var itemListHtml = makeShownItemListHtml(storedData);
	}
	$('#itemlist').html(itemListHtml);
	clipOnRegitemlist();
}

var delcate;   //削除確認時にカテゴリ名を出力するための変数
var delname; //削除対象を判定するための変数、かつ削除確認時にアイテム名を出力するための変数
var deldesc;  //削除確認時に詳細を出力するための変数

/**
 * 編集ボタン押下時に確認を促すダイアログ
 */
$('#editRegItem').dialog({
	autoOpen: false,
	resizable: false,
	modal: true,
	height: 400,
	width: 300,
	buttons: {
		"Modify": function(){
			var newname = $('#newname').val();
			var newcate = $('#newcate').val();
			var newdesc = $('#newdesc').val();
			if( newname === "" || newcate === ""){
				$(this).dialog("close");
				$('#editFailCuzEmptyElementExists').stop(true, true).fadeIn(500).delay(2000).fadeOut(500);
			} else {
				$(this).dialog("close");
//				openDB().then(function(){
					updateItemtoDB(oldname, newcate, newname, newdesc).then(function(){
						updateStoredData(oldname, newcate, newname, newdesc);
		                $('#editComplete').stop(true, true).fadeIn(500).delay(2000).fadeOut(500);
						$('#newname').val("");
						$('#newcate').val("");
						$('#newdesc').val("");

					}, function(err){
              			$('#editFail').stop(true, true).fadeIn(500).delay(2000).fadeOut(500);
					});
//				});
			}
		},
		"Cancel": function(){
			$(this).dialog("close");
		}
	}
});

/**
 * 削除ボタン押下時に確認を促すダイアログ
 * [DB操作] Controllerとして、対象アイテムを削除するメソッドを呼出す
 * [画面操作] Controllerとして、削除後の画面を再描画させるメソッドを呼出す
 */
$('#delItem').dialog({
	autoOpen: false,
	resizable: false,
	modal: true,
	height: 250,
	width: 300,
	buttons: {
		"Delete": function(){
			$(this).dialog("close");
			openDB().then(function(){
				delItemFromDB().then(function(){
					updateStoredDataForDeleteProcess(delname);
					$('#deleteComplete').stop(true, true).fadeIn(500).delay(2000).fadeOut(500);
				}, function(err){
              		$('#deleteFail').stop(true, true).fadeIn(500).delay(2000).fadeOut(500);
				});
			});
		},
		"Cancel": function(){
			$(this).dialog("close");
		}
	}
});
