/**
 * @fileOverview データを取得して必要な件数を抽出し、HTML出力します。
 */

decideAjax = (function(){
	var storedData; // データの取得を一度に抑えるために共通で使う
	var first8Data; //絞り込み前の状態を保存

	/**
	* decideAjax.jsが読み込まれる際に呼び出される。
	* データ取得後、事前に設定した件数分ランダムに抽出し、
	* 呼び出し元のhtml上に書き出す。
	*
	* 又、このjsの読み込みの初回のみカテゴリの一覧を読み込む。
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
				console.dir(storedData);
			}, function(err){
				console.error(err);
			});
		}, function(err){
			console.error(err);
		});
	});

	/**
	 * カテゴリの選択が行われた際に呼び出される。
	 */
	$('#queryId').change(function(){
		getRandomItem();
	});

	/**
	 * retrieveが押下された際に呼び出される。
	 * @deprecated
	 */
	$('#submitId').click(function(){
		getRandomItem();
	});

  var fewAmount = 4;
	var normalAmount = 8;
	var manyAmount = 12;
	/**
	 * 件数が変更されたとき呼び出される
	 */
	$('#view_few').click(function(){
		setExtractAmount(fewAmount);
		getRandomItem()
	});

	$('#view_normal').click(function(){
		setExtractAmount(normalAmount);
		getRandomItem()
	});

	$('#view_many').click(function(){
		setExtractAmount(manyAmount);
		getRandomItem()
	});


	/**
	 * データ取得後、事前に設定した件数分ランダムに抽出し、
	 * 呼び出し元のhtml上に書き出す。
	 *
	 * データが少量の場合はajaxは必要ないが、総データ量が多くなった場合、
	 * extractByCate()に時間がかかる可能性があるため、ajaxによる処理が必要。
	 */
	var getRandomItem = function(){
		$('#decision').html("");
		var queryData = {"tag" : $('#queryId').val()};
		console.log(queryData);
		$.ajax({
			type: "GET",
			success: function(){
				var categorisedData = extractByCate(storedData, queryData.tag);
				var extData = randomExtract(categorisedData);
				first8Data = extData;
				var itemListHtml = makeItemListHtml(extData);
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
	* 絞り込み解除が押下された際に呼び出される。
	*/
	resetItem = function(){
		$.ajax({
			type: "GET",
			success: function(){
				var itemListHtml = makeItemListHtml(first8Data);
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

	clipItem = function(choice){
		clipName=choice;
		console.log("clipName : " +clipName);
		addClip(clipName);//database.jsのaddClipメソッド呼出し
		
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
	};

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

	/*
	decideItem = function(){
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

	var animation_flag = false;
	decideItem = function(){
		animation_flag = true;
		$('#decide').prop("disabled", true);
		$('#narrow').prop("disabled", true);
		$('#reset').prop("disabled", true);
		//$('#decide').prop("disabled", true);
		if($('#reset')){ $('#reset').prop("disabled", true);}
		var itemlist = $(':checkbox[name="item"]:checked').parent('div[name="card"]');
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
				choice = $(itemlist.get(random)).children('div[name="name"]').text();
				console.log(choice);
				/*
				decision += '<form action="/addclip" method="post" class="pure-form">';
				decision += '<input type="hidden" id="id" name="name" value="' + choice + '">';
				decision += '<input type="submit" id="clip" value="クリップする" class="pure-button pure-button-success">';
				decision += '</form><p><button class="pure-button" onClick=shareText("'+ choice + '")>共有する</button></p>';*/
				decision += '<p><button id="clip" class="pure-button pure-button-success" onClick=clipItem("'+choice+'")>クリップする</button></p>';
				decision += '</form><p><button class="pure-button" onClick=shareText("'+ choice + '")>共有する</button></p>';
				$('#decision').html(decision);
				$('#clip').prop("disabled", false);
				$('#share').prop("disabled", false);
				animation_flag = false;
			}
		}, 300)
	};

	//詳細表示
	var makeAccordion = function(){
		$(function(){
			$('.accordion input[name="detail"]').click(function(){
				$(this).parents('div[name="card"]').next("ul").slideToggle();
				$(this).toggleClass("open");
			});
		});
	};
	
	var extendLabel = function(){
		var ispart = false;
		$('#itemlist').find('input[name="detail"]').click(function(){
			ispart = true;
		});
		$('#itemlist').find('input[type="checkbox"]').click(function(){
			ispart = true;
			makeIsChecked();
		});
		$('#itemlist').find('label').click(function(){
			ispart = true;
			makeIsChecked();
		});
		
		$('#itemlist').find('div[name="card"]').click(function(){
			if(ispart){
				ispart = false;
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

	var makeIsChecked = function(){
		if(!animation_flag){
			var allitemlength = $('#itemlist').find('input[type="checkbox"]').length;
			var itemlength = $('#itemlist').find('input[type="checkbox"]').filter(":checked").length;
			if(itemlength <= 0){
				$('#narrow').prop("disabled", true);
				$('#decide').prop("disabled", true);
			}else if(itemlength > 0 && itemlength < allitemlength){
				$('#narrow').prop("disabled", false);
				$('#decide').prop("disabled", false);
			}else if(itemlength == allitemlength){
				$('#narrow').prop("disabled", true);
				$('#decide').prop("disabled", false);
			}
			if($('#decision').children().length > 0){
				$('#decide').prop("disabled", true);
				$('#narrow').prop("disabled", true);
				$('#reset').prop("disabled", true);
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
			extractAmount = getExtractAmount(); // Cookieにセットしてある抽出件数を用いている
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
	var makeCateOptionsHtml = function(originalData){
		var cateArray = new Array();
		var cateOption = '<option value="">ALL</option>';;
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
			itemListHtml += '<p><form name="itemlist" class="pure-form pure-form-aligned">';
			itemListHtml += '<div class="pure-g">';
			itemListHtml += '<span class="accordion">';

			for(var i = 0, n = extData.length; i < n; i++){
				var name = extData[i].name;
				var cate = extData[i].category;
				var desc = extData[i].description;

				itemListHtml += '<div name="arrow" class="pure-u-1">';
				itemListHtml += '<div name="card"><input type="checkbox" name="item" id="item' + i + '" checked="checked">';
				itemListHtml += '<div name="name"><label for="item' + i + '">' + name + '</label></div>';
				itemListHtml += '<div name="buttons"><input type="button" name="detail" value="詳細"></div></div>';
				itemListHtml += '<ul>';
				itemListHtml += '<li>カテゴリ:' + cate + '</li>';
				itemListHtml += '<li>コメント:' + desc + '</li></ul></div>';
			}
			itemListHtml += '</span></div></div>';
			itemListHtml += '<input type="button" id="narrow" disabled="disabled" value="絞り込む" onclick="narrowItems()" class="pure-button pure-button-small">';
			itemListHtml += '<input type="button" id="reset" disabled="disabled" value="絞り込み解除" onclick="resetItem()" class="pure-button pure-button-small">';
			itemListHtml += '<input type="button" id="decide" value="最終決定" onclick="decideItem()" class="pure-button pure-button-small">';
			itemListHtml += "</form></p>";
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