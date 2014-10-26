//初期表示(全データ抽出->ランダム表示)
$(
function(){
		$.ajax({
			url: "getitems",
			type: "GET",
			success: function(data){
				result = '<form name="itemlist" class="pure-form pure-form-aligned">';
				result += '<div class="pure-g">';
				result += '<span class="accordion">';
				for(i = 0; i < Object.keys(data).length; i++){
				result += '<div name="arrow" class="pure-u-1 pure-u-md-1-4">';
				result += '<div name="card"><input type="checkbox" name="item" id="item' + i + '">';
			  result += '<div name="title"><label for="item' + i + '">' + data[i].title + '</label></div>';
			  result +=	'<div name="place" style="font-size: 12px;">アクセス: ' + data[i].place + '</div>';
				result += '<input type="button" name="detail" value="詳細"></div>';
			  result += '<ul>';
				result += '<li>カテゴリ:' + data[i].tag + '</li>';
				result += '<li>コメント:' + data[i].comment + '</li>';
				result += '<li>URL: <a href="' + data[i].image + '">' + data[i].image + '</a></li></ul></div>';
				}
				result += '</span></div></div>';
				result += '<input type="button" id="narrow" disabled="disabled" value="絞り込む" onclick="narrowItems()" class="pure-button pure-button-small">';
				result += '<input type="button" id="decide" value="最終決定" onclick="decideItem()" class="pure-button pure-button-small">';
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

//選択
$('#submitId').click(function(){
		var queryData = {"tag" : $('#queryId').val()};
		$.ajax({
			url: "getitemsbyquery",
			type: "POST",
			data: queryData,
			success: function(data){
				result = '<form name="itemlist2" class="pure-form pure-form-aligned">';
				result += '<div class="pure-g">';
				result += '<span class="accordion">';
				for(i = 0; i < Object.keys(data).length; i++){
				result += '<div name="arrow" class="pure-u-1 pure-u-md-1-4">';
				result += '<div name="card"><input type="checkbox" name="item" id="item' + i + '">';
			  result += '<div name="title"><label for="item' + i + '">' + data[i].title + '</label></div>';
			  result +=	'<div name="place" style="font-size: 12px;">アクセス: ' + data[i].place + '</div>';
				result += '<input type="button" name="detail" value="詳細"></div>';
			  result += '<ul>';
				result += '<li>カテゴリ:' + data[i].tag + '</li>';
				result += '<li>コメント:' + data[i].comment + '</li>';
				result += '<li>URL: <a href="' + data[i].image + '">' + data[i].image + '</a></li></ul></div>';
				}
				result += '</span></div></div>';
				result += '<input type="button" id="narrow" disabled="disabled" value="絞り込む" onclick="narrowItems()" class="pure-button pure-button-small">';
				result += '<input type="button" id="decide" value="最終決定" onclick="decideItem()" class="pure-button pure-button-small">';
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

function clipItem(){
/*    decision +='<form action="/addclip" method="post">';
				//decision += '<input type="button" value="クリップ" onclick="clipItem()">';
				//decision += '<input type="submit" value="クリップ">';
                test="aaaaaaa";
				decision += '<input type="submit" value="'+clipName[0]+'">';
				decision += "</form>";
				$('#decision').html(decision);
    '<input type="hidden" value="'+cn+'">'
*/
//
}

function narrowItems(){
		$('#narrow').prop("disabled", true);
	  itemlist = $('[name="item"]');
		itemlist.each(function(){
			if($(this).prop("checked")){
				$(this).prop("checked", false);
			} else {
				$(this).parents('div[name="arrow"]').remove();
			}
		});
}

/*
function decideItem(){
		itemlist = $('[name="item"]');
		decide = Math.floor(itemlist.length * Math.random());
		itemlist.each(function(i, value){
			if(i == decide){
				choice = $(this).nextAll('label').text();
				//var clipName = choice.substring(0,'(');
				var clipName = choice.split("(");
				decision = "<p>Your choice is : " + choice + "</p>";
				//お店の名前(title)を取得
				decision += '<form action="/addclip" method="post" class="pure-form">';
				//decision += '<input type="button" value="クリップ" onclick="clipItem()">';
				//decision += '<input type="submit" value="クリップ">';
				console.log("clipName: " + clipName[0]);
				decision += '<input type="hidden" id="id" name="name" value="'+clipName[0]+'">';
				decision += '<input type="submit" value="クリップする" class="pure-button pure-button-success">';
				decision += "</form>";
				$('#decision').html(decision);
			}
		});
}
*/

function decideItem(){
		$('#decide').prop("disabled", true);
		var itemlist = $('div[name="card"]');
		var i = 0;
		var count = 0;
		var random = 0;
		timerId = setInterval(function(){
				// itemlist.get(index)が返す値はjQuery ObjectではなくDOM Elementであるため、$()を使用してjQuery Objectに変換する必要がある
				$(itemlist.get(random)).animate({ backgroundColor: "#eeeeee", borderColor: "#0000ff" }, 100);
				random = Math.floor(itemlist.length * Math.random());
				$(itemlist.get(random)).animate({ backgroundColor: "#ffff77", borderColor: "#ffff77" }, 100);
				i++;
				if(i == 15){
						clearInterval(timerId);
						countId = setInterval(function(){
								$(itemlist.get(random)).fadeOut(300, function(){$(this).fadeIn(300)});
								count++;
								if(count == 5){
										clearInterval(countId);
								}
						}, 1000);
						//お店の名前(title)を取得
						decision = "";
						choice = $(itemlist.get(random)).children('div[name="title"]').text();
						console.log(choice);
						decision += '<form action="/addclip" method="post" class="pure-form">';
						decision += '<input type="hidden" id="id" name="name" value="' + choice + '">';
						decision += '<input type="submit" value="クリップする" class="pure-button pure-button-success">';
						decision += "</form>";
						$('#decision').html(decision);
				}
		}, 300)
}

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
