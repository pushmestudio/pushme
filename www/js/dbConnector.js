/**
 * @file mainApp.dbConnectorというモジュールの定義。
 * DB関連のCRUD処理などを提供する。
 * @copyright (c) 2016 PushMe Studio
 */
angular.module('mainApp.dbConnector', [])

/**
 * @module DBConn
 * @description DB接続に関連する内容全てを定義
 * @requires d
 */
.factory('DBConn', function(d) {
  var module = this;

  // このモジュールを通じて使いまわすデータベースのオブジェクト
  module.db = null;

  // バージョン情報、データベースの初期化の必要性の有無の判断に使う
  module.version = 1;

  // 非同期処理のために使う、q.defer()のようにして呼び出す
  var $injector = angular.injector(['ng']);
  module.q = $injector.get('$q');

  // DBのオブジェクトストアの名前
  module.groupStoreName = 'groups';
  module.itemStoreName = 'items';

  /**
   * @function connect
   * @description DBへの接続を行う。
   * 接続に成功したら、変数dbにオブジェクトを格納して使いまわす。
   * @return {Promise} 同期処理を行うためのオブジェクト
   */
  module.connect =  function() {
    d.log('connect is called');
    var deferred = module.q.defer();

    /* PushMeDBという名称のDBを開く、なければ作成する
       module.versionのバージョンがローカルより新しい場合
       request.onupgradeneededで定義した処理が呼ばれる */
    var request = indexedDB.open('PushMeDB', module.version);

    request.onupgradeneeded = module.init;
    request.onsuccess = function(event) {
      module.db = event.target.result;
      d.log('connect is finished');
      deferred.resolve();
    };
    request.onerror = function(event) {
      deferred.reject('open error:' + event.message);
    };
    return deferred.promise;
  }

  /**
   * @function init
   * @description 初回接続時やバージョンアップ時に呼び出され、DBの初期化を行う。
   * DB初期化処理内では、DB、オブジェクトストア、インデックスの作成を行う。
   * データ構造を変更した場合には、必ずここも更新すること。
   * @param {IDBRequest.onsuccess} event データベースのオープン要求に対する結果のイベント
   */
  module.init = function(event) {
    d.log('init is called.');
    module.db = event.target.result;
    // 既にグループのオブジェクトストアが存在する場合（DBのバージョンアップなど）は、既存のオブジェクトストアを全て削除する。
    if(module.db.objectStoreNames.contains(module.groupStoreName)) {
      module.db.deleteObjectStore(module.groupStoreName);
      module.db.deleteObjectStore(module.itemStoreName);
    }

    // オブジェクトストアを作成、Keypathは所謂Primary Key
    var groupStore = module.db.createObjectStore(module.groupStoreName, {keyPath: 'groupId'});
    var itemStore = module.db.createObjectStore(module.itemStoreName, {keyPath: 'itemId'});

    // データの構造を変更したら、必ずこのIndexも更新すること
    // KeyPathの値はIndexを作成せずとも参照可能なので、Indexを作成するのはKeyPath以外の値で何かを参照したいときのみ
    // 今回はグループ名をkeyとしてitemsストアを検索したいため、itemGroupインデックスを作成
    itemStore.createIndex('itemGroup', 'itemGroup');

    // チュートリアルもしくはテスト用にサンプルデータを作成する。
    module.createSample(groupStore, itemStore);
  }

  /**
   * @function createSample
   * @description サンプルデータを作成する、初期化時に呼ばれる想定
   * @param {IDBObjectStore} groupStore グループ一覧を保持するオブジェクトストア
   * @param {IDBObjectStore} itemStore アイテム一覧を保持するオブジェクトストア
   */
  module.createSample = function(groupStore, itemStore) {
    d.log('createSample is called.');
    if(!groupStore || !itemStore) return;

    var groupSamples = [{
      "groupId": "00160407120000",
      "groupName": "[Sample]members",
      "groupNote": "my department"
    }];

    var itemSamples = [{
      "itemId": "00160407120001",
      "itemName": "me",
      "itemGroup": "00160407120000",
      "itemNote": "it's me"
    }, {
      "itemId": "00160407120002",
      "itemName": "Alice",
      "itemGroup": "00160407120000",
      "itemNote": "my boss"
    }, {
      "itemId": "20160407120003",
      "itemName": "Kitty",
      "itemGroup": "00160407120000",
      "itemNote": "new commer"
    }, {
      "itemId": "20160407120004",
      "itemName": "Bob",
      "itemGroup": "00160407120000",
      "itemNote": "engineer"
    }];

    // サンプルデータを一件ずつ追加する
    groupSamples.forEach(function(entry, i) {
      groupStore.add(entry);
    });

    itemSamples.forEach(function(entry, i) {
      itemStore.add(entry);
    });

    d.log('finish to create samples.');
  }

  /**
   * @function getAllGroups
   * @description オブジェクトストアに登録されているすべてのグループ（とその中身のアイテム）を取得する。
   * @return {Promise} groups (一旦同期処理をオブジェクトを返した上で)すべてのグループを格納した配列
   */
  module.getAllGroups = function() {
    d.log('getAllGroups is called');

    var trans = module.db.transaction(module.groupStoreName, 'readonly');
    var store = trans.objectStore(module.groupStoreName);
    var deferred = module.q.defer();

    var groups = [];

    store.openCursor().onsuccess = function(event) {
      var data = event.target.result;

      // data.continue()によって、DBから取得したた結果リストのカーソルの位置を
      // 一件ずつ先に進めているイメージ、全部取得が終わるとdata=nullとなりelseへ
      if(data) { // 取得中の場合
        groups.push(data.value);
        data.continue();
      } else { // 取得が終わった場合
        d.log('取得が終了しました');
        deferred.resolve(groups);
      }
    };
    store.openCursor().onerror = function(event) {
      d.log('取得に失敗しました');
      deferred.reject();
    }
    return deferred.promise;
  }

  /**
   * @function getAllGroupItems
   * @description itemsストアに保存されているデータの中から、指定されたグループに属するもののみを取得する
   * @param {String} groupId グループに紐づいたアイテムを取得するための識別子
   * @return {Promise} items (一旦同期処理をオブジェクトを返した上で)指定されたグループに属するすべてのアイテムを格納した配列
   */
  module.getAllGroupItems = function(groupId) {
    d.log('getAllGroupItems is called');

    var trans = module.db.transaction(module.itemStoreName, 'readonly');
    var store = trans.objectStore(module.itemStoreName);
    // 特定のグループ名を持つもののみをフィルター
    var range = IDBKeyRange.only(groupId);
    var index = store.index("itemGroup");

    var deferred = module.q.defer();

    var items = [];

    index.openCursor(range).onsuccess = function(event) {
      var data = event.target.result;

      // data.continue()によって、DBから取得したた結果リストのカーソルの位置を
      // 一件ずつ先に進めているイメージ、全部取得が終わるとdata=nullとなりelseへ
      if(data) { // 取得中の場合
        items.push(data.value);
        data.continue();
      } else { // 取得が終わった場合
        d.log('取得が終了しました');
        deferred.resolve(items);
      }
    };
    index.openCursor(range).onerror = function(event) {
      d.log('取得に失敗しました');
      deferred.reject();
    }
    return deferred.promise;
  }

  /**
   * @function addNewGroup
   * @description 新しいグループを追加する。グループIDはunixtimeを用いる。
   * @param {object} group 新規作成するグループオブジェクト
   * @return {Promise} 同期処理を行うためのオブジェクト
   */
  module.addNewGroup = function(group) {
    d.log('addNewGroup is called');

    var time = '' + Date.now() + ''; // JavascriptのDateでunixtimeを取得し、文字列化
    var newGroup = {
      groupId: time,
      groupName: group.groupName,
      groupNote: group.groupNote
    };

    d.log('NewGroupID is ' + time);

    var trans = module.db.transaction(module.groupStoreName, 'readwrite');
    var store = trans.objectStore(module.groupStoreName);
    var deferred = module.q.defer();

    var request = store.add(newGroup); // idとcontentから構成したオブジェクトを追加
    request.onsuccess = function(event) {
      deferred.resolve(newGroup);
    };
    request.onerror = function(event) {
      deferred.reject('add request is failed!');
      d.log('addNewGroup失敗: '+ event.message);
    };
    return deferred.promise;
  }

  /**
   * @function updateGroup
   * @description オブジェクトストアに登録されている項目を更新する。
   * @param {object} group 更新対象となるグループオブジェクト
   * @return {Promise} 同期処理を行うためのオブジェクト
   */
  module.updateGroup = function(group) {
    d.log('updateGroup is called');

    var trans = module.db.transaction(module.groupStoreName, 'readwrite');
    var store = trans.objectStore(module.groupStoreName);
    var deferred = module.q.defer();

    // 名前が一致するデータを取得する
    store.get(group.groupId).onsuccess = function(event) {
      var data = event.target.result;
      if(data) { // 該当結果がある場合

        // data = group として受け取ったオブジェクトに全上書きするかたちでも問題ない
        // 現在は、万が一servicesから受け取るオブジェクトが不完全だった場合に備え、全上書きではなく取り出しての代入にしている
        data.groupName = group.groupName;
        data.groupNote = group.groupNote;

        var request = store.put(data); // ストアへ更新をかける
        request.onsuccess = function(event) {
          deferred.resolve();
          d.log('更新完了!');
        }
        request.onerror = function(event) {
          deferred.reject('更新途中で失敗!' + event.message);
        }
      } else { // 該当結果がない場合
        d.log('update対象が見つかりません');
      }
    };
    store.get(group.groupId).onerror = function(event) {
      deferred.reject('request is rejected');
      d.log('update error:' + event.message);
    }
    return deferred.promise;
  }

  /**
  * @function deleteGroup
  * @description オブジェクトストアに登録されている指定されたgroupを削除する。
  * @param {object} group 削除対象となるグループオブジェクト
  * @return {Promise} 同期処理を行うためのオブジェクト
  */
  module.deleteGroup = function(group) {
   d.log('deleteGroup is called');

   var trans = module.db.transaction(module.groupStoreName, 'readwrite');
   var store = trans.objectStore(module.groupStoreName);
   var deferred = module.q.defer();

   // 名前が一致するデータを取得する
   store.delete(group.groupId).onsuccess = function(event) {
     var data = event.target.result;
     d.log('delete group completed!');
     deferred.resolve();
   }
   store.delete(group.groupId).onerror = function(event) {
     d.log('delete group failed.');
     deferred.reject('delete group failed.' + event.message);
   }
   return deferred.promise;
 }

  /**
   * @function addNewItem
   * @description 新しいアイテムを追加する。アイテムIDはunixtimeを用いる。
   * @param {object} item 新規作成するアイテムオブジェクト
   * @return {Promise} 同期処理を行うためのオブジェクト
   */
  module.addNewItem = function(item) {
    d.log('addNewItem is called');

    var time = '' + Date.now() + ''; // JavascriptのDateでunixtimeを取得し、文字列化
    var newItem = {
      itemId: time,
      itemName: item.itemName,
      itemGroup: item.itemGroup,
      itemNote: item.itemNote
    };

    d.log('NewItemID is ' + time);

    var trans = module.db.transaction(module.itemStoreName, 'readwrite');
    var store = trans.objectStore(module.itemStoreName);
    var deferred = module.q.defer();

    var request = store.add(newItem); // idとcontentから構成したオブジェクトを追加
    request.onsuccess = function(event) {
      deferred.resolve(newItem);
    };
    request.onerror = function(event) {
      deferred.reject('add request is failed!');
      d.log('addNewItem失敗: '+ event.message);
    };
    return deferred.promise;
  }

  /**
   * @function updateItem
   * @description オブジェクトストアに登録されている項目を更新する。
   * @param {object} item 更新対象となるアイテムオブジェクト
   * @return {Promise} 同期処理を行うためのオブジェクト
   */
  module.updateItem = function(item) {
    d.log('updateItem is called');

    var trans = module.db.transaction(module.itemStoreName, 'readwrite');
    var store = trans.objectStore(module.itemStoreName);
    var deferred = module.q.defer();

    // idが一致するデータを取得する
    store.get(item.itemId).onsuccess = function(event) {
      var data = event.target.result;
      if(data) { // 該当結果がある場合

        // data = item として受け取ったオブジェクトに全上書きするかたちでも問題ない
        // 現在は、万が一servicesから受け取るオブジェクトが不完全だった場合に備え、全上書きではなく取り出しての代入にしている
        data.itemName = item.itemName;
        data.itemNote = item.itemNote;

        var request = store.put(data); // ストアへ更新をかける
        request.onsuccess = function(event) {
          deferred.resolve();
          d.log('更新完了!');
        }
        request.onerror = function(event) {
          deferred.reject('更新途中で失敗!' + event.message);
        }
      } else { // 該当結果がない場合
        d.log('update対象が見つかりません');
      }
    };
    store.get(item.itemId).onerror = function(event) {
      deferred.reject('request is rejected');
      d.log('update error:' + event.message);
    }
    return deferred.promise;
  }

  /**
   * @function deleteItem
   * @description オブジェクトストアに登録されている指定されたアイテムを削除する。
   * @param {object} item 削除対象となるグループオブジェクト
   * @return {Promise} 同期処理を行うためのオブジェクト
   */
   module.deleteItem = function(item) {
    d.log('deleteItem is called');

    var trans = module.db.transaction(module.itemStoreName, 'readwrite');
    var store = trans.objectStore(module.itemStoreName);
    var deferred = module.q.defer();

    // 名前が一致するデータを取得する
    store.delete(item.itemId).onsuccess = function(event) {
      var data = event.target.result;
      d.log('delete item completed!');
      deferred.resolve();
    }
    store.delete(item.itemId).onerror = function(event) {
      d.log('delete item failed.');
      deferred.reject('delete item failed.' + event.message);
    }
    return deferred.promise;
  }

  /**
   * @function deleteGroupAllItems
   * @description 指定されたグループに紐づくアイテムを全て削除する
   * @param {object} group 削除対象となるグループオブジェクト
   * @return {Promise} 同期処理を行うためのオブジェクト
   */
   module.deleteGroupAllItems = function(group) {
    d.log('deleteGroupAllImtes is called');

    var trans = module.db.transaction(module.itemStoreName, 'readwrite');
    var store = trans.objectStore(module.itemStoreName);

     // 特定のグループ名を持つもののみをフィルター
    var range = IDBKeyRange.only(group.groupId);
    var index = store.index("itemGroup");

    var deferred = module.q.defer();

    // 名前が一致するデータを取得する
    index.openKeyCursor(range).onsuccess = function(event){
      var keyCursor = event.target.result;
      if(keyCursor){
        store.delete(keyCursor.primaryKey);
        keyCursor.continue();
      } else {
        d.log('delete group all items completed!');
        deferred.resolve();
      }
    }
    index.openKeyCursor(range).onerror = function(event) {
      d.log('delete group all items failed.');
      deferred.reject('delete group all items failed.' + event.message);
    }
    return deferred.promise;
  }

  // DBConnとして呼び出し可能(≒public)とするメソッドを下記に定義
  return {
    connect: function(){
      return module.connect();
    },
    getAllGroups: function(){
      return module.getAllGroups();
    },
    getAllGroupItems: function(groupId){
      return module.getAllGroupItems(groupId);
    },
    addNewGroup: module.addNewGroup,
    updateGroup: module.updateGroup,
    deleteGroup: module.deleteGroup,
    addNewItem: module.addNewItem,
    updateItem: module.updateItem,
    deleteItem: module.deleteItem,
    deleteGroupAllItems: module.deleteGroupAllItems
  };
});
