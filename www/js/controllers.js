/**
 * @file mainApp.controllersというモジュールの定義。
 * ビューとモデルをつなぐ各種コントローラを定義している
 * @copyright (c) 2016 PushMe Studio
 */
angular.module('mainApp.controllers', ['mainApp.services', 'ngAnimate'])

/**
 * @module GroupCtrl
 * @description グループ一覧を表示
 * @requires $scope
 * @requires Group
 * @requires d
 */
.controller('GroupCtrl', function($scope, Group, d) {
  // controllerの初期化時にDBへの接続とデータの取得を行う
  $scope.init = Group.initGroup();

  $scope.groupObject = Group.groupObject;
  $scope.listCanSwipe = true; // リストに対してスワイプ操作を可能にする

})

/**
 * @module ItemCtrl
 * @description Boardの一覧を表示したり，一覧から削除するコントローラー
 * @requires $scope
 * @requires $stateParams
 * @requires Item
 * @requires Group
 * @requires d
 */
.controller('ItemCtrl', function($scope, $stateParams, Item, Group, d) {
  // controllerの初期化時に現在表示しているグループに紐づくをアイテム一覧をDBから取得
  $scope.init = Item.initItem($stateParams.groupId);

  $scope.listCanSwipe = true; // リストに対してスワイプ操作を可能にする
  $scope.groupName = ''; // ページ上に表示するグループ名
  $scope.itemObject = Item.itemObject; // ページ上に表示するアイテム

  var counter = 0;
  for(counter; counter < Group.groupObject.groupList.length; counter++) {
    // $stateParams.groupIdとして飛んできたgroupIdをkeyに探索し、ヒットしたグループ名をページに表示
    if(Group.groupObject.groupList[counter].groupId == $stateParams.groupId) {
      $scope.groupName = Group.groupObject.groupList[counter].groupName;
      break;
    }
  }

  counter = 0;
  for(counter; counter < Item.itemObject.itemList.length; counter++) {
    // 表示対象のグループIDと同じものを表示するアイテムとして配列に追加
    if(Item.itemObject.itemList[counter].groupId == $stateParams.groupId) {
      $scope.itemObject.itemList.push(Item.itemObject.itemList[counter]);
    }
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
   * @function popAd
   * @description 広告の表示についてポップアップで表示してもよいか確認後、モーダルにて表示する
   */
  $scope.popAd = function() {
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
