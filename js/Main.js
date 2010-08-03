var reLink = /https:\/\/sit.aces01.nus.edu.sg\/cors\/jsp\/report\/ModuleDetailedInfo.jsp\?acad_y=(.+)&sem_c=(\d)&mod_c=(.+)/;
//var reLink = /http:\/\/localhost:8888\/timetable\/m\/(.+)/;


var tt = new TimeTable(); //controlling time table
var ripper = new Ripper();
var st = new Set();
var arrInterval = new Array();

var backgroundColor = ['#fc9','#cc9','#c9f','#f9f','#cfc','#9c9', '#99f', '#999', '#696', '#606', '#933', '#009'];
var fontColor = ['#000','#000','#000','#000','#000','#000','#000','#000','#000','#fff','#fff','#fff'];

if (document.images) {
	//status image, the ripper textboxes
	var imgError = new Image(); imgError.src = 'images/exclamation.png';
	var imgOK = new Image(); imgOK.src='images/accept.png';
	var imgLoader = new Image(); imgLoader.src = 'images/loader.gif';
	var imgBlank = new Image(); imgBlank.src = 'images/blank.gif';
	//setRow
	var imgSave = new Image(); imgSave.src = 'images/database_save.png';
	var imgLoad = new Image(); imgLoad.src = 'images/database_go.png';
	var imgDatabase = new Image(); imgDatabase.src = 'images/database.png';
	var imgReplace = new Image(); imgReplace.src = 'images/database_refresh.png';
	var imgRemove = new Image(); imgRemove.src = 'images/database_delete.png';
	//loading module
	var imgLoadModule = new Image(); imgLoadModule.src = 'images/module_load.gif';
};

function clearAllInterval(){
	for (i=0;i<arrInterval.length;i++){
		clearInterval(arrInterval.pop());
	}
	resetStatus();
};

var statusid = 0;
var standby = 'ready';
function status(str){
	oldElem = $('stat'+statusid);
	p = createP();
	p.innerHTML = str;
	p.id = 'stat' + (++statusid);
	p.setAttribute('onclick','clearAllInterval()');
	p.setAttribute('title', 'stuck? Click the status until it fixes itself');
	if (str == standby) p.setAttribute('style', '');
	else p.setAttribute('style', 'color:#e30');
	replaceElem(p, oldElem);	
	opacity(p.id, 0, 100, 100);
};

function resetStatus() {
	status(standby);
};

function replaceElem(newElem, oldElem, timeout) {

	if (timeout) {
		setTimeout(function(){
			oldElem.parentNode.replaceChild(newElem, oldElem);
		}, timeout);
	}else{
		oldElem.parentNode.replaceChild(newElem, oldElem);
	}
};

function leaveComment(){
	commentBody = $('comment_body');
	commentLink = $('comment_link');
	if (commentBody.style.display == 'block') {
		opacity(commentBody.id, 100, 0, 100);
		opacity(commentLink.id, 100, 0, 100);
		setTimeout(function(){
			commentBody.style.display = 'none';
			opacity(commentLink.id, 0, 100, 100); //show back
			commentLink.innerHTML = '<img src="images/comment.png" alt="icon" />Leave comments';
		}, 100);
	}else{
		commentBody.style.display = 'block';
		commentLink.innerHTML = '<img src="images/cross.png" alt="icon" />Close';
		opacity(commentBody.id, 0, 100, 100);
		opacity(commentLink.id, 0, 100, 100);
		$('comment_name').focus();
	}
	
};

function sendComment(){
	commentName = $('comment_name');
	commentEmail = $('comment_email');
	commentContent = $('comment_content');
	
	if (commentName.value.trim() == '') {
		commentName.style.borderColor = '#f33';
		return;
	}
	if (commentEmail.value.trim() == '') {
		commentEmail.style.borderColor = '#f33';
		return;
	}
	if (commentContent.value.trim() == '') {
		commentContent.style.borderColor = '#f33';
		return;
	}
	
	str = 'name='+commentName.value+'&email='+commentEmail.value+'&content='+commentContent.value;
	
	xmlhttp = createxmlhttp();
	xmlhttp.open("POST", 'sendEmail.php', true);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"); 
	xmlhttp.onreadystatechange = function() { 
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) { 
			p = xmlhttp.responseText;
			commentFeedback = $('comment_feedback');
			commentBody = $('comment_body');
			commentLink = $('comment_link');
			
			commentFeedback.innerHTML = (p == 'success') ? '<p>Comment sent!</p>':'<p style="color:red">Fail to send, please try again</p>';
			commentBody.style.display = 'none';
			commentLink.style.display = 'none';
			commentFeedback.style.display = 'block';
			opacity(commentFeedback.id, 0, 100, 100);
			setTimeout(function(){
				commentFeedback.style.display = 'none';
				commentLink.style.display = 'block';
				opacity(commentLink.id, 0, 100, 100); //show back
				commentLink.innerHTML = '<img src="images/comment.png" alt="icon" />Leave comments';
			}, 2000);
			commentContent.value = '';
		}
	};
	xmlhttp.send(str);
	xmlreq = new CXMLReq('', xmlhttp);
	xmlreqs.push(xmlreq);
};

function showPage2() {
	opacity('page1',100,0,500);
	setTimeout("removeElem('page1')", 600);
	setTimeout("revealElem('page2')", 700);
	page2_addBoxes();
};

function showPage3() {
	opacity('page2',100,0,500);
	setTimeout("removeElem('page2')", 600);
	setTimeout("revealElem('page3')", 600);
	setTimeout("revealElem('master')",600);	
};

function page2_addBoxes() {
	elemBox = document.getElementById('boxes');
	
	for (i=1;i<=maxRipIndex;i++) {
		
		div = document.createElement('div');
		h1 = document.createElement('h1');
		p = document.createElement('p');
		input = document.createElement('input');
		img = document.createElement('img');
		
		h1.innerHTML = 'Module '+i;
				
		input.setAttribute('type', 'text');
		input.setAttribute('maxlength','10');
		input.id='code'+i;
		input.className = 'txtbox';
		
		img.src = imgBlank.src;
		img.id = 'img'+i;
		
		p.appendChild(input);
		div.appendChild(img); //must be first to be appended, coz floating
		div.appendChild(h1);
		div.appendChild(p);
		elemBox.appendChild(div);
	}
	
};

function removeElem(elemId, timeout) {
	document.getElementById('page').removeChild(document.getElementById(elemId));
};

function revealElem(elemId) {
	document.getElementById(elemId).style.display = 'block';
};

function opacity(id, opacStart, opacEnd, millisec) { 
    //speed for each frame
    var speed = Math.round(millisec / 100); 
    var timer = 0; 

    //determine the direction for the blending, if start and end are the same nothing happens 
    if(opacStart > opacEnd) { 
        for(i = opacStart; i >= opacEnd; i--) { 
            setTimeout("changeOpac(" + i + ",'" + id + "')",(timer * speed)); 
            timer++; 
        } 
    } else if(opacStart < opacEnd) { 
        for(i = opacStart; i <= opacEnd; i++) 
            { 
            setTimeout("changeOpac(" + i + ",'" + id + "')",(timer * speed)); 
            timer++; 
        } 
    }
};

//change the opacity for different browsers 
function changeOpac(opacity, id) {
	object = document.getElementById(id);
	if (object) {
		object = object.style;
	    object.opacity = (opacity / 100); 
	    object.MozOpacity = (opacity / 100); 
	    object.KhtmlOpacity = (opacity / 100); 
	    object.filter = "alpha(opacity=" + opacity + ")";
	}
};

function test(str){
	document.getElementById('tester').innerHTML = str;
};

function testp(str){
	document.getElementById('tester').innerHTML += str;
};
