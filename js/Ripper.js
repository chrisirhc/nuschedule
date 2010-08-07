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
		request('readModule.php?url='+escape(this.url));
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
	
	var $lectureTable = $("table.tableframe:eq(1)", this.$page);

	arrLecture = new Array();
	
	// if (! /No Lecture Class/.test(this.sPage)) { //has lecture
		//ripping all the lectures
		$("table", $lectureTable).each(function() {
			sBlock = $("td", this).html();

			//splitting the arrblock, to get separated piece of data
			arrBlock = sBlock.split('<br>');
			title = arrBlock[0].trim();
			
			//session manipulation
			nSession = Math.floor(arrBlock.length/2)-1;
			arrSession = new Array();
			for (i=0;i<nSession;i++) {
				phrase1 = arrBlock[i*2+1];
				phrase2 = arrBlock[i*2+2];
				arrCell = new Array();
				
				/(\w+) From (\d+) hrs to (\d+) hrs in (.+),/.test(phrase1);
				day = convertDay(RegExp.$1);
				start = parseInt(RegExp.$2);
				end = parseInt(RegExp.$3);
				place = RegExp.$4;
				
				// test if number is half hour
				if ((start) % 100 != 0) {
					start = start - 30;
				}
				if ((end) % 100 != 0) {
					end = end + 30;
				}
				
				if (/.*EVEN.*/.test(phrase2)) type = 2;
				else if (/.*ODD.*/.test(phrase2)) type = 1;
				else type = 0;
				
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

	var $tutorialTable = $("table.tableframe:eq(2)", this.$page);
	
	arrTutorial = new Array();
	
	// if (! /No Tutorial Class/.test(this.sPage)) { //has tutorial
		//ripping all the tutorials
		$("table", $tutorialTable).each(function() {
			sBlock = $("td", this).html();

			//splitting the arrblock, to get separated piece of data
			arrBlock = sBlock.split('<br>');
			title = arrBlock[0].trim();
			
			//tutorial type
			if (/LABORATORY/.test(title)) tutType = 'lab';
			else tutType = 'tut';
			
			//session manipulation
			nSession = Math.floor(arrBlock.length/2)-1;
			arrSession = new Array();
			for (i=0;i<nSession;i++) {
				phrase1 = arrBlock[i*2+1];
				phrase2 = arrBlock[i*2+2];
				arrCell = new Array();

				/(\w+) From (\d+) hrs to (\d+) hrs in (.+),/.test(phrase1);
				day = convertDay(RegExp.$1);
				start = parseInt(RegExp.$2);
				end = parseInt(RegExp.$3);
				place = RegExp.$4;
				
				if (/.*EVEN.*/.test(phrase2)) type = 2;
				else if (/.*ODD.*/.test(phrase2)) type = 1;
				else type = 0;
				
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
            document.getElementById('nextButton').style.display='inline'; //show NEXT button if module>0
        }
		if (autoStart) {
			tt.createTable();tt.createAllNode();st.showSetFunctions();showPage3();
			setTimeout("alert('Here you are. Happy testing! :)')", 900);
		}
	}
	
};

function convertDay(str) {
	if (str == 'MONDAY') return 1;
	else if (str == 'TUESDAY') return 2;
	else if (str == 'WEDNESDAY') return 3;
	else if (str == 'THURSDAY') return 4;
	else if (str == 'FRIDAY') return 5;
	else if (str == 'SATURDAY') return 6;
	else if (str == 'SUNDAY') return 7;
};

function request(url) {
	$.get(url, function(data) {
		if (/Module Detailed Information for/i.test(data)) {
			ripper.sPage = data;
			ripper.$page = $(data);
			ripper.getModule();
			$('#img'+ripIndex).attr('src',imgOK.src);
		}else{
			$('#img'+ripIndex).attr('src',imgError.src);
		}
		ripper.ripNext();
	});
};
