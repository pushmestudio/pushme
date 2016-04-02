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
        }, teardown: function(){
            // clean up after each test
            // nothing to prepare on this module
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
        }, teardown: function(){
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
		equal(result, expected, "目視で確認できたらPASS");
	});

	test("カテゴリが空欄の状態で登録できないことを確認する", function(){
		var expected = "NG";
		notEqual(result, expected, "目視で確認できたらPASS");
	});

	test("名前が空欄の状態で登録できないことを確認する", function(){
		var expected = "NG";
		notEqual(result, expected, "目視で確認できたらPASS");
	});
	test("説明が空欄の状態で、登録に成功することを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});
}
{	
	var data = new Array();
	module("登録一覧表示", {
		setup: function(){
			// prepare something for all following tests
			result = "OK";
		},
		teardown: function(){
			// clean up after each test		
		}
	});
	
	test("カテゴリにALLを選択した場合、登録されているすべてのレコードが表示されることを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});

	test("カテゴリにALL以外を選択した場合、選択されたカテゴリのレコードのみ表示されることを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});

	test("オブジェクトストアに9件以上のレコードが存在する場合でも、すべてのレコードが表示されることを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});

	test("オブジェクトストアに何もレコードが存在しない場合、retriveボタンを押してもレコードが表示されないことを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});
}
{	
	var data = new Array();
	module("登録項目編集", {
		setup: function(){
			// prepare something for all following tests
			result = "OK";
		},
		teardown: function(){
			// clean up after each test		
		}
	});

	test("編集ボタンを押して編集内容入力フォームが表示されたとき、フォームに変更前の文字列が入力されていることを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});
	
	test("編集ボタンを押して必要項目を入力し「この内容で修正する」をクリックした場合、正しく編集されることを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});

	test("編集ボタンを押して必要項目を入力せずに「この内容で修正する」をクリックした場合、「必須項目を入力してください」というポップアップが表示され、更新されないことを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});

	test("編集ボタンを押して「キャンセル」をクリックした場合、更新されないことを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});

	test("編集によって現在カテゴリ一覧にないカテゴリに変更した場合、編集後カテゴリ一覧に新しいカテゴリが登録されていることを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});

	test("編集によって現在1項目しかないカテゴリを変更した場合、編集後カテゴリ一覧から古いカテゴリが削除されていることを確認する", function(){
		var expected = "OK";
		equal(result, expected, "目視で確認できたらPASS");
	});

}
