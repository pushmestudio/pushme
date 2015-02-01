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
			makeDel();
			clipOnRegitemlist();

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
				makeDel();
				clipOnRegitemlist();
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
				makeDel();
				clipOnRegitemlist();
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
 * 編集が押されたときの処理を記述する。
 */
 function makeEdit(){
 	var name = "";
 	$('button[name="edititem"]').click(function(){
 		oldname = $(this).parents('div[name="card"]').children('div[name="name"]').text();
 		oldcate = $(this).parents('div[name="card"]').next().find('span[name="cate"]').text();
 		olddesc = $(this).parents('div[name="card"]').next().find('span[name="desc"]').text();

		$('#newname').val(oldname);
		$('#newcate').val(oldcate);
		$('#newdesc').val(olddesc);

 		$('#editRegItem').dialog("open");
 	});
}

/**
 * 削除ボタンのクリック時にコールされる
 */
function makeDel(){
 	var name = "";
 	$('button[name="deleteitem"]').click(function(){
 		delname = $(this).parents('div[name="card"]').children('div[name="name"]').text();
 		delcate = $(this).parents('div[name="card"]').next().find('span[name="cate"]').text();
 		deldesc = $(this).parents('div[name="card"]').next().find('span[name="desc"]').text();
 		$('#delItem').html("カテゴリ: " + delcate + "<br>名前: " + delname + "<br>説明: " + deldesc);
 		$('#delItem').dialog("open");
 	});
}

/**
 * 詳細情報を表示するアコーディオンを作成する。
 */
function makeAccordion(){
	$(function(){
		$('.accordion button[name="detail"]').click(function(){
			$(this).parents('div[name="card"]').next("ul").slideToggle();
			$(this).toggleClass("open");
		});
	});
}

//下記、現在未実装
/**
 * 登録データ一覧画面で UnClip/Clipボタン押下時のボタン表示/非表示操作。およびDBのclip属性の変更メソッド呼出
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
			console.log("clipFlag : " + i + " : " + clipFlag);
			
			itemListHtml += '<div name="arrow" class="pure-u-1">';
			itemListHtml += '<div name="card">';
			itemListHtml += '<div name="name"><label for="item' + i + '">' + name + '</label></div>';

			itemListHtml += '<div name="buttons">';
			itemListHtml += '<button type="button" name="'+clipFlag+'" id="clipFlagTrue_'+i+'" value="UnClip" tyle="display: none;"><img src="../img/accordion.png"></button>';
			itemListHtml += '<button type="button" name="'+clipFlag+'" id="clipFlagFalse_'+i+'" value="Clip" style="display: none;"><img src="../img/accordion.png"></button>';
			itemListHtml += '<button type="button" name="detail" class="pure-button"><img src="../img/accordion.png"></button>';
			itemListHtml += '<button type="button" name="edititem" class="pure-button"><img src="../img/edit.png"></button>';
			itemListHtml += '<button type="button" name="deleteitem" class="pure-button"><img src="../img/delete.png"></button>';
			itemListHtml += '</div>';
			itemListHtml += '</div><ul>';
			itemListHtml += '<li>【<span name="cate">' + cate + '</span>】</li>';
			itemListHtml += '<li><span name="desc">' + desc + '</span></li></ul></div>';	
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
	// カテゴリ一覧を更新
	categorizedData = extractByCate(storedData, newcate);
	var categoryOptionsHtml = makeCateOptionsHtml(storedData);
	$('#queryId').html(categoryOptionsHtml);
	$('#queryId').val(newcate);
	var itemListHtml = makeShownItemListHtml(categorizedData);
	$('#itemlist').html(itemListHtml);

	// 各種ボタン機能の埋め込み
	makeAccordion();
	makeEdit();
	makeDel();
	clipOnRegitemlist();
}

/**
 * DBからアイテムを削除した際に、DOMで扱うstoredDataの中身を削除
 * 対象カテゴリに該当するアイテムがない場合はカテゴリ自体を削除
 *
 */
function updateStoredDataForDeleteProcess(delname){
	var check, targetCate;
	for(var i = 0, n = storedData.length; i < n; i++){
		if(delname === storedData[i].name){
			check = i;
			targetCate = storedData[i].category;
		};
	}
	storedData.some(function(v,check){
		if (v.name==delname){
			storedData.splice(check,1);
			console.log("delete from storedData");
		}
	});
	categorizedData = extractByCate(storedData, targetCate);//queryData.tag
	if (categorizedData.length==0){//カテゴリに該当するアイテムが０の時
		var newCateHtml = '<select id="queryId">';
		newCateHtml += makeCateOptionsHtml(storedData);
		newCateHtml += '</select>';
		$('#queryId').replaceWith(newCateHtml);
		var itemListHtml = makeShownItemListHtml(storedData);
	}else{//カテゴリに該当するアイテムが１つ以上ある時
		$('#queryId').html(makeCateOptionsHtml(storedData));
		$('#queryId').val(targetCate);
		var itemListHtml = makeShownItemListHtml(categorizedData);
	}
	$('#itemlist').html(itemListHtml);
	reloadqueryIdChangeFunc();//queryIdを再定義したため、リロード
}

/**
 * queryIdの再定義に伴い、queryId変更時のアクションをリロードするメソッド
 */
var reloadqueryIdChangeFunc = function(){
	makeAccordion();
	makeEdit();
	makeDel();
	clipOnRegitemlist();
	$('#queryId').change(function(){
		var queryData = {"tag" : $('#queryId').val()};
		categorizedData = extractByCate(storedData, queryData.tag);
		var itemListHtml = makeShownItemListHtml(categorizedData);
		$('#itemlist').html(itemListHtml);
		makeAccordion();
		makeEdit();
		makeDel();
		clipOnRegitemlist();
	});
}

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
	makeAccordion();
	makeEdit();
	makeDel();
	clipOnRegitemlist();
}
