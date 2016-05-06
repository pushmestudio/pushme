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
   * @description グループ一覧上にてグループの名前とコメントを変更するためのポップアップを開く
   * @param {object} group 編集するグループのオブジェクト
   */
  $scope.openGroupInfoPopup = function(group) {

    $scope.originalGroupName = group.groupName; // 変更前のグループ名、Cancel時に元に戻すために使う
    $scope.originalGroupNote = group.groupNote; // 変更前のグループメモ、Cancel時に元に戻すために使う
    $scope.editableGroup = group; // Viewから受け取ったオブジェクトを編集用にscopeバインド

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
            onTap: function(e) {
              // キャンセルが押された場合は変更前の値に戻す
              $scope.editableGroup.groupName = $scope.originalGroupName;
              $scope.editableGroup.groupNote = $scope.originalGroupNote;
            }
          },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
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
        // cancelが押された場合はresがundefになる
        if(res !== undefined) {
          Group.saveGroup(res); // 保存処理の呼び出し, resはgroupオブジェクト
        }
        // スワイプで表示させたオプションメニューを閉じる
        $ionicListDelegate.closeOptionButtons();
      });
    };
    $scope.showEditPopup();
  }

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
   }
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
 */
.controller('ItemCtrl', function($scope, $stateParams, $ionicPopup, $cordovaKeyboard, $ionicListDelegate, Item, Group, d, $timeout, $q) {
  // controllerの初期化時に現在表示しているグループに紐づくをアイテム一覧をDBから取得

/*** Promise版
  $scope.initItems= function(){
    Item.initItem($stateParams.groupId).then(function(items){
      $scope.itemObject = items;
    });
  };
***/

// promise_aa = Item.initItem($stateParams.groupId);
// d.log(promise_aa);
// promise_aa.then(function(items){

  $scope.listCanSwipe = true; // リストに対してスワイプ操作を可能にする
  $scope.groupName = ''; // ページ上に表示するグループ名
  $scope.itemObject = [];


  $scope.initItems = function(){
    Item.initItem($stateParams.groupId);
    $scope.getItemObject();
    $scope.selectFlagArray = Item.getFlag();
    //$scope.getFlag();
    //$scope.allCheckFlag();
  }

  $scope.getItemObject = function(){
    $scope.itemObject = Item.itemObject;
  }

  var counter = 0;
  for(counter; counter < Group.groupObject.groupList.length; counter++) {
    console.log("hi 1");
    // $stateParams.groupIdとして飛んできたgroupIdをkeyに探索し、ヒットしたグループ名をページに表示
    if(Group.groupObject.groupList[counter].groupId == $stateParams.groupId) {
      $scope.groupName = Group.groupObject.groupList[counter].groupName;
      break;
    }
  }

  counter = 0;
  for(counter; counter < Item.itemObject.itemList.length; counter++) {
    console.log("hi 2");
    // 表示対象のグループIDと同じものを表示するアイテムとして配列に追加
    if(Item.itemObject.itemList[counter].groupId == $stateParams.groupId) {
      $scope.itemObject.itemList.push(Item.itemObject.itemList[counter]);
      console.log("add item to array");
    }
  }

/*
  $timeout(function(){
    Item.initItem($stateParams.groupId);
  },0).then(function(itemObjectByService){
      $scope.itemObject = itemObjectByService;

    //$scope.itemObject = Item.itemObject;
    console.log("length : " + Item.itemObject.itemList.length); //0になる
  });
  */
/*
  Item.initItem($stateParams.groupId).then(function(itemObjectByService){
      $scope.itemObject = itemObjectByService; // ページ上に表示するアイテム
  });
  console.log("length : " + Item.itemObject.itemList.length); //0になる
  // $scope.init = Item.initItem($stateParams.groupId);
  //$scope.itemObject = Item.initItem($stateParams.groupId);

  $scope.a = Item.itemAmmount;
  console.log("itemAmmount : " + $scope.a);
*/


  // $timeout(function(){
  // $scope.itemObject = Item.itemObject; // ページ上に表示するアイテム
    // Item.itemObjectの中身が変わっても再度呼ばれないため，Updateする方法を検討しなければならない
  //   console.log("length : " + Item.itemObject.itemList.length); //0になる
  // });

  /**
   * @function openItemInfoPopup
   * @description アイテムの名前とコメントを変更するためのポップアップを開く
   * @param {object} item 編集するアイテムのオブジェクト
   */
  $scope.openItemInfoPopup = function(item) {

    $scope.originalItemName = item.itemName; // 変更前のアイテム名、Cancel時に元に戻すために使う
    $scope.originalItemNote = item.itemNote; // 変更前のアイテムプメモ、Cancel時に元に戻すために使う
    $scope.editableItem = item; // Viewから受け取ったオブジェクトを編集用にscopeバインド

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
        title: 'Input Group Info',
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            onTap: function(e) {
              // キャンセルが押された場合は変更前の値に戻す
              $scope.editableItem.itemName = $scope.originalItemName;
              $scope.editableItem.itemNote = $scope.originalItemNote;
            }
          },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
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
        // cancelが押された場合はresがundefになる
        if(res !== undefined) {
          Item.saveItem(res); // 保存処理の呼び出し, resはgroupオブジェクト
        }
        // スワイプで表示させたオプションメニューを閉じる
        $ionicListDelegate.closeOptionButtons();
      });
    };
    $scope.showEditPopup();
  }

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
        $ionicListDelegate.closeOptionButtons();
      }
    });
   }

   /**
    * @function selectItem
    * @description アイテム一覧上にてアイテムをランダム選択する
    * @param
    * @param
    */
    //方針
    //全Itemに最初からチェックが入っている
    //基本は全Itemからのランダム選択
    // チェックを外すと，チェック済の中からランダム選択
    $scope.selectItem = function(){

      var chikachika = function(resultIndex){
        console.log("resultIndex :: " + resultIndex);
      }

      // ランダム選択対象として抽出(flag=trueのitem)
      $scope.targetItems =[];
      for (var i=0; i<$scope.itemObject.itemList.length;i++){
        if ($scope.selectFlagArray[i] === true) {
            $scope.targetItems.push($scope.itemObject.itemList[i]);
        }
      }
      d.log("ランダム選択の対象オブジェクト: ");
      console.dir($scope.targetItems); //dコメントなので後で削除
      //flag trueのitemに対して，ランダムで色付け

      // ランダム抽出
      $scope.randomSelectResult = $scope.targetItems[Math.floor(Math.random() * $scope.targetItems.length)];
      d.log("ランダム選択の結果: "); //dコメントなので後で削除
      console.dir($scope.randomSelectResult); //dコメントなので後で削除

      // 選ばれたアイテムの$indexを取得して置き，その$indexのアイテムのCSS動的変更を最後に行う
      for (var i=0;i<$scope.itemObject.itemList.length;i++){
        if ($scope.randomSelectResult.itemId === $scope.itemObject.itemList[i].itemId) {
            chikachika(i); //CSS動的変更メソッド
        }
      }
    }

    $scope.showFlagStatus = function(){
      console.log($scope.selectFlagArray);
    }

    $scope.allCheckFlag = function(){
      Item.allCheckFlag();
      //$scope.selectFlagArray = Item.getFlag();
    }
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
  }

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
