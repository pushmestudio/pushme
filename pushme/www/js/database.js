/**
 * upgradeneededイベントの発生時に呼び出され、DBの初期化を行う。
 * DBの作成とオブジェクトストアの作成、インデックスの作成を行う。
 * @param {e} データベースのオープン要求に対する結果のイベント
 */
function onCreateDB(e){
    var db = e.target.result;
    if(db.objectStoreNames.contains("items")){
        console.log("ObjectStore items already exists");
    } else {
        // Create Object Store
        // keyPath is the property which makes each Object in the store unique
        var store = db.createObjectStore("items", { keyPath: "timeStamp"});
        // define what data the objectStore will contain
        store.createIndex("category", "category", { unique: false});
        store.createIndex("name", "name", { unique: true});
        store.createIndex("description", "description", { unique: false});
        console.log("ObjectStore items created");
    }
}

function addItemPrev(){
    var request = indexedDB.open("pushmeDB", 1);
    request.onerror = function(e){
        console.log("open error:", e);
    };
    request.onsuccess = function(e){
        console.log("open success");
        addItem(e);
    }
}

function addItem(e){
    // Make new data
    var cate = $('#category').val();
    var name = $('#name').val();
    var desc = $('#description').val();
    var time = getTimeStamp();
    var newItem = { timeStamp: time, category: cate, name: name, description: desc };

    var db = e.target.result;
    // Open a read/write db transaction, ready for adding the data
    var transaction = db.transaction(["items"], "readwrite");

    // Report on the success of opening the transaction
    transaction.oncomplete = function(e){
        $('#regComplete').dialog("open");
        console.log("Transaction completed: database modification finished");
    };
    // Report on the error of opening the transaction
    transaction.onerror = function(e){
        console.log("Transaction failed: " + e.message);
    };

    var store = transaction.objectStore("items");
    console.log("newItem :" + newItem);
    // add newItem to the objectStore
    var objectStoreRequet = store.add(newItem);

    objectStoreRequet.onsuccess = function(e){
        console.log("New item added to database");
    };
}

function getAllItemsPrev(){
    var request = indexedDB.open("pushmeDB", 1);
    request.onerror = function(e){
        console.log("open error:", e);
    };
    request.onsuccess = function(e){
        console.log("open success");
        getAllItems(e);
    }
}

function getAllItems(e){
    var db = e.target.result;
    var transaction = db.transaction(["items"], "readwrite");
    var store = transaction.objectStore("items");
    // Show items list for debugging
    var cursorRequest = store.openCursor();
    cursorRequest.onsuccess = function(e){
        var cursorResult = e.target.result;
        if(cursorResult){
            console.log(cursorResult.value);
            cursorResult.continue();
        } else {
        }
    }
    cursorRequest.onerror = function(e){
        console.log("cusorRequest error: " + e.message);
    }
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
/*
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        // Create DB
        var db = window.sqlitePlugin.openDatabase({name: "pushme.db"});

        db.transaction(function(tx){
            // Create table
            tx.executeSql('CREATE TABLE IF NOT EXISTS registered_items (cate: text, name: text, desc: text)');
            // Show table items for Debug
            db.executeSql("pragma table_info (registered_items);", [], function(res){
                console.log("pragma here");
                console.log("PRAGMA res: " + JSON.stringify(res));
            });
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
*/