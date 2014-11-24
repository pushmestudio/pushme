{
	var org_elem = null;
	
	test("8つあるチェックボックスの1つにチェックが入っている場合、その1件に絞り込み", function(){
		org_elem = document.getElementById("datalist").cloneNode(true);
	
		document.getElementById("item0").checked = true;
		document.getElementById("narrow").disabed = false;
		document.getElementById("reset").disabled = true;

		narrowItems();
		
		var elem = document.getElementById("datalist");
		var children = elem.children;
		
		equal(elem.childElementCount, 1,"PASS!");
		equal(children[0].firstElementChild.id, "item0", "PASS!");
		equal(document.getElementById("narrow").disabled, true, "PASS!");
		equal(document.getElementById("reset").disabled, false, "PASS!");

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
		var children = elem.children;
		
		equal(elem.childElementCount, 4,"PASS!");
		equal(children[0].firstElementChild.id, "item1", "PASS!");
		equal(children[1].firstElementChild.id, "item2", "PASS!");
		equal(children[2].firstElementChild.id, "item4", "PASS!");
		equal(children[3].firstElementChild.id, "item6", "PASS!");
		equal(document.getElementById("narrow").disabled, true, "PASS!");
		equal(document.getElementById("reset").disabled, false, "PASS!");


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
		var children = elem.children;
		
		equal(elem.childElementCount, 8,"PASS!");
		equal(children[0].firstElementChild.id, "item0", "PASS!");
		equal(children[1].firstElementChild.id, "item1", "PASS!");
		equal(children[2].firstElementChild.id, "item2", "PASS!");
		equal(children[3].firstElementChild.id, "item3", "PASS!");
		equal(children[4].firstElementChild.id, "item4", "PASS!");
		equal(children[5].firstElementChild.id, "item5", "PASS!");
		equal(children[6].firstElementChild.id, "item6", "PASS!");
		equal(children[7].firstElementChild.id, "item7", "PASS!");
		equal(document.getElementById("narrow").disabled, true, "PASS!");
		equal(document.getElementById("reset").disabled, false, "PASS!");


	});
	
	var recovery = function(){
		var elem = document.getElementById("datalist");
		for(var i=elem.childNodes.length-1; i>=0; i--){
			elem.removeChild(elem.childNodes[i]);
		}
		elems = org_elem.children;
		for(var i=0; i<elems.length; i++){
			elem.appendChild(elems[i].cloneNode(true));
		}
	}

}