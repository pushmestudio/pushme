/**
 * @file mainApp.servicesというモジュールの定義。
 * DBアクセス系を除いた各種サービスを定義している
 * @copyright (c) 2016 PushMe Studio
 */
angular.module('mainApp.services', ['mainApp.dbConnector'])

/**
 * @module Group
 * @description グループ一覧の定義
 * @requires $timeout
 * @requires $q
 * @requires d
 * @requires DBConn
 */
.factory('Group', function($timeout, $q, d, DBConn) {
  d.log('Group service is loaded');

  // view⇔controller⇔serviceでバインディングするグループに関する値をまとめたオブジェクト
  var groupObject = {
    groupList: []
  };

  /**
   * @function initGroup
   * @description DBを使用する前に接続処理を行い、成功したらDBから全Groupを取得する
   */
  var initGroup = function(){
    d.log('initGroup is called');
    var def = $q.defer();

    DBConn.connect().then(function() {
      DBConn.getAllGroups().then(function(data) {
        $timeout(function(){
          groupObject.groupList = data;
          def.resolve();
        });
      });
    });
    return def.promise;
  };

  /**
   * @function loadGroup
   * @description DBから全Groupを取得する
   */
  var loadGroup = function(){
    d.log('loadGroup is called');
    var def = $q.defer();

    DBConn.getAllGroups().then(function(data) {
      $timeout(function(){
        groupObject.groupList = data;
        def.resolve();
      });
    });

    return def.promise;
  };

  /**
   * @function addGroup
   * @description Controllersから受け取った新規groupオブジェクトをDBに追加する
   */
  var addGroup = function(group) {
    d.log('addGroup is called');
    var def = $q.defer();

    // グループ名が入力されていなかった場合、グループ名を設定する
    if(group.groupName == null || group.groupName == ''){
      // NewGroup_YYYY/MM/DD というグループ名を設定
      var currentTime = new Date();
      group.groupName = 'NewGroup_' + currentTime.getFullYear() + '/' + (currentTime.getMonth()+1) + '/' + currentTime.getDate();
    }
    DBConn.addNewGroup(group).then(function() {
      def.resolve();
    });

    return def.promise;
  };

  /**
   * @function saveGroup
   * @description Controllersから受け取ったgroupオブジェクトをDBに保存する
   */
  var saveGroup = function(group) {
    d.log('saveGroup is called');
    var def = $q.defer();

    DBConn.updateGroup(group).then(function() {
      def.resolve();
    });

    return def.promise;
  };

  /**
   * @function deleteGroup
   * @description Controllersから受け取ったgroupオブジェクトをDBから削除する
   */
  var deleteGroup = function(group, groupIndex){
    d.log('deleteGroup is called');
    var def = $q.defer();

    DBConn.deleteGroup(group).then(function(){
      // groupList内の指定されたgroupを削除(index指定で削除しているのが気に食わない)
      // 文法的には、splice(削除する要素番号, 削除する数)で、削除する数を0にすると削除されない
      $timeout(function(){
        groupObject.groupList.splice(groupIndex, 1);
      });
    });
    DBConn.deleteGroupAllItems(group).then(function() {
      def.resolve();
    });

    return def.promise;
  };

  // API公開名: 呼ばれる実際の内容
  return {
    groupObject: groupObject,
    initGroup: function(){
      initGroup();
    },
    loadGroup: function(){
      loadGroup();
    },
    addGroup: addGroup,
    saveGroup: saveGroup,
    deleteGroup: deleteGroup
  };
})

/**
 * @module Item
 * @description アイテム一覧の定義
 * @requires $timeout
 * @requires $q
 * @requires d
 * @requires DBConn
 */
.factory('Item', function($timeout, $q, d, DBConn) {
  d.log('Item service is loaded');

  // view⇔controller⇔serviceでバインディングするグループに関する値をまとめたオブジェクト
  var itemObject = {
    itemList: []
  };
  var selectFlagArray = [];

  /**
   * @function initItem
   * @description DBから指定したgroupIdをもつアイテム一覧を取得する
   */
  var initItem = function(groupId){
    d.log('initItem is called');
    var def = $q.defer();

    DBConn.getAllGroupItems(groupId).then(function(data){
      $timeout(function(){
        itemObject.itemList = data;
        selectFlagArray=[];
        for (var i=0;i<itemObject.itemList.length;i++){
          selectFlagArray.push(true);
        }
        def.resolve(itemObject);
      });
    });
    return def.promise;
  };

  /**
   * @function allCheckFlag
   * @description 全アイテムのチェック状態をTrueにする
   */
  var allCheckFlag = function(){
    for (var i=0; i<selectFlagArray.length; i++) {
      selectFlagArray[i] = true;
    }
  };

  /**
   * @function allUncheckFlag
   * @description 全アイテムのチェック状態をFalseにする
   */
  var allUncheckFlag = function(){
    for (var i=0; i<selectFlagArray.length; i++) {
      selectFlagArray[i] = false;
    }
  };

  var getFlag = function(){
    return selectFlagArray;
  };

  var deleteFlag = function(itemIndex){
    selectFlagArray.splice(itemIndex,1);
  };

  /**
   * @function addItem
   * @description Controllersから受け取った新規ItemオブジェクトをDBに追加する
   */
  var addItem = function(item) {
    d.log('addItem is called');
    var def = $q.defer();

    // アイテム名が入力されていなかった場合、アイテム名を設定する
    if(item.itemName == null || item.itemName == ''){
      // NewItem_YYYY/MM/DD というアイテム名を設定
      var currentTime = new Date();
      item.itemName = 'NewItem_' + currentTime.getFullYear() + '/' + (currentTime.getMonth()+1) + '/' + currentTime.getDate();
    }
    DBConn.addNewItem(item).then(function() {
      def.resolve();
    });

    return def.promise;
  };

  /**
   * @function saveItem
   * @description Controllersから受け取ったitemオブジェクトをDBに保存する
   */
  var saveItem = function(item) {
    d.log('saveItem is called');
    var def = $q.defer();

    DBConn.updateItem(item).then(function() {
      def.resolve();
    });

    return def.promise;
  };

  /**
   * @function deleteItem
   * @description Controllersから受け取ったitemオブジェクトをDBから削除する
   */
  var deleteItem = function(item, itemIndex){
    d.log('dleteItem is called');
    var def = $q.defer();

    DBConn.deleteItem(item).then(function(){
      // itemList内の指定されたアイテムを削除(index指定で削除しているのが気に食わない)
      // 文法的には、splice(削除する要素番号, 削除する数)で、削除する数を0にすると削除されない
      $timeout(function(){
        itemObject.itemList.splice(itemIndex, 1);
        def.resolve();
      });
    });

    return def.promise;
  };

  return {
    itemObject: itemObject,
    initItem: function(groupId){
      return initItem(groupId);
    },
    addItem: addItem,
    saveItem: saveItem,
    deleteItem: deleteItem,
    allCheckFlag: function(){
      allCheckFlag();
    },
    allUncheckFlag: function(){
      allUncheckFlag();
    },
    getFlag: function(){
      return getFlag();
    },
    deleteFlag: function() {
      return deleteFlag();
    }
  };
})



/**
 * @module d
 * @description ログ出力モジュール DEBUG_MODE ON時にログを出力させる、値の設定はapp.jsにて
 * ログ出力呼び出し時の簡便さを優先するため、モジュール名はdebuggerの'd'
 * @requires $rootScope
 */
.factory('d', function($rootScope) {
  /* eslint-disable no-console */
  /**
   * @const {boolean} DEBUG_MODE デバッグ中ならONにして、ログ出力機能を有効にする
   */
  const DEBUG_MODE = $rootScope.debugMode;

  /**
   * @function log
   * @description DEBUG_MODEがtrueならd.log()で出力、falseなら出力なし
   * @see http://flabo.io/code/20140926/01-angularjs-application-7-tips/
   * @see http://d.hatena.ne.jp/hokaccha/20111216/1324026093
   */
  var printLog;

  /**
   * @function debug
   * @description DEBUG_MODEがtrueならd.debug()でデバッグログ出力、falseなら出力なし
   */
  var printDebug;

  /**
   * @function trace
   * @description DEBUG_MODEがtrueならd.trace()で呼び出し元などを辿って出力、falseなら出力なし
   */
  var printTrace;

  (function() {
    if(DEBUG_MODE) {
      printLog = console.log.bind(console); // console.logの処理をバインド
      printDebug = console.debug.bind(console); // console.debugの処理をバインド
      printTrace = console.trace.bind(console); // console.traceの処理をバインド
    } else {
      printLog = function(){}; // debugMode = falseのときは何も出力しない
      printDebug = function(){};
      printTrace = function(){};
    }
  })();

  return {
    log: printLog,
    debug: printDebug,
    trace: printTrace
  };
});
