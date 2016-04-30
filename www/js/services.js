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
   * @function loadGroup
   * @description DBから全Groupを取得する
   */
  var loadGroup = function(){
    DBConn.getAllGroups().then(function(data) {
      $timeout(function(){
        groupObject.groupList = data;
      });
    });
  }

  /**
   * @function addGroup
   * @description Controllersから受け取った新規groupオブジェクトをDBに追加する
   */
  var addGroup = function(group) {
    d.log("addGroup is called");
    // グループ名が入力されていなかった場合、グループ名を設定する
    if(group.groupName == null || group.groupName == ''){
      // NewGroup_YYYY/MM/DD というグループ名を設定
      var currentTime = new Date();
      group.groupName = 'NewGroup_' + currentTime.getFullYear() + '/' + (currentTime.getMonth()+1) + '/' + currentTime.getDate();
    }
    DBConn.addNewGroup(group);
  }

  /**
   * @function saveGroup
   * @description Controllersから受け取ったgroupオブジェクトをDBに保存する
   */
  var saveGroup = function(group) {
    d.log("saveGroup is called");
    DBConn.updateGroup(group);
  }

  /**
   * @function deleteGroup
   * @description Controllersから受け取ったgroupオブジェクトをDBから削除する
   */
  var deleteGroup = function(group, groupIndex){
    d.log("dleteGroup is called");
    DBConn.deleteGroup(group).then(function(){
      // groupList内の指定されたgroupを削除(index指定で削除しているのが気に食わない)
      // 文法的には、splice(削除する要素番号, 削除する数)で、削除する数を0にすると削除されない
      $timeout(function(){
        groupObject.groupList.splice(groupIndex, 1);
      });
    })
    DBConn.deleteGroupAllItems(group);
  }

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
    saveGroup: saveGroup
    deleteGroup: deleteGroup
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
   * @function addItem
   * @description Controllersから受け取った新規ItemオブジェクトをDBに追加する
   */
  var addItem = function(item) {
    d.log("addItem is called");
    // アイテム名が入力されていなかった場合、アイテム名を設定する
    if(item.itemName == null || item.itemName == ''){
      // NewItem_YYYY/MM/DD というアイテム名を設定
      var currentTime = new Date();
      item.itemName = 'NewItem_' + currentTime.getFullYear() + '/' + (currentTime.getMonth()+1) + '/' + currentTime.getDate();
    }
    DBConn.addNewItem(item);
  }

  /**
   * @function saveItem
   * @description Controllersから受け取ったitemオブジェクトをDBに保存する
   */
  var saveItem = function(item) {
    d.log("saveItem is called");
    DBConn.updateItem(item);
  }

  /**
   * @function deleteItem
   * @description Controllersから受け取ったitemオブジェクトをDBから削除する
   */
  var deleteItem = function(item, itemIndex){
    d.log("dleteItem is called");
    DBConn.deleteItem(item).then(function(){
      // itemList内の指定されたアイテムを削除(index指定で削除しているのが気に食わない)
      // 文法的には、splice(削除する要素番号, 削除する数)で、削除する数を0にすると削除されない
      $timeout(function(){
        itemObject.itemList.splice(itemIndex, 1);
      });
    })
  }

  return {
    itemObject: itemObject,
    initItem: function(groupId){
      initItem(groupId);
    },
    addItem: addItem,
    saveItem: saveItem,
    deleteItem: deleteItem
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
})

/**
 * @module AdMobManager
 * @description AdMob広告関連の変数を用意する
 * @requires $rootScope
 * @requires $timeout
 * @requires d
 */
.factory('AdMobManager', function($rootScope, $timeout, d){
  /**
   * @const {double} FREQ_POP_AD 広告の表示量、1で常に表示、0で常に非表示
   */
  const FREQ_POP_AD = 1.0;

  /**
  * @const {boolean} DEBUG_MODE デバッグ中ならONにして、テスト用広告にする
   */
  const DEBUG_MODE = $rootScope.debugMode;

  // 広告呼び出し用のID
  var admobid = {
    // banner: '',　バナー広告を使用する場合に必要
    interstitial: 'ca-app-pub-2622960706202758/2841802224'
  };

  var flagData = {
    iconFlag: false,
    alterFlag: false
  }

  /**
   * @function initAdMob
   * @description 広告関連の処理を初期化する関数
   * 現在は、端末がAndroidの場合のみ初期化処理が進められる
   * デバッグモードtrueの場合、テスト広告の準備をする
   */
  var initAdMob = function(){
    // Androidの場合
    if(ionic.Platform.isAndroid()){
      if(typeof window.AdMob == 'undefined'){
        d.log('AdMob plugin is not ready');
      } else {
        /*
        // バナー広告を準備
        AdMob.createBanner({
          adId: admobid.banner,
          isTesting: true,
          overlap: false,
          position: AdMob.AS_POSITION.BOTTOM_CENTER,
          bgColor: 'black',
          autoShow: true
        });
        */

        // 広告の読込が完了（成功したときのコールバック）
        document.addEventListener('onAdLoaded', function(data){
          if(Math.random() <= FREQ_POP_AD){
            d.log('Interstitial ad is ready');
            $timeout(function(){
              flagData.iconFlag = true;
            });
          }
        });

        // インタースティシャル広告を準備
        window.AdMob.prepareInterstitial({
          adId: admobid.interstitial,
          // デバック⇒true, 本番⇒false
          isTesting: DEBUG_MODE,
          autoShow: false
        });
      }
    }
  }

  /**
   * @function showInterstitialAd
   * @description インターステイシャル広告を表示する
   */
  var showInterstitialAd = function(){
    window.AdMob.showInterstitial();
  }

  return {
    AdMob: window.AdMob,
    flagData: flagData,
    initAdMob: function(){
      initAdMob();
    },
    showInterstitialAd: function(){
      showInterstitialAd();
    }
  }
});
