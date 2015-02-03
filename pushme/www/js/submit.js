/**
 * @fileOverview データを取得して必要な件数を抽出し、HTML出力します。
 * @copyright PushMe Studio 2015
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
			$('#options').append(categoryOptionsHtml);
		}, function(err){
			alert(err);
		});
	}, function(err){
		alert(err);
	});

	// ここからcustom comboboxのためのwidget定義
	
	$.widget("ui.combobox", {
		// 以下メソッド定義
		_create: function(){
			// このwidgetが持つwrapperという変数は、呼び出し元の要素直下に、custom_comboboxクラスを適用したspan要素(jQueryオブジェクト)を表す
			this.wrapper = $("<span>")
				.addClass("custom_combobox")
				.insertAfter(this.element);
			// 呼び出し者との要素を非表示にする
			this.element.hide();
			this._createAutocomplete();
			this._createShowAllButton();
		},

		_createAutocomplete: function(){
			var select = this.element;
			var selected = select.children(":selected");
			// valueの値は、selectex.val()が存在すれば、selected.text()の値、存在しなければ空文字
			var value = selected.val() ? selected.text() : "";

			// このwidgetが持つinputという変数についての定義。inputはjQueryオブジェクト
			this.input = $("<input>")
				.appendTo(this.wrapper) 		// wrapper直下にこれを追加
				.val(value)						// input要素のvalue属性にvalueを代入
				.attr("id", "category")				// id属性にcategoryをセット
                .attr("placeholder", "Category")    // placeholderとして"Category"と表示されるようにセット
				.addClass("custom-combobox-input")	// 自作クラスをセット
				// Comboboxの内容をautocompleteで一覧表示する
				.autocomplete({
					delay: 0,					// リストメニューの検索が実行されるまでの時間
					minLength: 0,				// リストメニューの検索が実行されるのに最低限必要なユーザーの入力文字数
					source: $.proxy(this, "_source")	// _source関数内で使用されるthisを、このオブジェクト自身(widget)にバインドする
					// ちなみに、sourceオプションの引数に関数を指定した場合、それはrequestとresponseを引数にもつcallback関数とみなされる
				})
				.tooltip();
		},

		// autocompleteのsourceオプションに指定されたcallback関数
		// requestオブジェクトは"term"というプロパティのみをもち、これはautocompleteが設定されたinputフィールドの値(text)を格納している
		// response関数はユーザーに提供するデータを格納しておく1つの引数をもつcallback関数である
		// responseの引数となるデータは、requestの"term"によってフィルタリングされるべきであり、String-Array,Object-Arrayといった配列でなくてはならない
		_source: function(request, response){
			// RegExp関数は第１引数のパターンに従ったtextにマッチする正規表現オブジェクトを生成する
			// 第２引数はflagsと呼ばれ、iは大文字・小文字の無視を表す
			// まず、意味のある正規表現を許さないため、エスケープ処理を行っている
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
			// 呼び出し元の要素の直下にある"option"要素を取得し、map関数によってそのtextの値のみを配列として抜き出す
			response(this.element.children("option").map(function(){
				// this(option要素)のtextの値を格納
				var text = $(this).text();
				// this(option)のvalueが存在し、かつrequest.termが存在するかもしくはmatcherで指定した正規表現のパターンにマッチしていたら
				if(this.value && (!request.term || matcher.test(text)))
					// labelはinputのボックス内に表示される値であり、valueはユーザーがそれを選択した場合にinput要素に挿入される
					return {
						label: text,
						value: text,
						option: this
					};
				})
			);
			if (!request.term){
				this.element.val("");
			}
		},

		_createShowAllButton: function(){
			var input = this.input;
			var wasOpen = false;

			// aタグ(jqueryオブジェクト)を用意
			$("<a>")
				.attr("tabIndex", -1)			// tabIndex属性に-1をセット
				.appendTo(this.wrapper)			// wrapper直下にこれを追加
				.button({						// aタグの左側にアイコン(▼)を持つボタンを作成。テキストは表示させない
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				})
				.removeClass("ui-corner-all")	// 不要なclassを取り除き、必要なclassを追加する
				.addClass("ui-corner-right ui-button-icon custom-combobox-button")
				.mousedown(function(){			// ボタンが押されたら、autocompleteが表示されているか確認
					wasOpen = input.autocomplete("widget").is(":visible");
				})
				.click(function(){
					// inputがもつフォーカスイベントを実行する
					input.focus();
					// すでに一覧表示されていたら閉じる
					if(wasOpen){
						return;
					}
					// 空文字で検索を行うことで一覧表示
					input.autocomplete("search", "");
				});
		},

		_destroy: function(){
			this.wrapper.remove();
			this.element.show();
		}
	});
	$("#options").combobox();
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
		"Done": function(){
			$(this).dialog("close");
			openDB().then(function(){
				addItemtoDB(cate, name, desc).then(function(){
        			$('#name').val("");
					$('#description').val("");
				}, function(err){
				});
			});
		},
		"Cancel": function(){
			$(this).dialog("close");
		}
	}
});

$('#confirmAdd').click(function(){
	cate = $('#category').val();
    name = $('#name').val();
    desc = $('#description').val();
    if( cate == "" || name == ""){
    	  $('#addFailCuzEmptyElementExists').stop().fadeIn(500).delay(2000).fadeOut(500);
    } else {
		$('#regConfirm').html("Add the following item ?<br>【Category】: " + cate + "<br>【Subject】: " + name + "<br>【Description】: " + desc);
		$('#regConfirm').dialog("open");
	}
});