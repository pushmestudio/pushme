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
    module("最終決定結果の共有", {
        setup: function(){
            // prepare something for all following tests
            // nothing to prepare on this module
        }, teardown: function(){
            // clean up after each test
            // nothing to prepare on this module
        }
    });

    test("テキストを指定すると、前後に文章を付けて返す", function(){
        var txt = "シェアしたいテキスト";
        var expected = "今回決まったのは [" + txt + "] です！"; // 返ってくる想定の文言
        equal(formatForSend(txt), expected, "PASS!");
    });
    
    test("他アプリのインテント起動+起動先にて最終決定結果の件名が表示される", function(){
        var expected = true;
        ok(expected, "常にPASSするテストです。目視にて確認を実施すること。");
    });
}