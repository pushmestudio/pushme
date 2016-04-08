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
});
