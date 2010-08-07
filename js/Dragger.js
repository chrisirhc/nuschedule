var dragging = false;
var dragElem;
var iDiffX = 0;
var iDiffY = 0;

document.onmousedown = function(e) {
	e = (jQuery.browser.msie) ? window.event : e;
	targetElem = (jQuery.browser.msie) ? e.srcElement : e.target;
	if (targetElem.tagName == 'B') targetElem = targetElem.parentNode; //fix <B> problem in safari
	if (!targetElem.id) return;
	jObj = $('#'+targetElem.id); //work like $(this)
	
	
	//pressing nodes/tabs
	if (/(^m_|^n_)/.test(targetElem.id)) {
		dragElem = jObj.parent();
		dragElem.fadeTo(100,0.9);
		showAvailableCell();
		dragging = true;
		iDiffX = e.screenX;
		iDiffY = e.screenY;
	}
	
	//pressing module nodes
	if (/^k_/.test(targetElem.id)) {
		if (targetElem.className == 'module_node') {
			targetElem.className = 'module_node_sel';
			tt.swapNode(jObj, deselectOther(jObj));
		}else if(targetElem.className == 'module_node_sel') {
			targetElem.className = 'module_node_1';
			tt.swapNode(jObj, jObj, true); //swap itself, make it fixed
		}else{
			targetElem.className = 'module_node';
			tt.removeNode(jObj);
		}
	}
	
	switch(targetElem.tagName){
		case 'INPUT': case 'A': case 'TEXTAREA': case 'SELECT': case 'OPTION':
		break;
		default:
		return false;
	}
};

document.onmouseup = function(e) {
	targetElem = (jQuery.browser.msie) ? e.srcElement : e.target;
	if (targetElem.tagName == 'B') targetElem = targetElem.parentNode; //fix <B> problem in safari
	if (!targetElem.id) return;
	jObj = $('#'+targetElem.id); //work like $(this)
	
	if (dragging) {
		removeAvailableCell();
		dragElem.css('left','0px').css('top','0px').fadeTo(100,0.6);
	}
	
	dragging = false;
	
	if (/(^b_|^t_)/.test(targetElem.id)) {
		tt.swapNode(jObj, dragElem);
		deselectOther(jObj);
		selectNode(jObj);
	}
};

document.onmousemove = function(e) {
	//the dragging part
	if (jQuery.browser.msie) e = window.event;
	if (dragging) {
		dragElem.css('left', e.screenX-iDiffX+'px');
		dragElem.css('top', e.screenY-iDiffY+'px');
	}
};

document.onmouseover = function(e) {
	targetElem = (jQuery.browser.msie) ? e.srcElement : e.target;
	if (targetElem.tagName == 'B') targetElem = targetElem.parentNode; //fix <B> problem in safari
	if (!targetElem.id) return;
	jObj = $('#'+targetElem.id); //work like $(this)
	
	if (/(^b_|^t_)/.test(targetElem.id)) {
		jObj.siblings().andSelf().css('backgroundColor', '#a55').css('zIndex',30);
	}
}

document.onmouseout = function(e) {
	targetElem = (jQuery.browser.msie) ? e.srcElement : e.target;
	if (targetElem.tagName == 'B') targetElem = targetElem.parentNode; //fix <B> problem in safari
	if (!targetElem.id) return;
	jObj = $('#'+targetElem.id); //work like $(this)
	
	if (/(^b_|^t_)/.test(targetElem.id)) {
		jObj.siblings().andSelf().css('backgroundColor', '#555').css('zIndex',1);
	}
}

//taking any id, convert it into k_ prefixed id.
function convertK(elem) {
	arrElemId = elem.attr('id').split('_');
	elemId = 'k_'+arrElemId[1]+'_'+arrElemId[2]+'_'+arrElemId[3];
	return $('#'+elemId);
};

function selectNode(elem) {
	convertK(elem).attr('class','module_node_sel');
};

//change other nodes inside a moduleView to normal color
function deselectOther(elem) {
	return convertK(elem).siblings('.module_node_sel').attr('class','module_node');
};

function showAvailableCell() {
	tid = dragElem.attr('id'); //like: n_0_tut_1
	arrtid = tid.split('_');
	//rip
	md = parseInt(arrtid[1]); //module id
	type = arrtid[2]; //module type

	if (type == 'lec') {
		for (p=0;p<tt.module[md].lecture.length;p++) {
			tt.showNode(tt.module[md].code, tt.module[md].lecture[p], md, p);
		}
	}
	else if (type == 'tut') {
		for (p=0;p<tt.module[md].tutorial.length;p++) {
			tt.showNode(tt.module[md].code, tt.module[md].tutorial[p], md, p);
		}
	}
	else if (type == 'lab') {
		for (p=0;p<tt.module[md].laboratory.length;p++) {
			tt.showNode(tt.module[md].code, tt.module[md].laboratory[p], md, p);
		}
	}
};

function removeAvailableCell() {
	tempNodeMaster = document.getElementById('tempNodeMaster');
	while (tempNodeMaster.hasChildNodes()) {
		tempNodeMaster.removeChild(tempNodeMaster.lastChild);
	}
	tt.resetTempCell(); //important!!!
};
