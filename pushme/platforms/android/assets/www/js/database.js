// database.jsが読み込まれたページでは、常にこのdb変数を元に操作を行う
var db = null;
var version = 1;

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
    console.log("ObjectStore #items# created");
}

function addItemtoDB(cate, name, desc){
    var time = getTimeStamp();
    var newItem = { timeStamp: time, category: cate, name: name, description: desc };

    // Open a read/write db transaction, ready for adding the data
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");

    var deferred = new jQuery.Deferred();
 //   var promise = new Promise(function(resolve, reject){
        // add newItem to the objectStore
        console.log("NewItem {category: " + newItem.category + ", name: " + newItem.name + ", description: " + newItem.description + "}");
        var objectStoreRequet = store.add(newItem);

        objectStoreRequet.onsuccess = function(e){
            console.log("New item added to database");
            deferred.resolve();
        };
        objectStoreRequet.onerror = function(e){
            console.log("objectStoreRequest error: " + e.message);
            deferred.reject("objectStoreRequest error");
        };
 //   });
    return deferred.promise();
 //   return promise;
}

function updateItemtoDB(oldname, newcate, newname, newdesc){
    var time = getTimeStamp();
    var updateItem = { timeStamp: time, category: newcate, name: newname, description: newdesc };

    // Open a read/write db transaction, ready for adding the data
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");

    var deferred = new jQuery.Deferred();
 //   var promise = new Promise(function(resolve, reject){
        // 名前が一致するデータを取得する
        var range = IDBKeyRange.only(oldname);
        var index = store.index("name");
        index.openCursor(range).onsuccess = function(e){
            var cursorResult = e.target.result;
            if(cursorResult === null || cursorResult === undefined){
                console.log("item is not found");
            } else {
                updateItem = cursorResult.value;
                updateItem.category = newcate;
                updateItem.name = newname;
                updateItem.description = newdesc;
                console.log("updateItem.category: " + updateItem.category + ", updateItem.name: " + updateItem.name + ", updateItem.description: " + updateItem.description);

                var objectStoreRequest = store.put(updateItem);
                objectStoreRequest.onsuccess = function(e){
                    console.log("Update the item");
                    deferred.resolve();
                };
                objectStoreRequest.onerror = function(e){
                    console.log("objectStoreRequet error: " + e.message);
                    deferred.reject("objectStoreRequest error: " + e.message);
                };
            }
        };
        index.openCursor(range).onerror = function(e){
            console.log("cursorRequest error: " + e.message);
            deferred.reject("cursorRequest error: " + e.message);
        };
 //   });
    return deferred.promise();
 //   return promise;
}

function getAllItemsfromDB(){
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var allItems = [];
    
    var deferred = new jQuery.Deferred();
//    var promise = new Promise(function(resolve, reject){
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(e){
            var cursorResult = e.target.result;
            if(cursorResult === null || cursorResult === undefined){
                deferred.resolve(allItems);
            } else {
                console.log(cursorResult.value);
                allItems.push(cursorResult.value);
                cursorResult.continue();
            }
        };
        cursorRequest.onerror = function(e){
            console.log("cursorRequest error: " + e.message);
            deferred.reject("cursorRequest error: " + e.message);
        };
 //   });
    return deferred.promise();
//    return promise;
}

function getCategorizedItemsfromDB(query){
    var categorizedItems = [];

    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");

    var deferred = new jQuery.Deferred();
//    var promise = new Promise(function(resolve, reject){
        // カテゴリに一致するもののみをフィルターする
        var range = IDBKeyRange.only(query);
        var index = store.index("category");
        index.openCursor(range).onsuccess = function(e){
            var cursorResult = e.target.result;
            if(cursorResult === null || cursorResult === undefined){
                deferred.resolve(categorizedItems);
            } else {
                console.log(cursorResult.value);
                categorizedItems.push(cursorResult.value);
                cursorResult.continue();
            }
        };
        index.openCursor(range).onerror = function(e){
            console.log("cursorRequest error: " + e.message);
            deferred.reject("cursorRequest error: " + e.message);
        };
//    });
    return deferred.promise();
//    return promise;
}

function getUniqueItemfromDB(name){
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var item;

    var deferred = new jQuery.Deferred();
//    var promise = new Promise(function(resolve, reject){
        // 名前が一致するデータを取得する
        var range = IDBKeyRange.only(name);
        var index = store.index("name");
        index.openCursor(range).onsuccess = function(e){
            var cursorResult = e.target.result;
            if(cursorResult === null || cursorResult === undefined){
                console.log("name: " + name + " is not found");
            } else {
                item = cursorResult.value;
            }
            deferred.resolve(item);
        };
        index.openCursor(range).onerror = function(e){
            console.log("cursorRequest error: " + e.message);
            deferred.reject("cursorRequest error: " + e.message);
        };
//    });
    return deferred.promise();
//    return promise;
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
    console.log("timeStamp is:" + timeStamp);
    return timeStamp;
}

/**
 * データ一覧表示で削除ボタンをクリックされたアイテムをDBから削除
 * 1. DBに対象のアイテムがあるか検索
 * 2. Yesなら削除 (db.transaction.objectStore.delete()を使用)
 */
function delItemFromDB(){
	var name = delname; //regitemslist.htmlにあるグローバル変数
	var trans = db.transaction(["items"], "readwrite");
	var store = trans.objectStore("items");

    var deferred = new jQuery.Deferred();
//	var promise = new Promise(function(resolve, reject){
		var index = store.index("name");
		var keyRange = IDBKeyRange.only(name);
		index.openCursor(keyRange).onsuccess = function(e) {
			var result = e.target.result;
			if(result === null || result === undefined){
				console.log("name: " + name + " is not found");
			} else {
				console.log("result.value.name " + result.value.name);
			};
			var delReq = store.delete(result.value.timeStamp);
			delReq.onsuccess = function(){
				console.log("DELETE SUCCESS");
				deferred.resolve();
			};
			delReq.onerror = function(){
				console.log("DELETE FAILURE");
				deferred.reject();
			};
		};
		index.openCursor(keyRange).onerror = function(e){
			console.log("cursorRequest error: " + e.message);
			deferred.reject("cursorRequest error: " + e.message);
		};
//	});
    return deferred.promise();
//	return promise;
};
