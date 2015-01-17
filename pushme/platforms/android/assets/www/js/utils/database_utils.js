// database.jsが読み込まれたページでは、常にこのdb変数を元に操作を行う
var db = null;
var version = 1;

function openDB(){
    var promise = new Promise(function(resolve, reject){
        // Open DB
        var request = indexedDB.open("pushmeDB", version);
        request.onupgradeneeded = initDB;
        request.onerror = function(e){
            console.log("open error:", e);
            reject("open error:" + e.value);
        };
        request.onsuccess = function(e){
            console.log("open success:")
            db = e.target.result;
            resolve();
        };
    });
    return promise;
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

    var promise = new Promise(function(resolve, reject){
        // add newItem to the objectStore
        console.log("NewItem {category: " + newItem.category + ", name: " + newItem.name + ", description: " + newItem.description + "}");
        var objectStoreRequet = store.add(newItem);

        objectStoreRequet.onsuccess = function(e){
            console.log("New item added to database");
            resolve();
        };
        objectStoreRequet.onerror = function(e){
            console.log("objectStoreRequet error: " + e.message);
            reject();
        };
    });
    return promise;
}

function getAllItemsfromDB(){
    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");
    var allItems = [];
    
    var promise = new Promise(function(resolve, reject){
        var cursorRequest = store.openCursor();
        cursorRequest.onsuccess = function(e){
            var cursorResult = e.target.result;
            if(cursorResult === null || cursorResult === undefined){
                resolve(allItems);
            } else {
                console.log(cursorResult.value);
                allItems.push(cursorResult.value);
                cursorResult.continue();
            }
        };
        cursorRequest.onerror = function(e){
            console.log("cusorRequest error: " + e.message);
            reject("cusorRequest error: " + e.message);
        };
    });
    return promise;
}

function getCategorizedItemsfromDB(query){
    var categorizedItems = [];

    var trans = db.transaction(["items"], "readwrite");
    var store = trans.objectStore("items");

    var promise = new Promise(function(resolve, reject){
        // カテゴリに一致するもののみをフィルターする
        var range = IDBKeyRange.only(query);
        var index = store.index("category");
        index.openCursor(range).onsuccess = function(e){
            var cursorResult = e.target.result;
            if(cursorResult === null || cursorResult === undefined){
                resolve(categorizedItems);
            } else {
                console.log(cursorResult.value);
                categorizedItems.push(cursorResult.value);
                cursorResult.continue();
            }
        };
        index.openCursor(range).onerror = function(e){
            console.log("cusorRequest error: " + e.message);
            reject("cusorRequest error: " + e.message);
        };
    });
    return promise;
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