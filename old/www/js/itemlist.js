/**
 * @fileOverview データを取得して必要な件数を抽出し、HTML出力します。
 * @copyright PushMe Studio 2015
 */
 
/**
 * @module itemlist
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
 * 編集が押されたときの処理を記述する
 */
$('#itemlist').on("click", 'button[name="edititem"]', function(){
 	oldsubj = $(this).parents('div[name="card"]').children('div[name="subj"]').text();
	oldcate = $(this).parents('div[name="card"]').next().find('span[name="cate"]').text();
	oldnote = $(this).parents('div[name="card"]').next().find('span[name="note"]').text();
	$('#newsubj').val(oldsubj);
	$('#newcate').val(oldcate);
	$('#newnote').val(oldnote);
	$('#editItem').dialog("open");
});

/**
 * 削除ボタン押下でコールされるメソッド
 * 削除時に必要な削除対象の名前を抽出し、削除操作の確認ダイアログを呼出す
 */
$('#itemlist').on("click", 'button[name="deleteitem"]', function(){
	delsubj = $(this).parents('div[name="card"]').children('div[name="subj"]').text();
	delcate = $(this).parents('div[name="card"]').next().find('span[name="cate"]').text();
	delnote = $(this).parents('div[name="card"]').next().find('span[name="note"]').text();
	$('#delItem').html("[Category]: " + delcate + "<br>[Subject]: " + delsubj + "<br>[Note]: " + delnote);
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
var clipOnRegitemlist = function(){
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
			var clip2false = $(this).parents('div[name="card"]').children('div[name="subj"]').text();
			offClipfromDB(clip2false);//DBのclip属性をfalseにするメソッド呼出(database.js)
			updateStoredDataForClipOnRegitemlist(clip2false, "false");//itemlist更新
	});
	//Clipボタン押下で、Clipをnoneに、UnClipをinlineに変更
	$('button[value="Clip"]').click(function(){
			$('#'+$(this).attr("id")).css("display","none");//Clipボタン-->非表示に変更
			$('#'+$(this).prev().attr("id")).css("display","inline");//UnClipボタン-->表示に変更
			var clip2true = $(this).parents('div[name="card"]').children('div[name="subj"]').text();
			addClip(clip2true);//DBのclip属性をtrueにするメソッド呼出(database.js)
			updateStoredDataForClipOnRegitemlist(clip2true, "true");//itemlist更新
	});
};

/**
 * 受け取ったデータからhtml上に、一覧表示で使用するリストを作成する
 * @param {String|Array} extData 抽出済みのデータ
 * @return {String} itemListを構成するタグ
 */
var makeShownItemListHtml = function(extData){
	var itemListHtml = "";
	if(extData.length > 0){
		itemListHtml += '<form name="itemlist" class="pure-form pure-form-aligned">';
		itemListHtml += '<div class="pure-g">';
		itemListHtml += '<span class="accordion">';
		for(var i = 0, n = extData.length; i < n; i++){
			var subj = extData[i].subject;
			var cate = extData[i].category;
			var note = extData[i].note;
			clipFlag = extData[i].clip;
			itemListHtml += '<div name="arrow" class="pure-u-1">';
			itemListHtml += '<div name="card">';
			itemListHtml += '<div class="star-icon">';
			itemListHtml += '<button type="button" name="'+clipFlag+'" id="clipFlagTrue_'+i+'" value="UnClip" style="display: none;"><img src="../img/clip_true.png"></button>';
			itemListHtml += '<button type="button" name="'+clipFlag+'" id="clipFlagFalse_'+i+'" value="Clip" style="display: none;"><img src="../img/clip_false.png"></button>';
			itemListHtml += '</div>';
			itemListHtml += '<div name="subj"><label for="item' + i + '">' + subj + '</label></div>';
			itemListHtml += '<div name="buttons">';
			itemListHtml += '<button type="button" name="detail" class="pure-button"><img src="../img/accordion.png"></button>';
			itemListHtml += '<button type="button" name="edititem" class="pure-button"><img src="../img/edit.png"></button>';
			itemListHtml += '<button type="button" name="deleteitem" class="pure-button"><img src="../img/delete.png"></button>';
			itemListHtml += '</div>';
			itemListHtml += '</div><ul>';
			itemListHtml += '<li>[<span name="cate">' + cate + '</span>]</li>';
			itemListHtml += '<li><span name="note">' + note + '</span></li></ul></div>';
		}
		itemListHtml += '</span></div></div>';
		itemListHtml += "</form>";
	} else {
		itemListHtml = '<p name="itemlist">Results not found</p>';
	}
	return itemListHtml;
};

/**
 * sotredDataの中身を更新(再取得)する
 * 更新するのはメモリ上に保存されているデータである
 * @param {String} oldsubj 編集前の名前
 * @param {String} newcate 編集後のカテゴリ
 * @param {String} newsubj 編集後の名前
 * @param {String} newnote 編集後の説明
 */
var updateStoredData = function(oldsubj, newcate, newsubj, newnote){
	for(var i = 0, n = storedData.length; i < n; i++){
		if(oldsubj === storedData[i].subject){
			storedData[i].category = newcate;
			storedData[i].subject = newsubj;
			storedData[i].note = newnote;
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
};

/**
 * [画面操作] storedDataの中身を更新するメソッド
 * 削除後の基本動作：削除した際のカテゴリのアイテムを再描画
 * 削除後アイテム数が０の場合の動作：カテゴリALLのアイテムを再描画
 */
var updateStoredDataForDeleteProcess = function(delsubj){
	var check, targetCate;
	for(var i = 0, n = storedData.length; i < n; i++){
		if(delsubj === storedData[i].subject){
			check = i;
			targetCate = storedData[i].category;
		}
	}
	storedData.some(function(v,check){
		if (v.subject==delsubj){
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
};

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
};

/**
 * [画面操作] 登録データ一覧画面でクリップ(★<-->☆)のOn/Offを反映させ、アイテムを再描画するメソッド
 * @param {string} clipNameOfFlagChanged : On/Offされた対象のアイテム名
 * @param {string} clipFlagChanged : "true" or "false"
 */
var updateStoredDataForClipOnRegitemlist = function(clipNameOfFlagChanged,clipFlagChanged){
	for(var i = 0, n = storedData.length; i < n; i++){
		if(clipNameOfFlagChanged === storedData[i].subject){
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
};

var delcate;	//削除確認時にカテゴリ名を出力するための変数
var delsubj;	//削除対象を判定するための変数、かつ削除確認時にアイテム名を出力するための変数
var delnote; 	//削除確認時に詳細を出力するための変数

/**
 * 編集ボタン押下時に確認を促すダイアログ
 */
$('#editItem').dialog({
	autoOpen: false,
	resizable: false,
	modal: true,
	height: "auto",
	width: "auto",
	buttons: {
		"Modify": function(){
			var newsubj = $('#newsubj').val();
			var newcate = $('#newcate').val();
			var newnote = $('#newnote').val();
			if( newsubj === "" || newcate === ""){
				$(this).dialog("close");
				$('#editFailCuzEmptyElementExists').stop(true, true).fadeIn(250).delay(1500).fadeOut(250);
			} else {
				$(this).dialog("close");
				updateItemtoDB(oldsubj, newcate, newsubj, newnote).then(function(){
					updateStoredData(oldsubj, newcate, newsubj, newnote);
	                $('#editComplete').stop(true, true).fadeIn(250).delay(1500).fadeOut(250);
					$('#newsubj').val("");
					$('#newcate').val("");
					$('#newnote').val("");

				}, function(err){
          			$('#editFail').stop(true, true).fadeIn(250).delay(1500).fadeOut(250);
				});
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
	height: "auto",
	width: "auto",
	buttons: {
		"Delete": function(){
			$(this).dialog("close");
			delItemFromDB().then(function(){
				updateStoredDataForDeleteProcess(delsubj);
				$('#deleteComplete').stop(true, true).fadeIn(250).delay(1500).fadeOut(250);
			}, function(err){
          		$('#deleteFail').stop(true, true).fadeIn(250).delay(1500).fadeOut(250);
			});
		},
		"Cancel": function(){
			$(this).dialog("close");
		}
	}
});
