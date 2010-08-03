function Set() {
	this.maxSlot = 3;
	
	this.ripModule = new Array();
	this.ripIndex = 0; //for ripping purpose, advance 1 by 1
	this.ripMax = 0; //hold the current number of modules
	this.fixedArray = new Array();
	this.onTableArray = new Array();
};

Set.prototype.load = function(setId){
	
	if (confirm('Confirm to load previously saved timetable to current table?\n\nCurrent timetable will be discarded')){
		setRowFunction = document.getElementById('setRow_function'+setId);
		$('#master').fadeOut(200);
		arrModule = this.getModuleInfo(setId);
		tt.module = new Array(); //reset tt.module
		this.ripIndex = 0;
		this.ripMax = arrModule.length;
		this.ripModule = arrModule;
		this.fixedArray = this.getFixedArray(setId);
		this.onTableArray = this.getOnTableArray(setId);
		this.rip(); //start ripping!
	}
	
};

Set.prototype.rip = function() {
	ripper.url = this.ripModule[this.ripIndex].split('z')[1];
	this.request('readModule.php?url='+escape(ripper.url));
};

Set.prototype.save = function(setId) {
	
	if (confirm('Save current timetable into slot #'+(setId+1)+'?')){
		this.saveCookie(setId);
		this.updateFunctions(setId);
	}
	
};

Set.prototype.remove = function(setId) {
	if (confirm('Remove slot #'+(setId+1)+' from cookie?')){
		this.removeCookie(setId);
		this.updateFunctions(setId);
	}
};

//rendering buttonssss...
Set.prototype.renderButton = function(imgsrc, onclick, title) {
	img = document.createElement('img');
	img.setAttribute('src', imgsrc);
	a = document.createElement('a');
	a.setAttribute('href','javascript://');
	a.setAttribute('onclick', onclick);
	a.setAttribute('title', title);
	a.appendChild(img);
	return a;
};
Set.prototype.aLoad = function(setId, arr) {
	return this.renderButton(imgLoad.src, 'st.load('+setId+')', 'load '+arr.join(', '));
};
Set.prototype.aReplace = function(setId) {
	return this.renderButton(imgSave.src, 'st.save('+setId+')', 'replace');
};
Set.prototype.aRemove = function(setId) {
	return this.renderButton(imgRemove.src, 'st.remove('+setId+')', 'remove');
};
Set.prototype.aSave = function(setId) {
	return this.renderButton(imgSave.src, 'st.save('+setId+')', 'save');
};

Set.prototype.updateFunctions = function(setId) {
	
	setRowFunction = document.getElementById('setRow_function'+setId);
	
	//remove all nodes first
	while(setRowFunction.hasChildNodes()) setRowFunction.removeChild(setRowFunction.lastChild);
	
	//render three buttons...
	arrModuleCode = this.readModuleCode(setId);
	if (arrModuleCode.length > 0) {
		setRowFunction.appendChild(this.aLoad(setId, arrModuleCode));
		setRowFunction.appendChild(this.aReplace(setId));
		setRowFunction.appendChild(this.aRemove(setId));
	}else{
		setRowFunction.appendChild(this.aSave(setId)); //and append a save button
	}
	
};

Set.prototype.renderSetRow = function(){
	var setRow = document.getElementById('setRow');
	table = document.createElement('table');
	tr = document.createElement('tr');
	for (i=0;i<this.maxSlot;i++) {
		td = document.createElement('td');
		img1 = document.createElement('img');
		img1.setAttribute('src', imgDatabase.src);
		span = document.createElement('span');
		span.id = 'setRow_function'+i;
		
		arrModuleCode = this.readModuleCode(i);
		if (arrModuleCode.length > 0) span.appendChild(this.aLoad(i, arrModuleCode));

		td.appendChild(img1); td.appendChild(span);
		tr.appendChild(td);
	}
	table.appendChild(tr);
	setRow.appendChild(table);
};

Set.prototype.showSetFunctions = function() {
	for (i=0;i<this.maxSlot;i++) {
		setRowFunction = document.getElementById('setRow_function'+i);
		if (setRowFunction.hasChildNodes()) { //contains a "load"
			setRowFunction.appendChild(this.aReplace(i));
			setRowFunction.appendChild(this.aRemove(i));
		}else{
			setRowFunction.appendChild(this.aSave(i));
		}
	}
};


Set.prototype.readModuleCode = function(setId) {
	arr = this.getModuleInfo(setId);
	if (typeof arr[0] == 'undefined' || arr[0] == '') return new Array();
	code = new Array();
	for (p=0;p<arr.length;p++) {
		code.push(arr[p].split('z')[0]);
	}
	return code;
};

Set.prototype.saveCookie = function(setId) {
	u = this.ripModuleInfo() + '-' + this.ripOnTableArray() + '-' + this.ripFixedArray();
	setCookie('module_set'+setId, u, new Date(Date.parse("Jan 1, 2010")));
};
Set.prototype.removeCookie = function(setId) {
	setCookie('module_set'+setId, '', new Date(Date.parse("Jan 1, 2010")));
};
//--------------------------
// ripping functions
//--------------------------

//rip module's code and its link
Set.prototype.ripModuleInfo = function() {
	str = '';
	for (i=0;i<tt.module.length;i++) {
		str += tt.module[i].code + 'z' + tt.module[i].link + 'x';
	}
	return str.substring(0,str.length-1); //remove last x
};

Set.prototype.getModuleInfo = function(setId) {
	str = getCookie('module_set'+setId);
	if (str == null) return new Array();
	str = str.split('-')[0]; //read from cookie
	return str.split('x');
};

Set.prototype.ripOnTableArray = function() {
	str = tt.onTableArray.join('.');
	str = str.replace(/_lec_/g, 'h');
	str = str.replace(/_tut_/g, 'o');
	str = str.replace(/_lab_/g, 'j');
	return str;	
};

Set.prototype.getOnTableArray = function(setId) {
	str = getCookie('module_set'+setId);
	if (str == null) return new Array();
	str = str.split('-')[1];
	str = str.replace(/j/g, '_lab_');
	str = str.replace(/o/g, '_tut_');
	str = str.replace(/h/g, '_lec_');
	return str.split('.');
};

//rip tt.fixedArray, return a string of 0l1.0b1..
Set.prototype.ripFixedArray = function() {
	str = tt.fixedArray.join('.');
	str = str.replace(/_lec_/g, 'h');
	str = str.replace(/_tut_/g, 'o');
	str = str.replace(/_lab_/g, 'j');
	return str;
};

//given str, unrip it into a fixedArray array
Set.prototype.getFixedArray = function(setId) {
	str = getCookie('module_set'+setId);
	if (str == null) return new Array();
	str = str.split('-')[2];
	str = str.replace(/j/g, '_lab_');
	str = str.replace(/o/g, '_tut_');
	str = str.replace(/h/g, '_lec_');
	return str.split('.');
};

/*
Set.prototype.compressNodeMaster = function(data) {

	data = data.replace(/\<div class="subNode" id="s_/g, 'za');
	data = data.replace(/_tut_/g, 'zb');
	data = data.replace(/"\>\<div class="tab" id="m_/g, 'zc');
	data = data.replace(/" style="left:/g, 'zd');
	data = data.replace(/px;top:/g, 'ze');
	data = data.replace(/px;width:/g, 'zf');
	data = data.replace(/px;height:/g, 'zg');
	data = data.replace(/px;background-color:#/g, 'zh');
	data = data.replace(/"\>\<\/div\>\<div class="node" id="n_/g, 'zi');
	data = data.replace(/;color:#/g, 'zk');
	data = data.replace(/"\>\<b\>/g, 'zl');
	data = data.replace(/\<\/b\>\<br\>/g, 'zm');
	data = data.replace(/ \[/g, 'zn');
	data = data.replace(/\]\<br\>/g, 'zo');
	data = data.replace(/\<\/div\>\<div class="tab" id="m_/g, 'zp');
	data = data.replace(/\<\/div\>\<\/div\>/g, 'zr');
	data = data.replace(/_lec_/g, 'zs');
	data = data.replace(/_lab_/g, 'zt');
	data = data.replace(/"\>\<div class="fixedNode" id="f_/g, 'zv');
	data = data.replace(/\<\/div\>\<div class="fixedNode" id="f_/g, 'zw');
	data = data.replace(/zk000zl/g, 'zx');
	data = data.replace(/\=/g, 'zy');
	data = data.replace(/\//g, 'ja');
	data = data.replace(/zmTUTzn/g, 'jb');
	data = data.replace(/zmLECzn/g, 'jc');
	data = data.replace(/zmLABzn/g, 'jd');
	data = data.replace(/zmD. TUTzn/g, 'je');
	return data;
}
Set.prototype.compressModuleViewer = function(data) {
	data = data.replace(/\<div class="module" style="top:/g, 'za');
	data = data.replace(/px;left:/g, 'zb');
	data = data.replace(/px;"\>\<div class="colorChooser" style="background-color:#/g, 'zc');
	data = data.replace(/;"\>\<\/div\>\<h5\>/g, 'zd');
	data = data.replace(/\<\/h5\>\<div style="position:relative"\>\<div id="k_/g, 'ze');
	data = data.replace(/" class="module_node_sel" style="top:/g, 'zf');
	data = data.replace(/px;background-color:#eec;"\>/g, 'zg');
	data = data.replace(/px;background-color:#eee;"\>/g, 'zh');
	data = data.replace(/px;background-color:#cee;"\>/g, 'zi');
	data = data.replace(/\<\/div\>\<div id="k_/g, 'zk');
	data = data.replace(/_tut_/g, 'zl');
	data = data.replace(/_lec_/g, 'zm');
	data = data.replace(/_lab_/g, 'zn');
	data = data.replace(/" class="module_node" style="top:/g, 'zo');
	data = data.replace(/\<\/div\>\<\/div\>\<\/div\>/g, 'zp');
	data = data.replace(/\<\/div\>\<\/div\>\<div style="position:relative"\>\<div id="k_/g, 'zr');
	data = data.replace(/" class="module_node_1" style="top:/g, 'zs');
	
	return data;
}
Set.prototype.decompressModuleViewer = function(data) {
	data = data.replace(/zs/g, '" class="module_node_1" style="top:');
	data = data.replace(/zr/g, '</div></div><div style="position:relative"><div id="k_');
	data = data.replace(/zp/g, '</div></div></div>');
	data = data.replace(/zo/g, '" class="module_node" style="top:');
	data = data.replace(/zn/g, '_lab_');
	data = data.replace(/zm/g, '_lec_');
	data = data.replace(/zl/g, '_tut_');
	data = data.replace(/zk/g, '</div><div id="k_');
	data = data.replace(/zi/g, 'px;background-color:#cee;">');
	data = data.replace(/zh/g, 'px;background-color:#eee;">');
	data = data.replace(/zg/g, 'px;background-color:#eec;">');
	data = data.replace(/zf/g, '" class="module_node_sel" style="top:');
	data = data.replace(/ze/g, '</h5><div style="position:relative"><div id="k_');
	data = data.replace(/zd/g, ';"></div><h5>');
	data = data.replace(/zc/g, 'px;"><div class="colorChooser" style="background-color:#');
	data = data.replace(/zb/g, 'px;left:');
	data = data.replace(/za/g, '<div class="module" style="top:');
	
	return data;
}
Set.prototype.decompressNodeMaster = function(data) {
	data = data.replace(/je/g, 'zmD. TUTzn');
	data = data.replace(/jd/g, 'zmLABzn');
	data = data.replace(/jc/g, 'zmLECzn');
	data = data.replace(/jb/g, 'zmTUTzn');
	data = data.replace(/ja/g, '/');
	data = data.replace(/zy/g, '=');
	data = data.replace(/zx/g, 'zk000zl');
	data = data.replace(/zw/g, '</div><div class="fixedNode" id="f_');
	data = data.replace(/zv/g, '"><div class="fixedNode" id="f_');
	data = data.replace(/zt/g, '_lab_');
	data = data.replace(/zs/g, '_lec_');
	data = data.replace(/zr/g, '</div></div>');
	data = data.replace(/zp/g, '</div><div class="tab" id="m_');
	data = data.replace(/zo/g, ']<br>');
	data = data.replace(/zn/g, ' [');
	data = data.replace(/zm/g, '</b><br>');
	data = data.replace(/zl/g, '"><b>');
	data = data.replace(/zk/g, ';color:#');
	data = data.replace(/zi/g, '"></div><div class="node" id="n_');
	data = data.replace(/zh/g, 'px;background-color:#');
	data = data.replace(/zg/g, 'px;height:');
	data = data.replace(/zf/g, 'px;width:');
	data = data.replace(/ze/g, 'px;top:');
	data = data.replace(/zd/g, '" style="left:');
	data = data.replace(/zc/g, '"><div class="tab" id="m_');
	data = data.replace(/zb/g, '_tut_');
	data = data.replace(/za/g, '<div class="subNode" id="s_');
	return data;
}
*/

Set.prototype.request = function(url) {
	$.get(url, function(data) {
		
		if (/Module Detailed Information for/i.test(data)) {
			ripper.sPage = data;
			ripper.getModule();
			if (++st.ripIndex < st.ripMax) {
				st.rip(); //continue ripping
			}else{
				$('#page1').fadeOut(300);
				$('#page2').fadeOut(300);
				
				setTimeout(function() {
					if (!document.getElementById('tableMaster')) {
						tt.createTable();
						st.showSetFunctions();
					}
					tt.createAllNode(st.fixedArray, st.onTableArray);
					$('#page3').fadeIn(200);
					$('#master').fadeIn(200);
				}, 500);
			}	
		}
	});
};


function setCookie(sName, sValue, oExpires, sPath, sDomain, bSecure) { 
	var sCookie = sName + "=" + encodeURIComponent(sValue);
	if (oExpires) { 
		sCookie += "; expires=" + oExpires.toGMTString(); 
	} 
	if (sPath) { 
		sCookie += "; path=" + sPath; 
	} 
	if (sDomain) { 
		sCookie += "; domain=" + sDomain; 
	} 
	if (bSecure) { 
		sCookie += "; secure"; 
	} 
	document.cookie = sCookie; 
};
function getCookie(sName) { 
	var sRE = "(?:; )?" + sName + "=([^;]*);?"; 
	var oRE = new RegExp(sRE); 
	if (oRE.test(document.cookie)) { 
		return decodeURIComponent(RegExp["$1"]); 
	} else { 
		return null; 
	} 
};
