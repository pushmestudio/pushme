/**
 * @fileOverview データを取得して必要な件数を抽出し、HTML出力します。
 * @copyright PushMe Studio 2015
 */

decideAjax = (function(){
	var storedData; // データの取得を一度に抑えるために共通で使う
	var originalData; //絞り込み前の状態を保存

	/**
	　* decideAjax.jsが読み込まれる際に呼び出される。
	　* データ取得後、事前に設定した件数分ランダムに抽出し、
	　* 呼び出し元のhtml上に書き出す。
	　*
	　* 又、このjsの読み込みの初回のみカテゴリの一覧を読み込む。
    　* 画面上に表示されているもののサイズ(特に高さ)を変えるようなイベントを起こす場合は、
     * 必ず、ads_utilsのfooterFixed()を呼んでください。
	*/
	$(function(){
		openDB().then(function(){
			// DBからすべてのレコードを取得
			getAllItemsfromDB().then(function(items){
				storedData = items;
				// 取得したレコードからカテゴリ一覧を作成し、プルダウンに追加
				var categoryOptionsHtml = makeCateOptionsHtml(storedData);
				$('#queryId').append(categoryOptionsHtml);
				getRandomItem();
			}, function(err){
				console.error(err);
			});
		}, function(err){
			console.error(err);
		});
	});

	/**
	 * カテゴリの選択が行われた際に呼び出される。
	 * 選択肢をランダムに取得し直す。
	 */
	$('#queryId').change(function(){
		getRandomItem();
	});

	/**
	 * 表示する件数の設定
	 */
	var fewAmount = 4;
	var normalAmount = 8;
	var manyAmount = 12;
	/**
	 * 件数が変更されたとき呼び出される。
	 * 件数を更新し、ランダムに取得し直す。
	 */
	$('#view_few').click(function(){
		setExtractAmount(fewAmount);
		getRandomItem();
	});

	$('#view_normal').click(function(){
		setExtractAmount(normalAmount);
		getRandomItem();
	});

	$('#view_many').click(function(){
		setExtractAmount(manyAmount);
		getRandomItem();
	});

	/**
	 * データ取得後、事前に設定した件数分ランダムに抽出し、
	 * 呼び出し元のhtml上に書き出す。
	 *
	 * データが少量の場合はajaxは必要ないが、総データ量が多くなった場合、
	 * extractByCate()に時間がかかる可能性があるため、ajaxによる処理が必要。
	 */
	var getRandomItem = function(){
		//decisionブロックのクリア
		if(decideAnimtion != null){
			clearInterval(decideAnimtion);
			decideAnimtion = null;
		}
		$('#decision').html("");
		//ボタンの初期設定
		$('#narrow').prop("disabled", true);
		$('#reset').prop("disabled", true);
		$('#clip').prop("disabled", true);
		$('#share').prop("disabled", true);
		$('#decide').prop("disabled", false);
		var queryData = {"tag" : $('#queryId').val()};
		$.ajax({
			type: "GET",
			success: function(){
				var categorisedData = extractByCate(storedData, queryData.tag);
				var extData = randomExtract(categorisedData);
				originalData = extData;
				var itemListHtml = makeItemListHtml(extData);
				$('#itemlist').html(itemListHtml);
				//各種イベント付与
				makeAccordion();
                extendLabel();
				makeIsChecked();
			},
			error: function(err){
                console.error(err);
			}
		});
	};

	/**
	* 絞り込み解除が押下された際に呼び出される。
	* 絞り込み前の状態に戻す。
	*/
	resetItem = function(){
		$('#reset').prop("disabled", true);
		$.ajax({
			type: "GET",
			success: function(){
				var itemListHtml = makeItemListHtml(originalData);
				$('#itemlist').html(itemListHtml);

				makeAccordion();
                extendLabel();
				makeIsChecked();
                
			},
			error: function(err){
                console.error(err);
			}
		});
	};

	/**
	* クリップが押下された際に呼び出される。
	* 決定された選択肢をクリップ
	*/
	clipItem = function(){
		clipName=$('#id').val();
		addClip(clipName);//database.jsのaddClipメソッド呼出し
	};

	/**
	* チェックによる絞り込みを行う。
	* チェックされた選択肢のみを残す。
	*/
	narrowItems = function(){
		$('#narrow').prop("disabled", true);
		$('#reset').prop("disabled", false);
		itemlist = $('[name="item"]');
		itemlist.each(function(){
			if($(this).prop("checked")){
				$(this).prop("checked", true);
			} else {
				$(this).parents('div[name="arrow"]').remove();
			}
		});
        
	};
	
	/**utilityに選択肢を連携*/
	shareItem = function(){
		shareText(choice)
	};
	
	/**アニメーション判定用の変数。
	*  アニメーション前 : decideAnimtion = null
	*  アニメーション中、後 : decideAnimtion > 0 
	*  getRandomItemが呼び出されるたびnullがセットされる。
	*/
	var decideAnimtion;

	/**
	* 最終決定を行う。
	* ランダムな抽選15回と決定後5回点滅。
	* 決定した選択肢はdecisionブロックにhiddenで記録。
	*/
	decideItem = function(){
		$('#decide').prop("disabled", true);
		$('#narrow').prop("disabled", true);
		$('#reset').prop("disabled", true);
		var itemlist = $(':checkbox[name="item"]:checked').parent('div[name="card"]');
		var i = 0;
		var count = 0;
		var hitCardNo = 0;
		//決定のアニメーション。15回目の抽選で決定。決定後5回点滅。
		decideAnimtion = setInterval(function(){
			// itemlist.get(index)が返す値はjQuery ObjectではなくDOM Elementであるため、$()を使用してjQuery Objectに変換する必要がある
			//背景色の戻し
			$(itemlist.get(hitCardNo)).animate({ backgroundColor: "#eeeeee", borderColor: "#0000ff" }, 100);
			hitCardNo = Math.floor(itemlist.length * Math.random());
			//背景色変更
			$(itemlist.get(hitCardNo)).animate({ backgroundColor: "#ffff77", borderColor: "#ffff77" }, 100);
			i++;
			if(i == 15){
				clearInterval(decideAnimtion);
				countId = setInterval(function(){
					$(itemlist.get(hitCardNo)).fadeOut(300, function(){$(this).fadeIn(300)});
					count++;
					if(count == 5){
						clearInterval(countId);
					}
				}, 1000);
				//お店の名前(title)を取得
				decision = "";
				choice = $(itemlist.get(hitCardNo)).children('div[name="name"]').text();

				decision += '<form id="addclip" action="/addclip" method="post" class="pure-form">';
				decision += '<input type="hidden" id="id" name="name" value="' + choice + '">';
				
				$('#decision').html(decision);
				$('#clip').prop("disabled", false);
				$('#share').prop("disabled", false);
			}
		}, 300)
	};

	/**
     * 詳細表示
     * makeAccordion自体は、clickに対しイベントリスナを付加するだけである点に注意
     */
	var makeAccordion = function(){
		$(function(){
			$('.accordion button[name="detail"]').click(function(){
				$(this).parents('div[name="card"]').next("ul").slideToggle();
				$(this).toggleClass("open");
			});
		});
	};
	
	 /**
     * ラベル領域の拡張。
     * カードのクリックでチェックボックスのつけはずしを行う。
     * ただし、カードの部品（チェックボックス、ラベル、詳細ボタン）がクリックされた場合は
     * この関数内でのチェックボックス状態の変更は行わない。
     */
	var extendLabel = function(){
		var part_flag = false;
		$('#itemlist').find('button[name="detail"]').click(function(){
			part_flag = true;
		});
		$('#itemlist').find('input[type="checkbox"]').click(function(){
			part_flag = true;
			makeIsChecked();
		});
		$('#itemlist').find('label').click(function(){
			part_flag = true;
			makeIsChecked();
		});
		
		$('#itemlist').find('div[name="card"]').click(function(){
			if(part_flag){
				part_flag = false;
				return;
			}
			var checkbox = $(this).children('input[type="checkbox"]');
			if(checkbox.is(':checked')){
				checkbox.prop('checked', false);
			}else{
				checkbox.prop('checked', true);
			}
			makeIsChecked();
		});
	}

	 /**
     * チェックボックスとボタンの連携
     * allItems : カードの総数
     * checkedItems : チェックされているカードの数
     */
	var makeIsChecked = function(){
		if(!decideAnimtion){
			var allItems = $('#itemlist').find('input[type="checkbox"]').length;
			var checkedItems = $('#itemlist').find('input[type="checkbox"]').filter(":checked").length;
			if(checkedItems <= 0){//チェック数=0：絞込、決定不可
				$('#narrow').prop("disabled", true);
				$('#decide').prop("disabled", true);
			}else if(checkedItems > 0 && checkedItems < allItems){//カード数>チェック数>0：絞込、決定可
				$('#narrow').prop("disabled", false);
				$('#decide').prop("disabled", false);
			}else if(checkedItems == allItems){//カード数=チェック数：絞込不可、決定可
				$('#narrow').prop("disabled", true);
				$('#decide').prop("disabled", false);
			}
		}
	};

	/**
	 * 受け取ったデータ及びデータ抽出件数に基づき、ランダムにデータを抽出する。
	 * データが件数以下の場合は全件出力する。この場合にはランダムな並び替えは実施しない。
	 * @param {String|Array} originalData 抽出対象となる元データ
	 * @param {number} extractAmount 抽出件数
	 * @return {String|Array} データから指定条件に基づいた抽出
	 */
	var randomExtract = function(originalData, extractAmount){
		if(typeof extractAmount === "undefined"){
			extractAmount = getExtractAmount();
		}
		var extractedData = new Array();
		var originalDataLength = originalData.length;

		if(originalDataLength <= extractAmount){
			extractedData = originalData; // 実データ数が抽出したい数以下のため抽出する必要がない

		} else {
			var extractNumberArray = new Array();
			for(var i = 0; i < extractAmount; i++){
				var candidateNumber = Math.round(Math.random() * (originalDataLength - 1));// Lengthと同じ値のインデックスだと配列の長さを超える
				if(extractNumberArray.indexOf(candidateNumber) != -1){
					i--;//今回の回をなかったことにしてもう一度やり直させる
				}else{
					extractNumberArray.push(candidateNumber); // 重複を防ぐ
					extractedData.push(originalData[candidateNumber]); // 抽出したデータを挿入
				}
			}
		}
		return extractedData;
	};

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
	var makeCateOptionsHtml = function(originalData){
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
	};

	/**
	 * 受け取ったデータからhtml上にリストを作成する
	 * @param {String|Array} extData 抽出済みのデータ
	 * @return {String} itemListを構成するタグ
	 */
	var makeItemListHtml = function(extData){
		var itemListHtml = "";
		if(extData.length > 0){
			itemListHtml += '<form name="itemlist" class="pure-form pure-form-aligned">';
			itemListHtml += '<div class="pure-g">';
			itemListHtml += '<span class="accordion">';

			for(var i = 0, n = extData.length; i < n; i++){
				var name = extData[i].name;
				var cate = extData[i].category;
				var desc = extData[i].description;

				itemListHtml += '<div name="arrow" class="pure-u-1">';
				itemListHtml += '<div name="card"><input type="checkbox" name="item" id="item' + i + '" checked="checked">';
				itemListHtml += '<div name="name" class="subject-decide"><label for="item' + i + '">' + name + '</label></div>';
				itemListHtml += '<div name="buttons"><button type="button" name="detail" class="pure-button"><img src="../img/accordion.png"></button></div></div>';
				itemListHtml += '<ul>';
				itemListHtml += '<li>[' + cate + ']</li>';
				itemListHtml += '<li>' + desc + '</li></ul></div>';
			}
			itemListHtml += '</span></div></div>';
			itemListHtml += "</form>";
		} else {
			itemListHtml = '<p name="itemlist">結果が見つかりませんでした。</p>';
		}
		return itemListHtml;
	};

	var extractAmount = 8;
	/**
	* 抽出件数をセットする
	* @param {String} cvalue 抽出件数としてセットしたい値 数値以外や1未満の場合は既定値でセットする
	*/
	var setExtractAmount = function(cvalue) {
		var defaultAmount = 8;
		var configValue = parseInt(cvalue);

		if (typeof configValue === 'number' && configValue > 0) {
			extractAmount = Math.ceil(configValue); // 小数点を受け取ってしまった場合の対処
		} else {
			extractAmount = defaultAmount;
		}
	}

	/**
	* 抽出件数をゲットする
	* @return {number} extractAmount セット済の抽出件数
	*/
	var getExtractAmount = function() {
		return extractAmount;
	}

})();
