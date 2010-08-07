//http://localhost:8888/timetable/readModule.php?url=http://localhost:8888/timetable/m/cs2100.htm
var maxRipIndex = 12;
var ripIndex;
var autoStart = false;
function Ripper() {
	this.url = '';
	this.sPage = '';
};

Ripper.prototype.testApplication = function() {
	if (! autoStart) this.start();
	autoStart = true;
};

Ripper.prototype.start = function() {
	
	//checking if one of them is not blank
	var proceed = false;
	for (ri=1;ri<=maxRipIndex;ri++) {
		if ($('#code'+ri).val() != ''){ //not empty
			proceed = true; break;
		}
	}
	if (proceed) {
		$('#ripButton').val('Waiting...').mouseup(function() { return false; });
		$('#nextButton').hide();
		for (i=1;i<=maxRipIndex;i++) {
			if ($('#code'+i).val() != '') $('#img'+i).attr('src', imgLoader.src);
		}
		
		//start ripping.
		ripIndex = 1;
		tt.module = new Array();
		ripper.rip();
	}
};

Ripper.prototype.rip = function() {
	//url pattern:
	//https://sit.aces01.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?acad_y=2007/2008&sem_c=2&mod_c=AR9999
	var code = $('#code'+ripIndex).val().toUpperCase();
	var ay = $('#ay').val();
	var semester = $('#semester').val();
	
	//if (!debug) {
		var url = 'https://aces01.nus.edu.sg/cors/jsp/report/ModuleDetailedInfo.jsp?acad_y=';
		url += ay + '&sem_c=' + semester + '&mod_c=' + code;
	/*}else{
		var url = 'http://localhost:8888/timetable/m/';
		url += code + '.htm';
	}*/
	
	//give ripper's url to current url
	this.url = url;
	if (code != ''){ //if not empty, do ripping
		$.get(this.url, (function(_ripper) { return function(data) {
			if (data.indexOf("Module Detailed Information for") != -1) {
				// set the sPage
				_ripper.sPage = data;
				_ripper.$page = $(data);
				_ripper.getModule();
				$('#img'+ripIndex).attr('src',imgOK.src);
			}else{
				$('#img'+ripIndex).attr('src',imgError.src);
			}
			_ripper.ripNext();
		}})(this));
	} else {
		$('#img'+ripIndex).attr('src', imgBlank.src);
		this.ripNext();
	}
};

Ripper.prototype.getModule = function () {
  /** All regex into XPath / jQuery selectors **/
  /** Benchmark speed? **/
  // var $moduleInfoTable = $("table:first>tbody>tr:eq(1)>td>table>tbody>tr:eq(2)>td>table>tbody", this.$page);
	var $moduleInfoTable = $("table.tableframe:eq(0)", this.$page);
	
	//ripping module code
	var moduleCode =
    $("tr:eq(1)>td:eq(1)", $moduleInfoTable).text().trim();
	var url = this.url;
	
	//exam day
	//	var examDate = 'No exam'; // Now it's just "No Exam Date."
	var examDate =
		$("tr:eq(5)>td:eq(1)", $moduleInfoTable).text().trim().replace(/\s+(A|P)M$/, "");
	
	//ripping lecture, tutorial and laboratory.
	var arrLecture = this.ripLecture();
	var arrTutorial = new Array();
	var arrLaboratory = new Array();
	var arrTutLab = this.ripTutorial();
	
	iT = 0; iL = 0;
	for (i=0;i<arrTutLab.length;i++) {
		if (arrTutLab[i].type == 'lab') arrLaboratory.push(arrTutLab[i]);
		if (arrTutLab[i].type == 'tut') arrTutorial.push(arrTutLab[i]);
	}
	
	//generating new module object
	oModule = new Module();
	oModule.code = moduleCode;
	oModule.link = url;
	oModule.exam = examDate;
	oModule.lecture = arrLecture;
	oModule.laboratory = arrLaboratory;
	oModule.tutorial = arrTutorial;
	
	tt.module.push(oModule);
};

Ripper.prototype.ripLecture = function() {
	
	var $lectureTable = $("table.tableframe:eq(0) ~ table:eq(0)", this.$page);

	arrLecture = new Array();
	
	// if (! /No Lecture Class/.test(this.sPage)) { //has lecture
		//ripping all the lectures
		$("table", $lectureTable).each(function() {
			sBlock = $("td", this).html();

			//splitting the arrblock, to get separated piece of data
			arrBlock = sBlock.split('<br>');
			title = arrBlock[0].trim().substring(3);
			
			//session manipulation
			nSession = Math.floor(arrBlock.length/2)-1;
			arrSession = new Array();
			for (i=0;i<nSession;i++) {
				phrase1 = arrBlock[i*2+1];
				phrase2 = arrBlock[i*2+2];
				arrCell = new Array();
				
				var res = /(\w+)\s+From\s+(\d+)\s+hrs\s+to\s+(\d+)\s+hrs\s+in\s+(.+),/.exec(phrase1);
				day = convertDay(res[1]);
				start = parseInt(res[2]);
				end = parseInt(res[3]);
				place = res[4];
				
				// test if number is half hour
				if ((start) % 100 != 0) {
					start = start - 30;
				}
				if ((end) % 100 != 0) {
					end = end + 30;
				}
				
				type = phrase2.indexOf("EVEN") != -1 ? 2 :
					phrase2.indexOf("ODD") != -1 ? 1 : 0;
				
				//pushing cells that this session will occupy
				for (t=start;t<end;t+=100) { arrCell.push('w'+day+'t'+t); }
				
				//creating the particular session object, and push into the lecture.
				oSession = new Session(day,start,end,type,place,arrCell);
				arrSession.push(oSession);	
			}//end of session manipulation
			
			//insert new lecture
			arrLecture.push(new Part(title, 'lec', arrSession));
		});

	// }//end if
		
	return arrLecture;
};

Ripper.prototype.ripTutorial = function() {

	var $tutorialTable = $("table.tableframe:eq(0) ~ table:eq(1)", this.$page);
	
	arrTutorial = new Array();
	
	// if (! /No Tutorial Class/.test(this.sPage)) { //has tutorial
		//ripping all the tutorials
		$("table", $tutorialTable).each(function() {
			sBlock = $("td", this).html();

			//splitting the arrblock, to get separated piece of data
			arrBlock = sBlock.split('<br>');
			title = arrBlock[0].trim().substring(3);
			
			//tutorial type
			tutType = title.indexOf("LABORATORY") != -1 ? 'lab' : 'tut';
			
			//session manipulation
			nSession = Math.floor(arrBlock.length/2)-1;
			arrSession = new Array();
			for (i=0;i<nSession;i++) {
				phrase1 = arrBlock[i*2+1];
				phrase2 = arrBlock[i*2+2];
				arrCell = new Array();

				var res = /(\w+)\s+From\s+(\d+)\s+hrs\s+to\s+(\d+)\s+hrs\s+in\s+(.+),/.exec(phrase1);
				day = convertDay(res[1]);
				start = parseInt(res[2]);
				end = parseInt(res[3]);
				place = res[4];
				
				type = phrase2.indexOf("EVEN") != -1 ? 2 :
					phrase2.indexOf("ODD") != -1 ? 1 : 0;

				//pushing cells that this session will occupy
				for (t=start;t<end;t+=100) { arrCell.push('w'+day+'t'+t); }
				
				//creating the particular session object, and push into the tutorial
				oSession = new Session(day,start,end,type,place,arrCell);
				arrSession.push(oSession);	
			}//end of session manipulation
			
			//insert new tutorial
			arrTutorial.push(new Part(title, tutType, arrSession));
		});

	// }//end if
		
	return arrTutorial;
};

Ripper.prototype.ripNext = function() {
       
	if (++ripIndex <= maxRipIndex) {
		ripper.rip();
	} else {
		$('#ripButton').val('Re-Scan All').mouseup(ripper.start);
		if (tt.module.length > 0){
			//show NEXT button if module>0
			$("#nextButton").show();
		}
		if (autoStart) {
			tt.createTable();tt.createAllNode();st.showSetFunctions();showPage3();
			setTimeout("alert('Here you are. Happy testing! :)')", 900);
		}
	}
	
};

function convertDay(str) {
	return {'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
	'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7}[str];
};
