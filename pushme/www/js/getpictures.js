// $();はreadyイベントを意味する
// readyイベントはwebページの構成(DOM)が読み込まれた時点で着火される
// 一方、javascriptのonload()関数は画像などの読み込みも含めて完了した時点で着火される
// readyイベントは、htmlのタグを操作する処理については使用するべきだが、そうでないものには使用する必要はない
$(
		// readyイベントの中では、大抵関数は無名関数が使用される
		function(){
		// $("セレクタ")は、jQueryオブジェクトの記述
		// $("#id名")で指定したidをもつオブジェクトの記述になる
		// $("html要素")で任意のhtml要素のオブジェクト記述になる
		// オブジェクトのメソッドを使用する場合は、$("セレクタ").メソッド()
		for(i = 0; i < 4; i++){
//				$("#loading").html('<img src="/images/loading.gif" />');
				$("#item" + i).html('<img src="/images/loading.gif" />');
		}
		// イベントの構文は $("セレクタ").イベント名(イベント発生時に実行する関数)
		// thisはイベントで設定したfunction内で利用すると、イベントが発生した要素を指す

		$.ajax({
//			url: "/test-get-item",
				url: "get-items",
				type: "GET",
				// successで、正常に通信が行えた場合の処理を指定する
				success: function(data){
						// もともとJSONで来てるからパースしたら怒られたってことでいいのか…
//					var sampledata = JSON.parse(data);
						/* test-get-item用
						var imageurl = data.imageurl;
						$("#loading").html("<img src='" + imageurl + "' />");
					  */
						for(i = 0; i < 4; i++){
								$("#item" + i).html("<p>title: " + data[i].title + "</p>");
						}
				},
				error: function(data){
						alert("error occurred");
				}
		});
}
);
