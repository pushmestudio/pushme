/**
 * @file mainApp.controllersというモジュールの定義。
 * ビューとモデルをつなぐ各種コントローラを定義している
 * @copyright (c) 2016 PushMe Studio
 */
angular.module('mainApp.controllers', ['mainApp.services'])

/**
 * @module ItemCtrl
 * @description Boardの一覧を表示したり，一覧から削除するコントローラー
 * @requires $scope
 * @requires d
 */
.controller('ItemCtrl', function($scope, d) {
  $scope.hoge = function() {
    d.log('hello');
  }
  d.log('a');
});
