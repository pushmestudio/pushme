/**
 * @fileOverview フィードバックとか、アプリenableにするとかのやつです
 */
$(function(){
    $('#adsChanger').click(function(){
        changeAdsState();
    });
});

function changeAdsState(){
  var adsState = getAdsState();
  if(!adsState){
    adsState = 'off';
    console.debug("adsState not contain" + adsState);
  } else if (adsState == 'off'){
    adsState = 'on';
    console.debug("ads state changed off to on" + adsState);
  } else {
    adsState = 'off';
    console.debug("ads state changed on to off" +adsState);
  }
  
  setCookie('adsState', adsState, 500);
  showAds();
}

function getAdsState(){
  var adsState = getCookie('adsState');
  console.log("adsState is: "+ adsState);
  return adsState;
}

function showAds(){
  var adsState = getAdsState();
  console.debug("showAds basedOn adsState" + adsState);
  var el = document.getElementById('ads'); // 広告表示枠のdiv
  if(adsState == 'on'){
    el.style.display = 'inline';
    alert('Thank you for your support!');
  } else {
    el.style.display = 'none';
    alert('Ads allow us to develop and deliver more functions. If you change your mind, please enable it.');
  }
}