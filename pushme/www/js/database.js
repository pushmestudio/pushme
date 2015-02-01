// database.jsが読み込まれたページでは、常にこのdb変数を元に操作を行う
var db = null;
var version = 2;	//注意: Versionが変わると、既存の保存データなどはクリアされます

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
    console.log("NewItem {category: " + newItem.category + ", name: " + newItem.name + ", description: " + newItem.description + "}");
    var objectStoreRequet = store.add(newItem);

    objectStoreRequet.onsuccess = function(e){
        console.log("New item added to database");
        $('#addComplete').stop().fadeIn(1000).delay(5000).fadeOut(1000).css('color','#33CCFF');//#33CCFF(成功時), #FFABCE(未使用), #FF82B2(失敗時)
        deferred.resolve();
    };
    objectStoreRequet.onerror = function(e){
        console.log("objectStoreRequest error: " + e.message);
                $('#addFailCuzAlreadyExists').stop().fadeIn(1000).delay(5000).fadeOut(1000).css('color','#FF82B2');//#33CCFF(成功時), #FFABCE(未使用), #FF82B2(失敗時)
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
                			$('#editComplete').stop().fadeIn(1000).delay(5000).fadeOut(1000).css('color','#33CCFF');//編集成功時の通知//#33CCFF(成功時), #FFABCE(未使用), #FF82B2(失敗時)
                deferred.resolve();
            };
            objectStoreRequest.onerror = function(e){
                console.log("objectStoreRequet error: " + e.message);
                $('#editFail').stop().fadeIn(1000).delay(5000).fadeOut(1000).css('color','#FF82B2');//#33CCFF(成功時), #FFABCE(未使用), #FF82B2(失敗時)
                deferred.reject("objectStoreRequest error: " + e.message);
            };
        }
    };
    index.openCursor(range).onerror = function(e){
        console.log("cursorRequest error: " + e.message);
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
            console.log(cursorResult.value);
            allItems.push(cursorResult.value);
            cursorResult.continue();
        }
    };
    cursorRequest.onerror = function(e){
        console.log("cursorRequest error: " + e.message);
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
            console.log(cursorResult.value);
            categorizedItems.push(cursorResult.value);
            cursorResult.continue();
        }
    };
    index.openCursor(range).onerror = function(e){
        console.log("cursorRequest error: " + e.message);
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
	console.log("delname in database.js: " + name);
	var trans = db.transaction(["items"], "readwrite");
	var store = trans.objectStore("items");

    var deferred = new jQuery.Deferred();
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
			$('#deleteComplete').stop().fadeIn(1000).delay(5000).fadeOut(1000).css('color','#33CCFF');//編集成功時の通知//#33CCFF(成功時), #FFABCE(未使用), #FF82B2(失敗時)
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
    return deferred.promise();
};

/**
 * クリップを保存するメソッド
 * 選択時の最終決定時に「クリップする」ボタン押下で呼ばれる
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
			if(result === null || result === undefined){
				console.log("name: " + name + " is not found");
			} else {
				console.log("result.value.name " + result.value.name);
			};
				updateItem = result.value;
                updateItem.category = result.value.category;
                updateItem.name = result.value.name;
                updateItem.description = result.value.description;
                updateItem.clip = "true";
                console.log("updateItem.category: " + updateItem.category + ", updateItem.name: " + updateItem.name + ", updateItem.description: " + updateItem.description + "clip : " + updateItem.clip);
			
			var clipFlagTrue = store.put(updateItem);
			clipFlagTrue.onsuccess = function(){
				console.log("CLIP ADD SUCCESS");
				alert("クリップ追加しました");
				//resolve();
			};
			clipFlagTrue.onerror = function(){
				console.log("CLIP ADD FAILURE");
				alert("クリップ追加できませんでした");
				//reject();
			};
		};
		index.openCursor(keyRange).onerror = function(e){
			console.log("cursorRequest error: " + e.message);
			//reject("cursorRequest error: " + e.message);
		};	
}

/**
 * クリップ一覧を表示する際に、clip属性がtrueのデータのみ抽出するメソッド
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
				console.log("result.value.name " + result.value.name);
				console.log(result.value);
            	allClippedItems.push(result.value);
            	result.continue();
			}
		};
		req.onerror = function(e){
			console.log("clipReq error: " + e.message);
			reject("clipReq error: " + e.message);
		};
	});
	return promise;
}

/**
 * クリップ一覧で、「UnClipボタン」押下時にDBのclip属性をfalseに変更するメソッド
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
			if(result === null || result === undefined){
				console.log("name: " + name + " is not found");
			} else {
				console.log("result.value.name " + result.value.name);
			};
				updateItem = result.value;
                updateItem.category = result.value.category;
                updateItem.name = result.value.name;
                updateItem.description = result.value.description;
                updateItem.clip = "false";
                console.log("updateItem.category: " + updateItem.category + ", updateItem.name: " + updateItem.name + ", updateItem.description: " + updateItem.description + "clip : " + updateItem.clip);
			
			var clipFlagFalse = store.put(updateItem);
			clipFlagFalse.onsuccess = function(){
				console.log("CLIP Changed to FALSE is SUCCESS");
				alert("クリップを削除しました");
				console.dir("offClip時のstoredData: "+storedData.value);
				//resolve();
			};
			clipFlagFalse.onerror = function(){
				console.log("CLIP Changed to FALSE is FAILURE");
				alert("クリップを削除できませんでした");
				//reject();
			};
		};
		index.openCursor(keyRange).onerror = function(e){
			console.log("cursorRequest error: " + e.message);
			//reject("cursorRequest error: " + e.message);
		};	
}