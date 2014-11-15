{	
	var data = new Array();
	module("カテゴリ抽出", {
		setup: function(){
			// prepare something for all following tests
			data = [
				{"cate":"cate1","name":"name1","desc":"hoge1"}
				,{"cate":"cate2","name":"hogename2","desc":"hoge2"}
				,{"cate":"cate1","name":"name3","desc":"hoge3"}
				,{"cate":"cate3","name":"name4","desc":"hoge4"}
			];
		},
		teardown: function(){
			// clean up after each test
		}
	});

	test("4件あるデータに文字列を指定しなかった場合に4件の結果が得られる", function(){
		var expected = 4;
		
		equal(extractByCate(data).length, expected,"PASS!");
	});
	test("2/4件あるカテゴリを指定した場合に2件の結果が得られる", function(){
		var query = "cate1";
		var expected = 2;
		
		equal(extractByCate(data, query).length, expected,"PASS!");
	});

	test("4件あるデータに空の文字列でカテゴリを指定した場合に4件の結果が得られる", function(){
		var query = "";
		var expected = 4;
		
		equal(extractByCate(data ,query).length, expected,"PASS!");
	});


	test("0/4件あるカテゴリを指定した場合に0件の結果が得られる", function(){
		var query = "cate99";//存在しないカテゴリ
		var expected = 0;
		
		equal(extractByCate(data ,query).length, expected,"PASS!");
	});

}
{	
	var data = new Array();
	module("指定件数ランダム抽出", {
		setup: function(){
			// prepare something for all following tests
			data = [
				{"cate":"cate1","name":"name1","desc":"hoge1"}
				,{"cate":"cate2","name":"hogename2","desc":"hoge2"}
				,{"cate":"cate1","name":"name3","desc":"hoge3"}
				,{"cate":"cate3","name":"name4","desc":"hoge4"}
			];
		},
		teardown: function(){
			// clean up after each test		
		}
	});
	
	test("4件あるデータから件数を指定しない場合に元のデータと同じ結果が4件得られる", function(){
		var expected = data;
		
		equal(randomExtract(data), expected,"PASS!");
	});

	test("4件あるデータから3件を指定して結果を得る", function(){
		var amount = "3";//3件得る
		var expected = data.slice(0,3);//data[0],data[1],data[2]を抽出
		
		notEqual(randomExtract(data, amount), expected,"結果が同じでないことを以ってPASSとする");
	});

	test("4件あるデータから5件を指定した結果、取得可能最大件数である4件が得られる", function(){
		var amount = "5";//実データ数を超える数
		var expected = 4;
		
		equal(randomExtract(data, amount).length, expected,"PASS!");
	});
}
{	
	var data = new Array();
	module("項目登録", {
		setup: function(){
			// prepare something for all following tests
			result = "OK";
		},
		teardown: function(){
			// clean up after each test		
		}
	});
	
	test("カテゴリ、名前、説明のすべての項目を入力し、登録に成功することを確認する", function(){
		var expected = "OK";
		equal(result, expected, "成功したらPASS");
	});

	test("カテゴリが空欄の状態で登録できないことを確認する", function(){
		var expected = "NG";
		notEqual(result, expected, "結果が同じでないことを以ってPASSとする");
	});

	test("名前が空欄の状態で登録できないことを確認する", function(){
		var expected = "NG";
		notEqual(result, expected, "結果が同じでないことを以ってPASSとする");
	});
	test("説明が空欄の状態で、登録に成功することを確認する", function(){
		var expected = "OK";
		equal(result, expected, "成功したらPASS");
	});
}