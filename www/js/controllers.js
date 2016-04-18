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
.controller('ItemCtrl', function($scope, $stateParams, $ionicPopup, $cordovaKeyboard, $ionicListDelegate, Item, Group, d) {
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
});
