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
   */
  module.createSample = function(groupStore, itemStore) {
    d.log('createSample is called.');
    if(!groupStore || !itemStore) return;

    var groupSamples = [{
      "groupId": "20160407120000",
      "groupName": "[Sample]members",
      "groupNote": "my department"
    }];

    var itemSamples = [{
      "itemId": "20160407120001",
      "itemName": "me",
      "itemGroup": "[Sample]members",
      "itemNote": "it's me"
    }, {
      "itemId": "20160407120002",
      "itemName": "boss",
      "itemGroup": "[Sample]members",
      "itemNote": "my boss"
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
   * @return {Promise} items (一旦同期処理をオブジェクトを返した上で)指定されたグループに属するすべてのアイテムを格納した配列
   */
  module.getAllGroupItems = function(groupName) {
    d.log('getAllGroupItems is called');

    var trans = module.db.transaction(module.itemStoreName, 'readonly');
    var store = trans.objectStore(module.itemStoreName);
    // 特定のグループ名を持つもののみをフィルター
    var range = IDBKeyRange.only(groupName);
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

  // DBConnとして呼び出し可能(≒public)とするメソッドを下記に定義
  return {
    connect: function(){
      return module.connect();
    },
    getAllGroups: function(){
      return module.getAllGroups();
    },
    getAllGroupItems: function(groupName){
      return module.getAllGroupItems(groupName);
    }
  };
});
