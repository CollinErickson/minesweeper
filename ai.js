function AImove1() {
	return AImovesguaranteed();
}
function AImovesguaranteed() {
	if (!gameisactive) {return 0;}
	let ng = AImove1guaranteed();
	let ns = ng;
	while (ng > .5) {
		ng = AImove1guaranteed();
		ns += ng;
		//console.log("new ng is", ng);
	}
	return ns;
}
function AImove1guaranteed() {
	// use visualboard[i][j].
	// 'f' is flagged, 'u' is unopened, number is num open
	if (!gameisactive) {return 0;}
	// Check for guaranteed moves
	let nmovesmade = 0;
	for (let i=0; i<nrow; i++) {
		for (let j=0; j < ncol; j++) {
			if (Number.isInteger(visualboard[i][j]) && visualboard[i][j] > 0.5) {
				let si = surrounding_indices(i,j);
				//let nbombssurround = get_nbombssurround(i,j);
				let nopennumberssurround = sum(si.map(x => Number.isInteger(visualboard[x[0]][x[1]])));
				let nflagssurround = sum(si.map(x => visualboard[x[0]][x[1]] == 'f'));
				let nunopenedsurround = sum(si.map(x => visualboard[x[0]][x[1]] == 'u'));
				let ncellssurround = si.length;
				// Only flags left to place
				if (nunopenedsurround > 0 && nopennumberssurround + visualboard[i][j] == ncellssurround) {
					//console.log("could place flags around", i, j);
					si.forEach(x => {if (visualboard[x[0]][x[1]] == 'u') {nmovesmade += 1; mark_bomb(x[0], x[1])}});
				}
				// Only cells to open
				if (nunopenedsurround > 0 && visualboard[i][j] == nflagssurround) {
					//console.log("could open cells around", i, j);
					si.forEach(x => {if (visualboard[x[0]][x[1]] == 'u') {nmovesmade += 1; square_click(x[0], x[1])}});
				}
			}
		}
	}
	//console.log('nmovesmade was', nmovesmade);
	return nmovesmade;
}
function sum(arr) {
	let x = 0;
	for (let i=0; i < arr.length; i++) {
		x += arr[i]
	}
	return x
}
function surrounding_indices(i,j) {
	let out = [];
	for (let di=-1; di<1.5; di++) {
		for (let dj=-1; dj<1.5; dj++) {
			if (!(di==0 && dj==0) && (i+di>=0) && (i+di<nrow) && (j+dj>=0) && (j+dj<ncol)) {
				out.push([i+di, j+dj]);
			}
		}
	}
	return out;
}
function get_ncellssurround(i,j) {
	
	let out = 0;
	for (let di=-1; di<1.5; di++) {
		for (let dj=-1; dj<1.5; dj++) {
			if (!(di==0 && dj==0) && (i+di>=0) && (i+di<nrow) && (j+dj>=0) && (j+dj<ncol)) {
				out += 1;
			}
		}
	}
	return out;
}
function mmm() {
	let mask = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,0], [0,1]];
	mask.map(x => visualboard[i+x[0]][j+x[1]]).toString();
	
	let reg = /121uuu/;
}
function bestguessisland(show=false) {
	if (!show) {if (!gameisactive) {return {success:false};}}
	// Find any opened square
	let a = null;
	let b = null;
	let foundstart = false;
	for (let i=0; i<nrow; i++) {
		for (let j=0; j<ncol; j++) {
			if (Number.isInteger(visualboard[i][j])) {
				a = i;
				b = j;
				foundstart = true;
				break;
			}
		}
		if (foundstart) {
			break;
		}
	}
	if (!foundstart) {
		console.log("bestguessisland failed to find starting point, no cells opened?");
		return {success:false};
	}
	let islandpoints = [];
	let islandbordernumberpoints = [];
	let waterpoints = [];
	
	// Keep queue of island points
	let pointstocheck = [[a,b]]
	let pointsalreadyvisited = new Map();
	// While queue still has points
	while (pointstocheck.length > 0) {
		// Get point
		let p = pointstocheck.pop();
		let i=p[0]; let j=p[1];
		//console.log("Got point p", p, i, j);
		
		// If point hasn't been check yet
		if (pointsalreadyvisited.get(p.toString()) === undefined) {
			// Add to island/water
			if (visualboard[i][j] == 'u') {
				waterpoints.push(p);
			} else {
				//islandpoints.push(p);
			}
			// Get neighbors
			let pneighbors = surrounding_indices(i, j);
			// Add neighbors to points to check if p is island (opened num, not flag)
			if (Number.isInteger(visualboard[i][j])) { // != 'u') {
				for (let k=0; k<pneighbors.length; k++) {
					pointstocheck.push(pneighbors[k]);
				}
			}
			// If p is water, add opened/flagged cells it touches to points to check
			// This makes it an archepelago, not an island
			if (visualboard[i][j] == 'u') {
				for (let k=0; k<pneighbors.length; k++) {
					if (visualboard[pneighbors[k][0]][pneighbors[k][1]] != 'u') {
						pointstocheck.push(pneighbors[k]);
					}
				}
			}
			// Store border island points that have numbers along with their neighbors.
			if (visualboard[i][j] != 'u' && visualboard[i][j] != 'f') { // Is a numbered square
				let numflagsleft = visualboard[i][j] - sum(pneighbors.map(x => visualboard[x[0]][x[1]] == 'f'));
				let surroundingwaterindices = pneighbors.filter(x => visualboard[x[0]][x[1]] == 'u');
				if (surroundingwaterindices.length > 0) {
					islandbordernumberpoints.push([p, numflagsleft, surroundingwaterindices]);
				}
			}
			// Add to points visited
			pointsalreadyvisited.set(p.toString(), true); //pneighbors);
		}
	}
	
	if (waterpoints.length == 0 || islandbordernumberpoints.length == 0) {
		console.log("Error in bestguessisland: no waterpoints or border points", waterpoints, islandbordernumberpoints);
		return {success:false};
	}
	//console.log("islandbordernumberpoints len is", islandbordernumberpoints.length, islandbordernumberpoints);
	
	
	// Estimate probabilities each waterpoint is a bomb
	// Loop over random samples
	let nvalid = 0;
	let nattempts = 0;
	//let pbomb = .3;
	//let pbombvec = waterpoints.map(x => 0.3);
	let pbombmap = new Map();
	let pbombeps0 = .05;
	let pbombeps = pbombeps0;
	let highestconf = 1;
	waterpoints.forEach(x => pbombmap.set(x.toString(), 0.3));
	while (nvalid < 100 && nattempts < 1000 && (nattempts<30 || highestconf > 0.05)) {
		//console.log("on attempt", nattempts, nvalid, pbomb);
		nattempts += 1;
		// Randomly assign bombs to the water
		// Put them in a hashmap
		let watermapisbomb = new Map();
		//waterpoints.map(x => Math.random() < pbomb);
		for (let k=0; k<waterpoints.length; k++) {
			//watermapisbomb.set(waterpoints[k].toString(), Math.random() < pbombvec[k]);
			watermapisbomb.set(waterpoints[k].toString(), Math.random() < pbombmap.get(waterpoints[k].toString()));
		}
		//console.log("watermapisbomb is", watermapisbomb);
		//waterpoints.forEach(x => {watermapisbomb.set(x.toString, Math.random() < pbomb)});
		// Check if it's valid
		let numlowexacthigh = [0,0,0];
		// Loop over each island border numbered point, check diff, update probs
		for (let k=0; k<islandbordernumberpoints.length; k++) {
			let ib = islandbordernumberpoints[k];
			let nwaterbombs = sum(ib[2].map(x => watermapisbomb.get(x.toString())));
			let diff = nwaterbombs - ib[1];
			//console.log("at point", ib[0], 'needs flags', ib[1], 'got waterbombs', nwaterbombs, 'diff is', diff);
			if (diff>.5) { // Too many flags/bombs
				numlowexacthigh[2] += 1;
				ib[2].forEach(x => pbombmap.set(x.toString(), Math.max(0, pbombmap.get(x.toString()) - pbombeps)));
			} else if (diff < -.5) { // Not enough flags/bombs
				numlowexacthigh[0] += 1;
				ib[2].forEach(x => pbombmap.set(x.toString(), Math.min(1, pbombmap.get(x.toString()) + pbombeps)));
			} else { // Correct number of bombs/flags
				numlowexacthigh[1] += 1;
			}
		}
		// Loop over each island border numbered point, normalize probs
		for (let k=0; k<islandbordernumberpoints.length; k++) {
			let ib = islandbordernumberpoints[k];
			// Normalize probs
			let sumprobs = 0;
			ib[2].forEach(x => sumprobs += pbombmap.get(x.toString()));
			if (sumprobs > 1e-8 && Math.abs(sumprobs-1)>1e-6) {// Avoid divide by zero, but shouldn't happen ever.
				ib[2].forEach(x => pbombmap.set(x.toString(), Math.min(1,pbombmap.get(x.toString()) / (sumprobs/ib[1]))));
				//console.log("sumprobs was:", sumprobs, "now is", sum(ib[2].map(x => pbombmap.get(x.toString()))));
			}
		}
		if (numlowexacthigh[0] + numlowexacthigh[2] <= 0.5) {
			nvalid += 1;
		} else if (numlowexacthigh[0] > numlowexacthigh[2]) {
			//pbomb += .05;
		} else if (numlowexacthigh[0] < numlowexacthigh[2]) {
			//pbomb -= .05;
		}
		highestconf = Math.min(Math.min(...Array.from(pbombmap.values())), 1-Math.max(...Array.from(pbombmap.values())));
		pbombeps *= .99;
	}
	console.log("exited while loop", nvalid, nattempts, highestconf);
	pbombmap;
	if (show) {
		waterpoints.forEach(x => {document.querySelector("#boardsquare"+x[0]+"_"+x[1]+" div").innerText = pbombmap.get(x.toString()).toFixed(2)});
	}
	
	highestconf = 2;
	let highestconfpoint = null;
	let highestconfaction = null;
	// Loop over water points
	for (let k=0; k<waterpoints.length; k++) {
		let pk = pbombmap.get(waterpoints[k].toString()); 
		if (pk < highestconf) {
			highestconf = pk;
			highestconfpoint = waterpoints[k];
			highestconfaction = "click";
		}
		if (1 - pk < highestconf) {
			highestconf = 1 - pk;
			highestconfpoint = waterpoints[k];
			highestconfaction = "flag";
		}
	}
	console.log("Best island guess:", highestconfaction, highestconfpoint, highestconf);
	return {action:highestconfaction,
		   	point:highestconfpoint,
		   	conf:highestconf,
			success:true
		   };
}
function dobestislandguess(guess) {
	if (!gameisactive) {return 0;}
	if (guess === 0) {return 0;}
	if (guess.action == 'click') {
		square_click(guess.point[0], guess.point[1]);
	} else if (guess.action == 'flag') {
		mark_bomb(guess.point[0], guess.point[1]);
	} else {
		alert("error in dobestislandguess");	
		return 0;
	}
	return 1; // success, number of actions done
}

function fullAI() {
	if (sum(isrevealed.flat()) == 0) {square_click(0,0);}
	let nactions = 0;
	while (nactions < 150) {
		nactions += 1
		let n_guaranteed = AImovesguaranteed();
		let guess = bestguessisland();
		let n_guess = 0;
		if (guess.success) {
			n_guess = dobestislandguess(guess);
		} else {
			console.log("Full AI couldn't get bestislandguess");
			n_guess = 0;
		}
		if (n_guaranteed == 0 && n_guess == 0) {
			break;
		}
	}
}

