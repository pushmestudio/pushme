{	var recovery = function(){
		var elem = document.getElementById("datalist");
		for(var i=elem.childNodes.length-1; i>=0; i--){
			elem.removeChild(elem.childNodes[i]);
		}
		for(var i=0; i<8; i++){
			var arrow = document.createElement("div");
			arrow.name = "arrow";
			var chkbox = document.createElement("input");
			chkbox.type = "checkbox";
			chkbox.name = "item";
			chkbox.id = "item"+i;
			elem.appendChild(arrow);
			elem.children[i].appendChild(chkbox);
		}
	}
	
	test("8つあるチェックボックスの1つにチェックが入っている場合、その1件に絞り込み", function(){
		document.getElementById("item0").checked = true;
		document.getElementById("narrow").disabed = false;
		document.getElementById("reset").disabled = true;

		narrowItems();
		
		var elem = document.getElementById("datalist");
		equal(elem.childElementCount, 1,"PASS!");
		
		var children = elem.children;
		equal(children[0].firstElementChild.id, "item0", "PASS!");
	});
	
	test("8つあるチェックボックスの4つ(2件連続、2件非連続)にチェックが入っている場合、その4件に絞り込み", function(){
		recovery();
		
		document.getElementById("item1").checked = true;
		document.getElementById("item2").checked = true;
		document.getElementById("item4").checked = true;
		document.getElementById("item6").checked = true;
		document.getElementById("narrow").disabed = false;
		document.getElementById("reset").disabled = true;
		
		narrowItems();
		
		var elem = document.getElementById("datalist");
		equal(elem.childElementCount, 4,"PASS!");
		
		var children = elem.children;
		equal(children[0].firstElementChild.id, "item1", "PASS!");
		equal(children[1].firstElementChild.id, "item2", "PASS!");
		equal(children[2].firstElementChild.id, "item4", "PASS!");
		equal(children[3].firstElementChild.id, "item6", "PASS!");

	});
	test("8つあるチェックボックスの全てにチェックが入っている場合、そのまま8件表示", function(){
		recovery();
		
		document.getElementById("item0").checked = true;
		document.getElementById("item1").checked = true;
		document.getElementById("item2").checked = true;
		document.getElementById("item3").checked = true;
		document.getElementById("item4").checked = true;
		document.getElementById("item5").checked = true;
		document.getElementById("item6").checked = true;
		document.getElementById("item7").checked = true;
		document.getElementById("narrow").disabed = false;
		document.getElementById("reset").disabled = true;
		
		narrowItems();
		
		var elem = document.getElementById("datalist");
		equal(elem.childElementCount, 8,"PASS!");
		
		var children = elem.children;
		equal(children[0].firstElementChild.id, "item0", "PASS!");
		equal(children[1].firstElementChild.id, "item1", "PASS!");
		equal(children[2].firstElementChild.id, "item2", "PASS!");
		equal(children[3].firstElementChild.id, "item3", "PASS!");
		equal(children[4].firstElementChild.id, "item4", "PASS!");
		equal(children[5].firstElementChild.id, "item5", "PASS!");
		equal(children[6].firstElementChild.id, "item6", "PASS!");
		equal(children[7].firstElementChild.id, "item7", "PASS!");


	});

}