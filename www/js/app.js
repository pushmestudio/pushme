/**
 * @file メインモジュール(mainApp)、アプリ内の共通設定もここで定義している
 * 依存するモジュール(ionic, mainApp.controllers)についても指定している
 * @copyright (c) 2016 PushMe Studio
 */
angular.module('mainApp', ['ionic', 'mainApp.controllers'])

.run(function($ionicPlatform, $rootScope) {
  /**
   * @const {boolean} debugMode デバッグモードか否か、デバッグモード=trueならログ出力する
   */
  $rootScope.debugMode = false;

  if(window.StatusBar) {
    window.StatusBar.styleDefault();
  }
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider) {

  /* ローカル画像を読込み，サムネイルや背景などで表示するための設定
    この設定でサニタイズしない場合は，angularのセキュリティでUnsafe扱いとなってしまう */
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(content|file|data|http):/);

  /* 指定されたURLが下記ののいずれにも該当しない場合に表示するURLを指定
   アプリ起動時には、/pushme が表示される*/
  $urlRouterProvider.otherwise('/pushme/groups');

  /* SPAの肝の部分
    URLが変更された際に、<html></html>のすべてを読み込みなおすのでなく、
    index.html内の<ion-nav-view>ここ</ion-nav-view>に、指定されたテンプレートが展開される */

  $stateProvider

  // アプリ起動時の初期画面
  .state('groups', {
//    cache: false, // Toast正常表示のための暫定対応
    url: '/pushme/groups',
    templateUrl: 'templates/groups.html', // TODO
    controller: 'GroupCtrl' // TODO
  })

  .state('items', {
//    cache: false, // Toast正常表示のための暫定対応
    url: '/pushme/groups/:groupId',
    templateUrl: 'templates/items.html', // TODO
    controller: 'ItemCtrl' // TODO
  });

});
