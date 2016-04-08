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

  /* 2016/04/08(tomita) もはや不要
  var groupList = [{
    groupId: 1,
    name: '飲み屋'
  }, {
    groupId: 2,
    name: '部門メンバー'
  }];
  */

  return {
    groupObject: groupObject,
    initGroup: function(){
      return initGroup();
    }
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
  var itemObject={
    itemList: []
  }

  var getItems = function(groupName){
    DBConn.getAllGroupItems(groupName).then(function(data){
      $timeout(function(){
          itemObject.itemList = data;
      });
    })
  }

  /* 2016/04/09(tomita) もはや不要
  var itemList = [{
    itemId: 1,
    groupId: 2,
    name: '俺',
    note: 'File Details'
  }, {
    itemId: 2,
    groupId: 2,
    name: 'オレ',
    note: 'default'
  }];
  */

  return {
    itemObject: itemObject,
    getItems: function(groupName){
      getItems(groupName);
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
