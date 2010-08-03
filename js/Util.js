if(!Array.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]==obj){
				return i;
			}
		}
		return -1;
	}
}

String.prototype.trim = function() { 
	var reExtraSpace = /^\s*(.*?)\s*$/; 
	return this.replace(reExtraSpace, "$1"); 
};

function createP(){
	return document.createElement('p');
};

function createDiv() {
	return document.createElement('div');
};
