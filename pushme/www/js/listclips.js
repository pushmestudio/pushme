//clipsコレクションからデータ抽出 & 表示
$(
function(){
		$.ajax({
			url: "getclips",
			type: "GET",
			success: function(data){
				result = '<form name="itemlist" class="pure-form pure-form-aligned">';
				result += '<div class="pure-g">';
				result += '<span class="accordion">';
				for(i = 0; i < Object.keys(data).length; i++){
				result += '<div name="arrow" class="pure-u-1 pure-u-md-1-4">';
				result += '<div name="card">';
			  result += '<div name="title"><label for="item' + i + '">' + data[i].title + '</label></div>';
			  result +=	'<div name="place" style="font-size: 12px;">アクセス: ' + data[i].place + '</div>';
				result += '<input type="button" name="detail" value="詳細"></div>';
			  result += '<ul>';
				result += '<li>カテゴリ:' + data[i].tag + '</li>';
				result += '<li>コメント:' + data[i].comment + '</li>';
				result += '<li>URL: <a href="' + data[i].image + '">' + data[i].image + '</a></li></ul></div>';
				}
				result += '</span></div></div>';
				result += "</form>";
				$('#itemlist').html(result);
				makeAccordion();
				makeIsChecked();
			},
			error: function(data){
				alert("error occurred");
			}	
		});
});

//詳細表示
function makeAccordion(){
		$(function(){
				$('.accordion input[name="detail"]').click(function(){
						$(this).parent().next("ul").slideToggle();
						$(this).toggleClass("open");
				});
		});
}

function makeIsChecked(){
		$('#itemlist').find('input[type="checkbox"]').click(function(){
				var itemlength = $('#itemlist').find('input[type="checkbox"]').filter(":checked").length;
				if(itemlength > 0){
						$('#narrow').prop("disabled", false);
				}else{
						$('#narrow').prop("disabled", true);
				}
		});
}
