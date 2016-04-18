/**
 * @file mainApp.servicesというモジュールの定義。
 * DBアクセス系を除いた各種サービスを定義している
 * @copyright (c) 2016 PushMe Studio
 */
angular.module('mainApp.services', ['mainApp.dbConnector'])

/**
 * @module Group
 * @description グループ一覧の定義
 * @requires d
 */
.factory('Group', function($timeout, d, DBConn) {
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
    DBConn.connect().then(function() {
      DBConn.getAllGroups().then(function(data) {
        $timeout(function(){
          groupObject.groupList = data;
        });
      });
    });
  }

  /**
   * @function saveGroup
   * @description Controllersから受け取ったgroupオブジェクトをDBに保存する
   */
  var saveGroup = function(group) {
    d.log("saveGroup is called");
    DBConn.updateGroup(group);
  }

  // API公開名: 呼ばれる実際の内容
  return {
    groupObject: groupObject,
    initGroup: function(){
      initGroup();
    },
    saveGroup: saveGroup
  };
})

/**
 * @module Item
 * @description アイテム一覧の定義
 * @requires d
 */
.factory('Item', function($timeout, d, DBConn) {
  d.log('Item service is loaded');

  // view⇔controller⇔serviceでバインディングするグループに関する値をまとめたオブジェクト
  var itemObject = {
    itemList: []
  }

  /**
   * @function initItem
   * @description DBから指定したgroupIdをもつアイテム一覧を取得する
   */
  var initItem = function(groupId){
    DBConn.getAllGroupItems(groupId).then(function(data){
      $timeout(function(){
          itemObject.itemList = data;
      });
    })
  }

  /**
   * @function saveItem
   * @description Controllersから受け取ったitemオブジェクトをDBに保存する
   */
  var saveItem = function(item) {
    d.log("saveItem is called");
    DBConn.updateItem(item);
  }

  return {
    itemObject: itemObject,
    initItem: function(groupId){
      initItem(groupId);
    },
    saveItem: saveItem
  };
})



/**
 * @module d
 * @description ログ出力モジュール DEBUG_MODE ON時にログを出力させる、値の設定はapp.jsにて
 * ログ出力呼び出し時の簡便さを優先するため、モジュール名はdebuggerの'd'
 * @requires $rootScope
 */
.factory('d', function($rootScope) {
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
