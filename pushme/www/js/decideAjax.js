/**
 * decideAjax.jsが読み込まれる際に呼び出される。
 * データ取得後、事前に設定した件数分ランダムに抽出し、
 * 呼び出し元のhtml上に書き出す。
 * 
 * 又、このjsの読み込みの初回のみカテゴリの一覧を読み込む。
 */
$(function(){
	$.ajax({
		url: "https://api.myjson.com/bins/10cr3",
		type: "GET",
		success: function(data){
			var extData = randomExtract(data);
			var itemListHtml = makeItemListHtml(extData);
			$('#itemlist').html(itemListHtml);
			
			makeAccordion();
			makeIsChecked();
			
			var categoryOptionsHtml = makeCateOptionsHtml(data);
			$('#queryId').append(categoryOptionsHtml);
		},
		error: function(extData){
			alert("error occurred");
		}
	});
});

/**
 * カテゴリの選択が行われた際に呼び出される。
 * データ取得後、事前に設定した件数分ランダムに抽出し、
 * 呼び出し元のhtml上に書き出す。
 */
$('#submitId').click(function(){
	var queryData = {"tag" : $('#queryId').val()};
	$.ajax({
		url: "https://api.myjson.com/bins/10cr3",
		type: "GET",
		success: function(data){
			var categorisedData = extractByCate(data, queryData.tag);
			var extData = randomExtract(categorisedData);
			var itemListHtml = makeItemListHtml(extData);
			$('#itemlist').html(itemListHtml);

			makeAccordion();
			makeIsChecked();			
		},
		error: function(extData){
			alert("error occurred");
		}
	});
});

function clipItem(){
	/*    decision +='<form action="/addclip" method="post">';
	//decision += '<input type="button" value="クリップ" onclick="clipItem()">';
	//decision += '<input type="submit" value="クリップ">';
	test="aaaaaaa";
	decision += '<input type="submit" value="'+clipName[0]+'">';
	decision += "</form>";
	$('#decision').html(decision);
	'<input type="hidden" value="'+cn+'">'
	*/
	//
}

function narrowItems(){
	$('#narrow').prop("disabled", true);
	itemlist = $('[name="item"]');
	itemlist.each(function(){
		if($(this).prop("checked")){
			$(this).prop("checked", false);
		} else {
			$(this).parents('div[name="arrow"]').remove();
		}
	});
}

/*
function decideItem(){
itemlist = $('[name="item"]');
decide = Math.floor(itemlist.length * Math.random());
itemlist.each(function(i, value){
if(i == decide){
choice = $(this).nextAll('label').text();
//var clipName = choice.subString(0,'(');
var clipName = choice.split("(");
decision = "<p>Your choice is : " + choice + "</p>";
//お店の名前(title)を取得
decision += '<form action="/addclip" method="post" class="pure-form">';
//decision += '<input type="button" value="クリップ" onclick="clipItem()">';
//decision += '<input type="submit" value="クリップ">';
console.log("clipName: " + clipName[0]);
decision += '<input type="hidden" id="id" name="name" value="'+clipName[0]+'">';
decision += '<input type="submit" value="クリップする" class="pure-button pure-button-success">';
decision += "</form>";
$('#decision').html(decision);
}
});
}
*/

function decideItem(){
	$('#decide').prop("disabled", true);
	var itemlist = $('div[name="card"]');
	var i = 0;
	var count = 0;
	var random = 0;
	timerId = setInterval(function(){
		// itemlist.get(index)が返す値はjQuery ObjectではなくDOM Elementであるため、$()を使用してjQuery Objectに変換する必要がある
		$(itemlist.get(random)).animate({ backgroundColor: "#eeeeee", borderColor: "#0000ff" }, 100);
		random = Math.floor(itemlist.length * Math.random());
		$(itemlist.get(random)).animate({ backgroundColor: "#ffff77", borderColor: "#ffff77" }, 100);
		i++;
		if(i == 15){
			clearInterval(timerId);
			countId = setInterval(function(){
				$(itemlist.get(random)).fadeOut(300, function(){$(this).fadeIn(300)});
				count++;
				if(count == 5){
					clearInterval(countId);
				}
			}, 1000);
			//お店の名前(title)を取得
			decision = "";
			choice = $(itemlist.get(random)).children('div[name="title"]').text();
			console.log(choice);
			decision += '<form action="/addclip" method="post" class="pure-form">';
			decision += '<input type="hidden" id="id" name="name" value="' + choice + '">';
			decision += '<input type="submit" value="クリップする" class="pure-button pure-button-success">';
			decision += "</form>";
			$('#decision').html(decision);
		}
	}, 300)
}

//詳細表示
function makeAccordion(){
	$(function(){
		$('.accordion input[name="detail"]').click(function(){
			$(this).parent().next("ul").slideToggle();
			$(this).toggleClass("open");
		});
	});
}

function makeIsChecked(){
	$('#itemlist').find('input[type="checkbox"]').click(function(){
		var itemlength = $('#itemlist').find('input[type="checkbox"]').filter(":checked").length;
		if(itemlength > 0){
			$('#narrow').prop("disabled", false);
		}else{
			$('#narrow').prop("disabled", true);
		}
	});
}

var extractAmountDummyConfig = 8;//ランダムで抽出する数, いずれはユーザ設定ファイル等から持ってくる必要がある

/**
 * 受け取ったデータ及びデータ抽出件数に基づき、ランダムにデータを抽出する。
 * データが件数以下の場合は全件出力する。この場合にはランダムな並び替えは実施しない。
 * @param {String|Array} originalData 抽出対象となる元データ
 * @param {number} extractAmount 抽出件数
 * @return {String|Array} データから指定条件に基づいた抽出
 */
function randomExtract(originalData, extractAmount){
	if(typeof extractAmount === "undefined"){
		extractAmount = extractAmountDummyConfig;//configから持ってきたという想定
	}
	var extractedData = new Array();
	var originalDataLength = originalData.length;
	console.debug("original data length is : " + originalDataLength);

	if(originalDataLength <= extractAmount){
		extractedData = originalData; // 実データ数が抽出したい数以下のため抽出する必要がない
		console.debug("no need to extract");

	} else {
		var extractNumberArray = new Array();
		for(var i = 0; i < extractAmount; i++){
			var candidateNumber = Math.round(Math.random() * (originalDataLength - 1));// Lengthと同じ値のインデックスだと配列の長さを超える
			console.debug("candidateNumber is : " + candidateNumber);
			if(extractNumberArray.indexOf(candidateNumber) != -1){
				i--;//今回の回をなかったことにしてもう一度やり直させる
				console.debug("dupulicated number is detected. Abort the canditate and try again.");
			}else{
				console.debug(originalData[candidateNumber]);
				extractNumberArray.push(candidateNumber); // 重複を防ぐ
				extractedData.push(originalData[candidateNumber]); // 抽出したデータを挿入
			}
		}
	}
	console.debug("returning data length is : " + extractedData.length);
	return extractedData;
}

/**
 * 受け取ったデータ及びクエリに基づき、クエリの内容に合致したデータを抽出する。
 * クエリが空だった場合には受け取ったデータをそのまま返す。
 * @param {String|Array} originalData 抽出対象となる元データ
 * @param {String} query 抽出条件となるカテゴリを示すクエリ
 * @return {String|Array} クエリの条件に合致したデータ
 */
function extractByCate(originalData, query){
	var categorisedData = new Array();
	if(typeof query === "undefined" || query.length <= 0){
		categorisedData = originalData;
	} else {
		for(var i = 0, n = originalData.length; i < n; i++){
			if(query === originalData[i].cate){
				categorisedData.push(originalData[i]);
				console.debug(originalData[i]);
			}
		}
	}
	return categorisedData;
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
			var cate = originalData[i].cate;
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
 * 受け取ったデータからhtml上にリストを作成する
 * @param {String|Array} extData 抽出済みのデータ
 * @return {String} itemListを構成するタグ
 */
function makeItemListHtml(extData){
	var itemListHtml = "";
	if(extData.length > 0){
		itemListHtml += '<form name="itemlist" class="pure-form pure-form-aligned">';
		itemListHtml += '<div class="pure-g">';
		itemListHtml += '<span class="accordion">';

		for(var i = 0, n = extData.length; i < n; i++){
			var name = extData[i].name;
			var cate = extData[i].cate;
			var desc = extData[i].desc;

			itemListHtml += '<div name="arrow" class="pure-u-1 pure-u-md-1-4">';
			itemListHtml += '<div name="card"><input type="checkbox" name="item" id="item' + i + '">';
			itemListHtml += '<div name="title"><label for="item' + i + '">' + name + '</label></div>';
			itemListHtml += '<input type="button" name="detail" value="詳細"></div>';
			itemListHtml += '<ul>';
			itemListHtml += '<li>カテゴリ:' + cate + '</li>';
			itemListHtml += '<li>コメント:' + desc + '</li></ul></div>';
		}
		itemListHtml += '</span></div></div>';
		itemListHtml += '<input type="button" id="narrow" disabled="disabled" value="絞り込む" onclick="narrowItems()" class="pure-button pure-button-small">';
		itemListHtml += '<input type="button" id="decide" value="最終決定" onclick="decideItem()" class="pure-button pure-button-small">';
		itemListHtml += "</form>";
	} else {
		itemListHtml = '<p name="itemlist">結果が見つかりませんでした。</p>';
	}

	return itemListHtml;
}