// Object for tracking time spent in sections of code easily
/*
ct = new CodeTimer();
ct.start('t1');
ct.start('t2');
setTimeout(function(){console.log('Stopping c1'); ct.stop('t1')}, 15);
setTimeout(function(){console.log('Stopping c2'); ct.stop('t2')}, 3750);
setTimeout(function(){console.log('Starting c1'); ct.start('t1')}, 150);
setTimeout(function(){console.log('Stopping c1 again'); ct.stop('t1')}, 150+1250);
*/
function CodeTimer() {
	this.sections = {}
}
CodeTimer.prototype.start = function(sectionname) {
	//console.log("CodeTimer starting:", sectionname);
	let sect = this.sections[sectionname];
	if (sect === undefined) {
		sect = {};
		sect.n = 0;
		sect.totaltime = 0;
	}
	if (sect.starttime != null) {
		// Error, already running
		return;
	}
	sect.starttime = new Date();
	sect.n += 1;
	this.sections[sectionname] = sect;
	return;
}
CodeTimer.prototype.stop = function(sectionname) {
	//console.log("CodeTimer stopping:", sectionname);
	let sect = this.sections[sectionname];
	if (sect === undefined) {
		// Error
		return;
	}
	if (sect.starttime === null) {
		// Error
		return;
	}
	sect.totaltime += ((new Date()) - sect.starttime) / 1000;
	sect.starttime = null;
	sect.avgtime = sect.totaltime / sect.n;
	this.sections[sectionname] = sect;
	return;
}
