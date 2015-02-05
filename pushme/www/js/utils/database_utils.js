/**
 * @fileOverview 
 * @copyright PushMe Studio 2015
 */

// database.jsが読み込まれたページでは、常にこのdb変数を元に操作を行う
var db = null;
var version = 3;	//注意: Versionが変わると、既存の保存データなどはクリアされます

function openDB(){
    var deferred = new jQuery.Deferred();
    // Open DB
    var request = indexedDB.open("pushmeDB", version);
    request.onupgradeneeded = initDB;
    request.onerror = function(e){
        console.log("open error:", e);
        deferred.reject("open error");
    };
    request.onsuccess = function(e){
        console.log("open success:")
        db = e.target.result;
        deferred.resolve();
    };
    return deferred.promise();
}

/**
 * upgradeneededイベントの発生時に呼び出され、DBの初期化を行う。
 * DBの作成とオブジェクトストアの作成、インデックスの作成を行う。
 * @param {e} データベースのオープン要求に対する結果のイベント
 */
function initDB(e){
    db = e.target.result;
    if(db.objectStoreNames.contains("items")){
        db.deleteObjectStore("items");
    } 
    // Create Object Store
    // keyPath is the property which makes each Object in the store unique
    var store = db.createObjectStore("items", { keyPath: "timeStamp"});
    // define what data the objectStore will contain
    store.createIndex("category", "category", { unique: false});
    store.createIndex("name", "name", { unique: true});
    store.createIndex("description", "description", { unique: false});
    store.createIndex("clip","clip", {unique:false});

    // サンプルデータ作成
    var samples = [
        {timeStamp: "00000000000001", category: "Sample-Action", name: "Do now!", description: "I do it now!", clip: "false"},
        {timeStamp: "00000000000002", category: "Sample-Action", name: "Do later...", description: "I'll do it later...", clip: "false"},
        {timeStamp: "00000000000003", category: "Sample-Dinner", name: "Japanese", description: "I feel like eating Japanese food.", clip: "false"},
        {timeStamp: "00000000000004", category: "Sample-Dinner", name: "Italian", description: "I feel like eating Italian food.", clip: "false"},
        {timeStamp: "00000000000005", category: "Sample-Dinner", name: "French", description: "I feel like eating French food.", clip: "false"},
        {timeStamp: "00000000000006", category: "Sample-Dinner", name: "Chinese", description: "I feel like eating Chinese food.", clip: "false"},

    ];
    for(var i = 0; i < samples.length; i++){
        store.add(samples[i]);
    }
    console.log("ObjectStore #items# created");
}

function addItemtoDB(cate, name, desc){
    var time = getTimeStamp();
    var newItem = { timeStamp: time, category: cate, name: name, description: desc, clip: "false" };
    // Open a read/write db transaction, ready for adding the data
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var deferred = new jQuery.Deferred();
    // add newItem to the objectStore
    var objectStoreRequet = store.add(newItem);
    objectStoreRequet.onsuccess = function(e){
        $('#addComplete').stop().fadeIn(500).delay(2000).fadeOut(500);
        deferred.resolve();
    };
    objectStoreRequet.onerror = function(e){
                $('#addFailCuzAlreadyExists').stop().fadeIn(500).delay(2000).fadeOut(500);
        deferred.reject("objectStoreRequest error");
    };
    return deferred.promise();
}

function updateItemtoDB(oldname, newcate, newname, newdesc){
    var time = getTimeStamp();
    var updateItem = { timeStamp: time, category: newcate, name: newname, description: newdesc };
    // Open a read/write db transaction, ready for adding the data
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var deferred = new jQuery.Deferred();
    // 名前が一致するデータを取得する
    var range = IDBKeyRange.only(oldname);
    var index = store.index("name");
    index.openCursor(range).onsuccess = function(e){
        var cursorResult = e.target.result;
        if(cursorResult === null || cursorResult === undefined){
        } else {
            updateItem = cursorResult.value;
            updateItem.category = newcate;
            updateItem.name = newname;
            updateItem.description = newdesc;
            var objectStoreRequest = store.put(updateItem);
            objectStoreRequest.onsuccess = function(e){
                $('#editComplete').stop().fadeIn(500).delay(2000).fadeOut(500);
                deferred.resolve();
            };
            objectStoreRequest.onerror = function(e){
                $('#editFail').stop().fadeIn(500).delay(2000).fadeOut(500);
                deferred.reject("objectStoreRequest error: " + e.message);
            };
        }
    };
    index.openCursor(range).onerror = function(e){
        deferred.reject("cursorRequest error: " + e.message);
    };
    return deferred.promise();
}

function getAllItemsfromDB(){
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var allItems = [];
    var deferred = new jQuery.Deferred();
    var cursorRequest = store.openCursor();
    cursorRequest.onsuccess = function(e){
        var cursorResult = e.target.result;
        if(cursorResult === null || cursorResult === undefined){
            deferred.resolve(allItems);
        } else {
            allItems.push(cursorResult.value);
            cursorResult.continue();
        }
    };
    cursorRequest.onerror = function(e){
        deferred.reject("cursorRequest error: " + e.message);
    };
    return deferred.promise();
}

function getCategorizedItemsfromDB(query){
    var categorizedItems = [];
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var deferred = new jQuery.Deferred();
    // カテゴリに一致するもののみをフィルターする
    var range = IDBKeyRange.only(query);
    var index = store.index("category");
    index.openCursor(range).onsuccess = function(e){
        var cursorResult = e.target.result;
        if(cursorResult === null || cursorResult === undefined){
            deferred.resolve(categorizedItems);
        } else {
            categorizedItems.push(cursorResult.value);
            cursorResult.continue();
        }
    };
    index.openCursor(range).onerror = function(e){
        deferred.reject("cursorRequest error: " + e.message);
    };
    return deferred.promise();
}

function getUniqueItemfromDB(name){
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var item;
    var deferred = new jQuery.Deferred();
    // 名前が一致するデータを取得する
    var range = IDBKeyRange.only(name);
    var index = store.index("name");
    index.openCursor(range).onsuccess = function(e){
        var cursorResult = e.target.result;
        if(cursorResult === null || cursorResult === undefined){
        } else {
            item = cursorResult.value;
        }
        deferred.resolve(item);
    };
    index.openCursor(range).onerror = function(e){
        deferred.reject("cursorRequest error: " + e.message);
    };
    return deferred.promise();
}

function getTimeStamp(){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours();
    var min = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
    var sec = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();
    var timeStamp = "" + year + month + day + hour + min +sec;
    return timeStamp;
}

/**
 * DBからアイテムを削除するメソッド：
 * itemlist.jsから呼ばれ、delname(=登録データ一覧画面の削除ボタンが押下されたアイテム名)のアイテムをDBから削除する
 */
function delItemFromDB(){
	var name = delname; //itemlist.jsで定義されているグローバル変数
	var trans = db.transaction(["items"], "readwrite");
	var store = trans.objectStore("items");
    var deferred = new jQuery.Deferred();
	var index = store.index("name");
	var keyRange = IDBKeyRange.only(name);
	index.openCursor(keyRange).onsuccess = function(e) {
		var result = e.target.result;
		if(result === null || result === undefined){
		} else {}
		var delReq = store.delete(result.value.timeStamp);
		delReq.onsuccess = function(){
			$('#deleteComplete').stop().fadeIn(500).delay(2000).fadeOut(500);
			deferred.resolve();
		};
		delReq.onerror = function(){
			deferred.reject();
		};
	};
	index.openCursor(keyRange).onerror = function(e){
		deferred.reject("cursorRequest error: " + e.message);
	};
    return deferred.promise();
};

/**
 * クリップを保存するメソッド (DBのclip属性をtrueに変更する)
 * 1. 選択時の最終決定時にクリップボタン押下で呼ばれる
 * 2. 登録データ一覧画面でクリップされていない状態(=☆)の時に、クリップボタン押下で呼ばれる
 */
function addClip(clipName){
	var name = clipName; //regitemslist.htmlにあるグローバル変数
	var trans = db.transaction(["items"], "readwrite");
	var store = trans.objectStore("items");
	var index = store.index("name");
	var keyRange = IDBKeyRange.only(name);
	var updateItem = { timeStamp: "", category: "", name: "", description: "", clip: ""};	
	index.openCursor(keyRange).onsuccess = function(e) {
		var result = e.target.result;
		if(result === null || result === undefined){} else {};
		updateItem = result.value;
        updateItem.category = result.value.category;
        updateItem.name = result.value.name;
        updateItem.description = result.value.description;
        updateItem.clip = "true";			
		var clipFlagTrue = store.put(updateItem);
		clipFlagTrue.onsuccess = function(){
			$('#clipComplete').stop().fadeIn(500).delay(2000).fadeOut(500);
		};
		clipFlagTrue.onerror = function(){};
	};
	index.openCursor(keyRange).onerror = function(e){};	
}

/**
 * 【未使用メソッド】
 * クリップ一覧を表示する際に、clip属性がtrueのデータのみ抽出するメソッド
 * クリップフィルタリングで利用可能なので、このまま置いておく。
 */
function getClippedItemsfromDB(){
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var clipFlag = "true";
    var keyRange = IDBKeyRange.only(clipFlag);
    var promise = new Promise(function(resolve, reject){
    	var req = store.index("clip").openCursor(keyRange);
    	var allClippedItems = [];
    	req.onsuccess = function(e) {    		
			var result = e.target.result;
    		if(result === null || result === undefined){
				resolve(allClippedItems);
			} else {
            	allClippedItems.push(result.value);
            	result.continue();
			}
		};
		req.onerror = function(e){
			reject("clipReq error: " + e.message);
		};
	});
	return promise;
}

/**
 * クリップを削除するメソッド (DBのclip属性をfalseに変更する)
 * 登録データ一覧画面でクリップされている状態(=★)の時に、クリップボタン押下で呼ばれる
 */
function offClipfromDB(offClipName){
	var name = offClipName;
	var trans = db.transaction(["items"], "readwrite");
	var store = trans.objectStore("items");
	var index = store.index("name");
	var keyRange = IDBKeyRange.only(name);
	var updateItem = { timeStamp: "", category: "", name: "", description: "", clip: ""};
	index.openCursor(keyRange).onsuccess = function(e) {
		var result = e.target.result;
		if(result === null || result === undefined){} else {};
		updateItem = result.value;
        updateItem.category = result.value.category;
        updateItem.name = result.value.name;
        updateItem.description = result.value.description;
        updateItem.clip = "false";
  		var clipFlagFalse = store.put(updateItem);
		clipFlagFalse.onsuccess = function(){
			$('#unclipComplete').stop().fadeIn(500).delay(2000).fadeOut(500);
		};
		clipFlagFalse.onerror = function(){};
	};
	index.openCursor(keyRange).onerror = function(e){};	
}