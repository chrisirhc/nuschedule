var cellWidth = 55;
var cellHeight = 40;

function TimeTable() {
	
	this.module = new Array();
	this.fixedArray = new Array();
	this.onTableArray = new Array(); //it's nothing much to do with timetable. just for cookie usage.
	
	//initialize the arrCell, each cell consist of array of nodeid
	this.cell = new Array();
	this.resetTable();
	
	this.tempCell = new Array(); //monday to saturday, hence, 6.
	this.resetTempCell(); //reset it to 0 first.
	
};

TimeTable.prototype.resetTable = function() {
	this.cell = new Array(6);
	for (i=0;i<6;i++) {
		this.cell[i] = new Array(14);
		for (j=0;j<14;j++) {
			this.cell[i][j] = [0,0,0,0,0,0,0,0,0,0,0,0]; //12 tabs maximum...although.. hmm
		}
	}
	this.fixedArray = new Array();
	this.onTableArray = new Array();
};

TimeTable.prototype.createTable = function() {
	
	elemMaster = document.getElementById('master');
	
	//cell manipulation
	elemTable = document.createElement('div');
	elemTable.setAttribute('id', 'tableMaster');
	
	for (i=0;i<6;i++) {
		for (j=0;j<14;j++) {
			var elemCell = document.createElement('div');
			elemCell.setAttribute('id', 'w' + (i+1) + 't' + (j*100+800));
			elemCell.setAttribute('style', 'width:'+(cellWidth-2)+'px;height:'+(cellHeight-2)+'px;top:'+(i*cellHeight+(i+1)*24)+'px;left:'+(j*cellWidth+j)+'px;');
			elemCell.className = 'cell';
			elemCell.innerHTML = j*100+800;
			elemTable.appendChild(elemCell);
		}
	}
	elemMaster.appendChild(elemTable);
};

TimeTable.prototype.createAllNode = function(fixedArray, onTableArray) {
	
	//cell = tabbing info
	//fixedarray = array of nodes which indicate 'fixed'
	//onTablearray = array of nodes which indicate 'on table'
	
	//since this 'createAllNode' is use by both when node has been created and not created
	//so it's necessary to check the nodeMaster has been set or not
	
	elemNodeMaster = document.getElementById('nodeMaster');
	
	if (! elemNodeMaster) { //if not set, create those elements
		elemMaster = document.getElementById('master');
		elemNodeMaster = document.createElement('div');
		elemNodeMaster.setAttribute('id', 'nodeMaster');
		elemTempNodeMaster = document.createElement('div');
		elemTempNodeMaster.setAttribute('id', 'tempNodeMaster');
		elemModuleViewer = document.createElement('moduleViewer');
		elemModuleViewer.setAttribute('id','moduleViewer');
		elemMaster.appendChild(elemNodeMaster);
		elemMaster.appendChild(elemTempNodeMaster);
		elemMaster.appendChild(elemModuleViewer);
	}
	
	if (typeof onTableArray == 'object') { //if creating from a existing table
		document.getElementById('nodeMaster').innerHTML = '';
		this.createModuleViewer(fixedArray, onTableArray);
		this.resetTable();
		
		for (r=0; r<onTableArray.length;r++) {
			str = onTableArray[r];
			arr = str.split('_');
			modPos = parseInt(arr[0]);
			objPos = parseInt(arr[2]);
			type = arr[1];
			fixed = (fixedArray.indexOf(str) >= 0);
			switch(type) {
				case 'lec':
				this.createNode(this.module[modPos].code, this.module[modPos].lecture[objPos], modPos, objPos, fixed);
				break;
				case 'tut':
				this.createNode(this.module[modPos].code, this.module[modPos].tutorial[objPos], modPos, objPos, fixed);
				break;
				case 'lab':
				this.createNode(this.module[modPos].code, this.module[modPos].laboratory[objPos], modPos, objPos, fixed);
				break;
			}
		}
		//after doing the creating of node, then reset cell, to prevent erroneous
		
		//this.cell = cell;
		
	}else{
		//createModuleViewer
		this.createModuleViewer();

		//creating all nodes
		for (m=0;m<this.module.length;m++) {
			moduleCode = this.module[m].code;

			if (this.module[m].lecture.length > 0) {
				this.createNode(moduleCode, this.module[m].lecture[0], m, 0);
			}

			if (this.module[m].tutorial.length > 0) {
				this.createNode(moduleCode, this.module[m].tutorial[0], m, 0);
			}

			if (this.module[m].laboratory.length > 0) {
				this.createNode(moduleCode, this.module[m].laboratory[0], m, 0);
			}
		}
	}
	
};

//------------------------------------
// TimeTable - createModuleViewer
// parameter: [fixedArray, onTableArray]


TimeTable.prototype.createModuleViewer = function (fixedArray, onTableArray) {
	
	elemModuleViewer = document.getElementById('moduleViewer');
	elemModuleViewer.innerHTML = ''; //clear this out
	
	p = document.createElement('p');
	p.setAttribute('style','position:absolute;top:390px;left:25px;color:#f30;font-size:12px;');
	p.innerHTML = 'Take note of the exam date! It may be wrong due to outdated CORS Module Listing. Use this application only after CORS has updated it';
	elemModuleViewer.appendChild(p);
	
	hasArray = (typeof onTableArray != 'undefined');
	
	for (m=0;m<this.module.length;m++) {
		var top = Math.floor(m/6)*115+420;
		var left = (m%6)*130+25;
		elemModule = document.createElement('div');
		elemModule.className = 'module';
		elemModule.setAttribute('style','top:'+top+'px;left:'+left+'px;');
		
		innerHTML = '<div class="colorChooser" style="background-color:'+backgroundColor[m]+';"></div>';
		innerHTML += '<h5>'+this.module[m].code+'&nbsp;<small>'+this.module[m].exam+'</small></h5>';
		
		
		var t = 0; //use as padding lecture/tutorial/laboratory
		if (this.module[m].hasLecture()) {
			innerHTML += '<div style="position:relative">';
			for (n=0;n<this.module[m].lecture.length;n++) {
				if (this.module[m].lecture[n].session.length == 0) continue; //skip this object if no session found
				t = Math.floor(n / 6) * 17;
				l = n%6 * 21;
				/.+\[(.+)\]/.test(this.module[m].lecture[n].title); mat = RegExp.$1;
				sel = (n == 0) ? '_sel' : '';
				if (hasArray) sel = (onTableArray.indexOf(m+'_lec_'+n) >= 0) ? '_sel' : '';
				if (hasArray) sel = (fixedArray.indexOf(m+'_lec_'+n) >= 0) ? '_1' : sel;
				id = 'k_'+m+'_lec_'+n;
				innerHTML += '<div id="'+id+'" class="module_node'+sel+'" style="top:'+t+'px;left:'+l+'px;background-color:#eee;">'+mat+'</div>';
			}
			innerHTML += '</div>';
			t += 20;
		}
		padTop = t;
		if (this.module[m].hasTutorial()) {
			innerHTML += '<div style="position:relative">';
			for (n=0;n<this.module[m].tutorial.length;n++) {
				if (this.module[m].tutorial[n].session.length == 0) continue; //skip this object if no session found
				t = padTop + Math.floor(n / 6) * 17;
				l = n%6 * 21;
				/.+\[(.+)\]/.test(this.module[m].tutorial[n].title); mat = RegExp.$1;
				sel = (n == 0) ? '_sel' : '';
				if (hasArray) sel = (onTableArray.indexOf(m+'_tut_'+n) >= 0) ? '_sel' : '';
				if (hasArray) sel = (fixedArray.indexOf(m+'_tut_'+n) >= 0) ? '_1' : sel;
				id = 'k_'+m+'_tut_'+n;
				innerHTML += '<div id="'+id+'" class="module_node'+sel+'" style="top:'+t+'px;left:'+l+'px;background-color:#eec;">'+mat+'</div>';
			}
			innerHTML += '</div>';
			t += 20;
		}
		padTop = t;
		if (this.module[m].hasLaboratory()) {
			innerHTML += '<div style="position:relative">';
			for (n=0;n<this.module[m].laboratory.length;n++) {
				if (this.module[m].laboratory[n].session.length == 0) continue; //skip this object if no session found
				t = padTop + Math.floor(n / 6) * 17;
				l = n%6 * 21;
				/.+\[(.+)\]/.test(this.module[m].laboratory[n].title); mat = RegExp.$1;
				sel = (n == 0) ? '_sel' : '';
				if (hasArray) sel = (onTableArray.indexOf(m+'_lab_'+n) >= 0) ? '_sel' : '';
				if (hasArray) sel = (fixedArray.indexOf(m+'_lab_'+n) >= 0) ? '_1' : sel;
				id = 'k_'+m+'_lab_'+n;
				innerHTML += '<div id="'+id+'" class="module_node'+sel+'" style="top:'+t+'px;left:'+l+'px;background-color:#cee;">'+mat+'</div>';
			}
			innerHTML += '</div>';
		}
		
		
		elemModule.innerHTML = innerHTML;
		
		elemModuleViewer.appendChild(elemModule);
	}
	
	
};

TimeTable.prototype.createNode = function(moduleCode, obj, modulePos, objPos, fixed) {
	
	//fixed is an optional parameter.
	//indicate whether the node is a fixed node. Prefix with f_
	//its tab will be prefixed with e_
	if (typeof fixed == 'undefined') fixed = false;
	if (fixed) this.fixedArray.push(modulePos+'_'+obj.type+'_'+objPos);
	
	//add in onTableArray
	this.onTableArray.push(modulePos+'_'+obj.type+'_'+objPos);
	
	//obj should be the lecture/tutorial/laboratory
	//to know their id, simply, obj.session[i].cell[i].
	
	elemNodeMaster = document.getElementById('nodeMaster');
	elemSubNode = document.createElement('div');
	
	for (i=0;i<obj.session.length;i++) {
		
		sessionLength = obj.session[i].cell.length;
		startingCell = obj.session[i].cell[0];
		
		title = this.shortenTitle(obj.title);
		innerHTML = '<b>'+moduleCode + '</b><br/>' + title+'<br/>'+obj.session[i].place;
			
		//getting left and top of the node, by refering to the starting cell id
		elem = document.getElementById(startingCell);
		t = parseInt(elem.style.top)+1;
		l = parseInt(elem.style.left)+1;
		w = cellWidth*sessionLength - (10-sessionLength);
		h = cellHeight-6;
		
		//node id, is the id of all occupied id, and the some other info.
		//example: n_0_lab_2_w1t800 (starting cell only, to differentiate with another session)
		
		nodeId = (fixed) ? 'f_' : 'n_';
		nodeId += modulePos+'_'+obj.type+'_'+objPos+'_'+obj.session[i].cell[0];
		//for (s=0;s<sessionLength;s++) {
		//	nodeId += '_' + obj.session[i].cell[s];
		//}
		
		elemNode = document.createElement('div');
		elemNode.className = (fixed) ? 'fixedNode' : 'node';
		elemNode.setAttribute('id',nodeId);
		elemNode.setAttribute('style', 'left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;background-color:'+backgroundColor[modulePos]+';color:'+fontColor[modulePos]);
		elemNode.innerHTML = innerHTML;
		
		//SKIP TABBING IF FIXED!! :)
		if (! fixed) {
			this.signupTab(startingCell, 'n_'+modulePos+'_'+obj.type+'_'+objPos);
			tabNumber = this.getTab(startingCell, 'n_'+modulePos+'_'+obj.type+'_'+objPos) + 1;		
			tabTop = (tabNumber > 3) ? parseInt(t)+cellHeight : t-10;
			tabLeft = (tabNumber > 3) ? parseInt(l)+19*(tabNumber-4) : parseInt(l)+19*(tabNumber-1);

			//tabid: m_0_lab_1
			tabId = (fixed) ? 'e_' : 'm_';
			tabId += modulePos+'_'+obj.type+'_'+objPos+'_'+i;
			elemTab = document.createElement('div');
			elemTab.className = (fixed) ? 'fixedNodeTab' : 'tab';
			elemTab.setAttribute('id',tabId);
			elemTab.setAttribute('style', 'left:'+tabLeft+'px;top:'+tabTop+'px;width:17px;height:10px;background-color:'+backgroundColor[modulePos]);
			elemSubNode.appendChild(elemTab);
		}
		
		subNodeId = 's_'+modulePos+'_'+obj.type+'_'+objPos;
		elemSubNode.className = 'subNode';
		elemSubNode.setAttribute('id', subNodeId);
		elemSubNode.appendChild(elemNode);
	}
	elemNodeMaster.appendChild(elemSubNode);
};

TimeTable.prototype.showNode = function(moduleCode, obj, modulePos, objPos) { //modulePos and objPos? for tabbing purpose (tabid)
	
	//arr should be the lecture/tutorial/laboratory
	//to know their id, simply, arr.session[i].cell[i].
	elemTempNodeMaster = document.getElementById('tempNodeMaster');
	elemSubNode = document.createElement('div');
	
	//if the obj is fixed, why show? just skip all.
	if (this.fixedArray.indexOf(modulePos+'_'+obj.type+'_'+objPos) >= 0) return;
	
	for (i=0;i<obj.session.length;i++) {
				
		sessionLength = obj.session[i].cell.length;
		startingCell = obj.session[i].cell[0];
		
		//since the nodes are created randomly, so some of the cells might be overlapped by previous time
		//like, 800-1000 class might overlap a class from 900-1000.
		//so, rip out the cell position, and give them zIndex.
		startingTime = parseInt(startingCell.substring(3,startingCell.length));
		zIndex = Math.floor(startingTime/100); //floor it, to prevent some malfunction startingtime occur.
		
		/\[(.+)\]/.test(obj.title);
		classNumber = RegExp.$1;
		innerHTML = '<b>'+moduleCode + '</b><br/>'+this.shortenTitle(obj.title)+'<br/>'+obj.session[i].place;
			
		//getting left and top of the node, by refering to the starting cell id
		elem = document.getElementById(startingCell);
		t = parseInt(elem.style.top)+1;
		l = parseInt(elem.style.left)+1;
		w = cellWidth*sessionLength - (7-sessionLength);
		h = cellHeight-6;
		
		//tabid: b_moduleid_type_objid_cellid
		//tabid: b_0_lab_1_1
		nodeId = 'b_'+modulePos+'_'+obj.type+'_'+objPos+'_'+i;
		elemNode = document.createElement('div');
		elemNode.className = 'tempNode';
		elemNode.setAttribute('id',nodeId);
		elemNode.setAttribute('style', 'left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;z-index:'+zIndex);
		elemNode.innerHTML = innerHTML;
		
		//for tabbing purpose, a cell should be marked into signuptempcell
		//as it will help adjusting the tab left position. tempCell is resetted everytime
		//the user release the mouse.
		this.signupTempCell(startingCell);
		tabNumber = this.getTempCell(startingCell);

		tabTop = (tabNumber > 3) ? parseInt(t)+cellHeight : t-10;
		tabLeft = (tabNumber > 3) ? parseInt(l)+19*(tabNumber-4) : parseInt(l)+19*(tabNumber-1);
		
		//tabid: t_moduleid_type_objid_sessionid
		//tabid: t_0_lab_1_1
		tabId = 't_'+modulePos+'_'+obj.type+'_'+objPos+'_'+i;
		elemTab = document.createElement('div');
		elemTab.className = 'tempTab';
		elemTab.innerHTML = classNumber;
		elemTab.setAttribute('id',tabId);
		elemTab.setAttribute('style', 'left:'+tabLeft+'px;top:'+tabTop+'px;width:17px;height:10px;');
		
		elemSubNode.appendChild(elemNode);
		elemSubNode.appendChild(elemTab);
		elemTempNodeMaster.appendChild(elemSubNode);
	}
};

TimeTable.prototype.swapNode = function(targetNode, oldNode, fixed) {
	
	//removing old node first
	arrElemId = oldNode.attr('id').split('_');
	elemId = 's_'+arrElemId[1]+'_'+arrElemId[2]+'_'+arrElemId[3];
	$('#'+elemId).remove();
		
	//fixed is an optional parameter.
	//indicate whether the node is a fixed node.
	if (typeof fixed == 'undefined') fixed = false;
	
	//insert a new node
	arrT = targetNode.attr('id').split('_');
	mid = parseInt(arrT[1]);
	type = arrT[2];
 	oid= parseInt(arrT[3]);
	if (type == 'lec') this.createNode(this.module[mid].code, this.module[mid].lecture[oid], mid, oid, fixed );
	if (type == 'tut') this.createNode(this.module[mid].code, this.module[mid].tutorial[oid], mid, oid, fixed );
	if (type == 'lab') this.createNode(this.module[mid].code, this.module[mid].laboratory[oid], mid, oid, fixed );

};

TimeTable.prototype.shortenTitle = function(title) {
	if (/LECTURE Class \[(.+)\]/.test(title)) {
		title = 'LEC ['+RegExp.$1+']';
	}else if (/SECTIONAL TEACHING Class \[(.+)\]/.test(title)) {
		title = 'LEC ['+RegExp.$1+']';
	}else if (/DESIGN TUTORIAL Class \[(.+)\]/.test(title)) {
		title = 'D. TUT ['+RegExp.$1+']';
	}else if (/TUTORIAL Class \[(.+)\]/.test(title)) {
		title = 'TUT ['+RegExp.$1+']';
	}else if (/LABORATORY Class \[(.+)\]/.test(title)) {
		title = 'LAB ['+RegExp.$1+']';
	}
	return title;
};

TimeTable.prototype.unmark = function (obj, nodeId) { //take in a Part object
	
	//convert nodeId (s_0_lec_0) to n_0_lec_0
	nodeId = 'n'+nodeId.substring(1,nodeId.length);
	
	for (u=0;u<obj.session.length;u++) { //loop through
		firstCell = obj.session[u].cell[0]; //Like: w1t800
		
		//rip out the col and row
		theWeek = parseInt(firstCell.substring(1,2));
		theTime = parseInt(firstCell.substring(3,firstCell.length));
		col = Math.floor(theTime/100)-8;
		row = theWeek-1;
		
		//removing the nodeId (n_0_lec_0) from the array cell by marking 0 on it.
		indexOfId = this.cell[row][col].indexOf(nodeId);
		this.cell[row][col][indexOfId] = 0;
	}
};

TimeTable.prototype.removeNode = function(node) {
	
	//coz swapNode is used by both k_ and s_
	//so it is better to convert node.id to s_ before remove
	if (typeof node == 'undefined') return '';
	nodeId = 's'+node.attr('id').substring(1);
	node = document.getElementById(nodeId);
	if (node) {
		
		//check whether it is a fixed node. If yes, remove from the fixedArray
		pos = this.fixedArray.indexOf(node.id.substring(2,node.id.length));
		if (pos >= 0) this.fixedArray.splice(pos,1);
		
		//remove from onTableArray
		pos = this.onTableArray.indexOf(node.id.substring(2,node.id.length));
		if (pos >= 0) this.onTableArray.splice(pos,1);
		
		document.getElementById('nodeMaster').removeChild(node);

		//remove from this.cell
		arrOld = node.id.split('_'); //s_5_lec_0
		omid = parseInt(arrOld[1]);
		otype = arrOld[2];
		ooid = parseInt(arrOld[3]);
		if (otype == 'lec') this.unmark(this.module[omid].lecture[ooid], node.id);
		if (otype == 'tut') this.unmark(this.module[omid].tutorial[ooid], node.id);
		if (otype == 'lab') this.unmark(this.module[omid].laboratory[ooid], node.id);
	}
	
};

TimeTable.prototype.signupTempCell = function(id) {
	theWeek = parseInt(id.substring(1,2));
	theTime = parseInt(id.substring(3,id.length));
	col = Math.floor(theTime/100)-8;
	row = theWeek-1;
	this.tempCell[row][col]++;
};

TimeTable.prototype.getTempCell = function(id) {
	theWeek = parseInt(id.substring(1,2));
	theTime = parseInt(id.substring(3,id.length));
	col = Math.floor(theTime/100)-8;
	row = theWeek-1;
	return this.tempCell[row][col];
};

TimeTable.prototype.resetTempCell = function() {
	this.tempCell = new Array(6);
	for (i=0;i<6;i++) {
		this.tempCell[i] = new Array(14);
		for (j=0;j<14;j++) {
			this.tempCell[i][j] = 0;
		}
	}
};

//assign id (n_0_lec_0) into a free tab (0) by using id (w1t800) refering.
TimeTable.prototype.signupTab = function(id, nodeId) {
	theWeek = parseInt(id.substring(1,2));
	theTime = parseInt(id.substring(3,id.length));
	col = Math.floor(theTime/100)-8;
	row = theWeek-1;
	indexOfZero = this.cell[row][col].indexOf(0);
	this.cell[row][col][indexOfZero] = nodeId;
};

//return the tab location of nodeId by refering to id (w1t800);
TimeTable.prototype.getTab = function(id, nodeId) {
	theWeek = parseInt(id.substring(1,2));
	theTime = parseInt(id.substring(3,id.length));
	col = Math.floor(theTime/100)-8;
	row = theWeek-1;
	return this.cell[row][col].indexOf(nodeId);
};
