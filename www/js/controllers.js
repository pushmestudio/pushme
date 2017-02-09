/**
 * @file mainApp.controllersというモジュールの定義。
 * ビューとモデルをつなぐ各種コントローラを定義している
 * @copyright (c) 2016 PushMe Studio
 */
angular.module('mainApp.controllers', ['mainApp.services', 'ngAnimate', 'ngCordova'])

/**
 * @module GroupCtrl
 * @description グループ一覧を表示
 * @requires $scope
 * @requires $ionicPopup
 * @requires $cordovaKeyboard
 * @requires $ionicListDelegate
 * @requires Group
 * @requires d
 */
.controller('GroupCtrl', function($scope, $ionicPopup, $cordovaKeyboard, $ionicListDelegate, Group, d) {
  // controllerの初期化時にDBへの接続とデータの取得を行う
  $scope.init = Group.initGroup();

  $scope.groupObject = Group.groupObject;
  $scope.listCanSwipe = true; // リストに対してスワイプ操作を可能にする

  /**
   * @function openGroupInfoPopup
   * @description グループ一覧上にてグループの新規作成、またはグループの名前とコメントを変更するためのポップアップを開く
   *            <br>引数のオブジェクトの有無によりグループの新規作成か変更かを判定する
   * @param {object} group 編集するグループのオブジェクト
   */
  $scope.openGroupInfoPopup = function(group) {

    // 新規グループ作成を示すフラグ
    $scope.newGroup = false;

    if(group){
      $scope.originalGroupName = group.groupName; // 変更前のグループ名、Cancel時に元に戻すために使う
      $scope.originalGroupNote = group.groupNote; // 変更前のグループメモ、Cancel時に元に戻すために使う
      $scope.editableGroup = group; // Viewから受け取ったオブジェクトを編集用にscopeバインド
    }else{
      // 新規グループ作成時の場合の初期出力
      $scope.editableGroup = {
        groupName: '',
        groupNote: ''
      };
      $scope.newGroup = true; // フラグを立て、新規グループであることを示す
    }

    /**
     * @function showEditPopup
     * @description 編集用のポップアップを表示する
     * オートフォーカスをつけた上でキーボード表示を呼び出しているので、ポップアップ表示と同時にキーボードが開く
     * @todo 関数内関数になっているので外出し化
     */
    $scope.showEditPopup = function() {

      var editPopup = $ionicPopup.show({
        template: '<div class="list">' +
          '<label class="item item-input"><input type="text" placeholder="Group Name" ng-model="editableGroup.groupName" autofocus></label>' +
          '<label class="item item-input"><textarea placeholder="Note..." ng-model="editableGroup.groupNote"></textarea></label></div>',
        title: 'Input Group Info',
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            onTap: function() {
              // 新規グループ作成キャンセル時は処理を行わない
              if(!$scope.newGroup){
                // キャンセルが押された場合は変更前の値に戻す
                $scope.editableGroup.groupName = $scope.originalGroupName;
                $scope.editableGroup.groupNote = $scope.originalGroupNote;
              }
            }
          },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function() {
              return $scope.editableGroup;
            }
          }
        ]
      });
      if(window.cordova) { // Cordova読み込み時のみ呼び出し(ブラウザでのTestabilityを考慮)
        $cordovaKeyboard.show(); // キーボードを表示する
      }

      editPopup.then(function(res) {
        if(window.cordova) { // Cordova読み込み時のみ呼び出し(ブラウザでのTestabilityを考慮)
          $cordovaKeyboard.close(); // 表示されているキーボードを閉じる
        }
        d.log('Tapped!', res);
        // 新規グループ作成であるかを判定する
        if($scope.newGroup){
          // cancelが押された場合はresがundefになる
          if(res !== undefined) {
            // 保存処理の呼び出し, resはgroupオブジェクト
            // グループ一覧の再読み込みを行う
            Group.addGroup(res).then(Group.loadGroup());
          }
        }else{
          // cancelが押された場合はresがundefになる
          if(res !== undefined) {
            Group.saveGroup(res); // 保存処理の呼び出し, resはgroupオブジェクト
          }
          // スワイプで表示させたオプションメニューを閉じる
          $ionicListDelegate.closeOptionButtons();
        }
      });
    };
    $scope.showEditPopup();
  };

  /**
   * @function deleteGroup
   * @description グループ一覧上にてグループを削除する
   * @param {object} group 削除するグループのオブジェクト
   * @param {object} groupIndex 削除対象となるグループの配列上の番号
   */
  $scope.deleteGroup = function(group, groupIndex){
    $ionicPopup.confirm({
      template: 'Are you sure to delete this group?<br>(This action cannnot be undone.)', // String (optional). The html template to place in the popup body.
      okType: 'button-assertive'
    }).then(function(res) { // ポップアップ上でOkならtrue、Cancelならfalseが返る
      if(res) { // ポップアップでOkなら削除する
        Group.deleteGroup(group, groupIndex);
        $ionicListDelegate.closeOptionButtons();
      }
    });
  };
})

/**
 * @module ItemCtrl
 * @description Boardの一覧を表示したり，一覧から削除するコントローラー
 * @requires $scope
 * @requires $stateParams
 * @requires $ionicPopup
 * @requires $cordovaKeyboard
 * @requires $ionicListDelegate
 * @requires Item
 * @requires Group
 * @requires d
 * @requires timeout
 * @requires interval
 */
.controller('ItemCtrl', function($scope, $stateParams, $ionicPopup, $cordovaKeyboard, $ionicListDelegate, Item, Group, d, $timeout, $interval) {
  // controllerの初期化時に現在表示しているグループに紐づくをアイテム一覧をDBから取得

  $scope.groupName = ''; // ページ上に表示するグループ名
  $scope.itemObject = [];
  $scope.selectFlagArray =[];
  /* Promise版の初期化処理 */
  $scope.initItems= function(){
    $scope.listCanSwipe = true; // リストに対してスワイプ操作を可能にする

    var counter = 0;
    for(counter; counter < Group.groupObject.groupList.length; counter++) {
      // $stateParams.groupIdとして飛んできたgroupIdをkeyに探索し、ヒットしたグループ名をページに表示
      if(Group.groupObject.groupList[counter].groupId == $stateParams.groupId) {
        $scope.groupName = Group.groupObject.groupList[counter].groupName;
        break;
      }
    }

    Item.initItem($stateParams.groupId).then(function(items){
      $scope.itemObject = items; //Item,initItem($stateParams.groupId);でもOK
      $scope.selectFlagArray = Item.getFlag();
    });
  };

  /**
   * @function openItemInfoPopup
   * @description アイテムの新規作成、またはアイテムの名前とコメントを変更するためのポップアップを開く
   *            <br>引数のオブジェクトの有無によりアイテムの新規作成か変更かを判定する
   * @param {object} item 編集するアイテムのオブジェクト
   */
  $scope.openItemInfoPopup = function(item) {

    // 新規アイテム作成を示すフラグ
    $scope.newItem = false;

    if(item){
      $scope.originalItemName = item.itemName; // 変更前のアイテム名、Cancel時に元に戻すために使う
      $scope.originalItemNote = item.itemNote; // 変更前のアイテムプメモ、Cancel時に元に戻すために使う
      $scope.editableItem = item; // Viewから受け取ったオブジェクトを編集用にscopeバインド
    }else{
      // 新規アイテム作成時の場合の初期出力
      $scope.editableItem = {
        itemName: '',
        itemGroup: $stateParams.groupId,
        itemNote: ''
      };
      $scope.newItem = true; // フラグを立て、新規グループであることを示す
    }

    /**
     * @function showEditPopup
     * @description 編集用のポップアップを表示する
     * オートフォーカスをつけた上でキーボード表示を呼び出しているので、ポップアップ表示と同時にキーボードが開く
     * @todo 関数内関数になっているので外出し化
     */
    $scope.showEditPopup = function() {

      var editPopup = $ionicPopup.show({
        template: '<div class="list">' +
          '<label class="item item-input"><input type="text" placeholder="Item Name" ng-model="editableItem.itemName" autofocus></label>' +
          '<label class="item item-input"><textarea placeholder="Note..." ng-model="editableItem.itemNote"></textarea></label></div>',
        title: 'Input Item Info',
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            onTap: function() {
              // 新規アイテム作成キャンセル時は処理を行わない
              if(!$scope.newItem){
                // キャンセルが押された場合は変更前の値に戻す
                $scope.editableItem.itemName = $scope.originalItemName;
                $scope.editableItem.itemNote = $scope.originalItemNote;
              }
            }
          },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function() {
              return $scope.editableItem;
            }
          }
        ]
      });
      if(window.cordova) { // Cordova読み込み時のみ呼び出し(ブラウザでのTestabilityを考慮)
        $cordovaKeyboard.show(); // キーボードを表示する
      }

      editPopup.then(function(res) {
        if(window.cordova) { // Cordova読み込み時のみ呼び出し(ブラウザでのTestabilityを考慮)
          $cordovaKeyboard.close(); // 表示されているキーボードを閉じる
        }
        d.log('Tapped!', res);
        // 新規アイテム作成であるかを判定する
        if($scope.newItem){
          // cancelが押された場合はresがundefになる
          if(res !== undefined) {
            // 保存処理の呼び出し, resはgroupオブジェクト
            // アイテム一覧の再読み込みを行う, ページ全体を再描画する
            Item.addItem(res).then($scope.initItems());
          }
        }else{
          // cancelが押された場合はresがundefになる
          if(res !== undefined) {
            Item.saveItem(res); // 保存処理の呼び出し, resはgroupオブジェクト
          }
          // スワイプで表示させたオプションメニューを閉じる
          $ionicListDelegate.closeOptionButtons();
        }
      });
    };
    $scope.showEditPopup();
  };

  /**
   * @function deleteItem
   * @description アイテム一覧上にてアイテムを削除する
   * @param {object} item 削除するアイテムのオブジェクト
   * @param {object} itemIndex 削除対象となるアイテムの配列上の番号
   */
  $scope.deleteItem = function(item, itemIndex){
    $ionicPopup.confirm({
      template: 'Are you sure to delete this item?<br>(This action cannnot be undone.)', // String (optional). The html template to place in the popup body.
      okType: 'button-assertive'
    }).then(function(res) { // ポップアップ上でOkならtrue、Cancelならfalseが返る
      if(res) { // ポップアップでOkなら削除する
        Item.deleteItem(item, itemIndex);
        Item.deleteFlag(itemIndex);
        $ionicListDelegate.closeOptionButtons();
      }
    });
  };

  $scope.selectButtonFlag = true; // trueかつの時，PushMe!ボタンが押せる

  /**
   * @function selectItem
   * @description アイテム一覧上にてアイテムをランダム選択する
   * 方針：全Itemに最初からチェックが入っている、基本は全Itemからのランダム選択
   * チェックを外すと、チェック済みの中からランダム選択
   */
  $scope.selectItem = function(){

    var reset = function(){
      for (var i=0; i<$scope.itemObject.itemList.length;i++){
        if ($scope.selectFlagArray[i] === true) {
          document.getElementById('random_'+i).parentNode.style.backgroundColor = '#fff9f5';//#BBCCDD(薄い青) #fff9f5(アイボリー)
        }else if ($scope.selectFlagArray[i] === false){
          document.getElementById('random_'+i).parentNode.style.backgroundColor = '#fff9f5'; //#fff9f5 #fff
        }
      }
      // ランダム選択対象として抽出(flag=trueのitem)
      $scope.targetItems =[];
      for (var j=0; j<$scope.itemObject.itemList.length;j++){
        if ($scope.selectFlagArray[j] === true) {
          $scope.targetItems.push($scope.itemObject.itemList[j]);
        }
      }
    };

    var randomSelect = function() {
      // ランダム抽出
      $scope.randomSelectResult = $scope.targetItems[Math.floor(Math.random() * $scope.targetItems.length)];
      // 選ばれたアイテムの$indexを取得して置き，その$indexのアイテムのCSS動的変更を最後に行う
      for (var i=0;i<$scope.itemObject.itemList.length;i++){
        if ($scope.randomSelectResult.itemId === $scope.itemObject.itemList[i].itemId) {
          chikachika(i); //CSS動的変更メソッド
          result = i;
        }
      }
    };

    var chikachika = function(resultIndex) {
      document.getElementById('random_'+resultIndex).parentNode.style.backgroundColor = '#11c1f3';// ランダム抽出結果 #11c1f3=ionicのcalm(青)
    };

    var finalChikachika = function(resultIndex) {
      document.getElementById('random_'+resultIndex).parentNode.style.backgroundColor = '#33cd5f';// ランダム抽出結果 #33cd5f=ionicのbalanced(緑)
    };

    var result = null;
    $scope.selectButtonFlag = false;// falseの時，PushMe!ボタンが押せない
    $interval(function () {
      reset();
      randomSelect();
    }, 300,15).then(function(){
      finalChikachika(result);
      $scope.selectButtonFlag = true;// trueの時，PushMe!ボタンが押せる
    });//300msで15回ランダム選択し，最後にもう一尾ランダム選択して，選択アイテムを強調する
  };

  /**
   * @function trueFlagIsExist
   * @description PushMe!ボタンの使用可否を決定するフラグを返すメソッド(trueの時，ボタン使用可能)
   * @return {boolean} true or false
   */
  $scope.trueFlagIsExist = function(){
    for (var i=0;i<$scope.selectFlagArray.length;i++){
      if ($scope.selectFlagArray[i] === true ){
        return true;
      }
    }
    return false;//全てのアイテムのチェックが外れている場合は，falseを返す。PushMe!ボタンが押せない状態。
  };

  // すべてのチェックボックスを有効にする
  $scope.allCheckFlag = function(){
    Item.allCheckFlag();
  };

  // すべてのチェックボックスを無効にする
  $scope.allUncheckFlag = function(){
    Item.allUncheckFlag();
  };
})

/**
 * @module AdsCtrl
 * @description 広告表示用のコントローラ
 * @requires $scope
 * @requires $ionicPralform
 * @requires $ionicPopup
 * @requires AdMobManager
 * @requires d
 */
.controller('AdsCtrl', function($scope, $ionicPlatform, $ionicPopup, AdMobManager, d) {
  // AdMobManagerのフラグに関するデータをバインド
  $scope.flagData = AdMobManager.flagData;

  /**
   * @function init
   * @description ionicの準備ができたら、広告表示の初期化処理を呼び出す
   */
  $scope.init = function(){
    $ionicPlatform.ready(function(){
      AdMobManager.initAdMob();
    });
  };

  /**
   * @function showUpInterstitialAd
   * @description インタースティシャル広告を画面全体に表示させる
   * 何らかのエラーでInterstitial広告が表示できない場合は、代替広告表示用のフラグをtrueにする
   * @todo 現在、代替広告表示用のフラグがONになっても特段の処理はされていない模様
   */
  $scope.showUpInterstitialAd = function(){
    try{
      d.log('Show Interstitial Ad');
      // Interstitial広告を呼び出す
      AdMobManager.showInterstitialAd();
    } catch(e){
      d.log(e);
      $scope.showAlterAd = true;
    }
  };

  /**
   * @function popAdConfirm
   * @description 広告の表示についてポップアップで表示してもよいか確認後、モーダルにて表示する
   */
  $scope.popAdConfirm = function() {
    $ionicPopup.confirm({
      title: '[Ad Display Confirmation]', // String. The title of the popup.
      template: 'Our Robo bring an ad. <br>Can I show you it once?<br>(You can help us through tapping an ad!)', // String (optional). The html template to place in the popup body.
    }).then(function(res) { // ポップアップ上でOkならtrue、Cancelならfalseが返る
      if(res) { // Okなら広告を表示する
        AdMobManager.flagData.iconFlag = false; // 一度アイコンボタンを押したら、はい・いいえにかかわらず以降は表示しないようにする
        $scope.showUpInterstitialAd();
      } else {
        AdMobManager.flagData.iconFlag = false; // 一度アイコンボタンを押したら、はい・いいえにかかわらず以降は表示しないようにする
      }
    });
  };
});
