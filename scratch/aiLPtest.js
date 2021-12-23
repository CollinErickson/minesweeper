/*
Thought I had a genius idea of solving with LPs.
But it doesn't work.
If it has 1 u 1
          u u u,
it will say there's only 1 bomb, and it has to be one of the middle 2.
*/


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
let islandpoints = [];
let islandbordernumberpoints = [];
let waterpoints = [];
surrounding_indices
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
		// Add neighbors to points to check if p is island (not water)
		if (visualboard[i][j] != 'u') {
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
		pointsalreadyvisited.set(p.toString(), pneighbors);
	}
}

if (waterpoints.length == 0 || islandbordernumberpoints.length == 0) {
	console.log("bad 123333");
	//return;
}
console.log("islandbordernumberpoints len is", islandbordernumberpoints.length, islandbordernumberpoints);

let waterpointstoindexmap = new Map();
for (let k=0; k<waterpoints.length; k++) {
	waterpointstoindexmap.set(waterpoints[k].toString(), k)
}

//let constraints = [];
//let constraintsneg = [];
//let constraintsequal = [];
//let constraintsnegequal = [];
// Create LP model
let model = {optimize:"obj", opType:"min", constraints:{}, variables:{}};
// Add all waterpoints to LP model variables
for (let k=0; k<waterpoints.length; k++) {
	// Get wp index
	let wpind = waterpointstoindexmap.get(waterpoints[k].toString());
	// Add variable to model
	model.variables["x" + wpind] = {};
	//Add min=0, max=1?
}
// Create LP model v2: split x to 0.5+xp - xn. xp, xn in [0,.5]. Min xp+xn
let model2 = {optimize:"obj", opType:"min", constraints:{}, variables:{}};
// Add all waterpoints to LP model variables
for (let k=0; k<waterpoints.length; k++) {
	// Get wp index
	let wpind = waterpointstoindexmap.get(waterpoints[k].toString());
	// Add variable to model
	model.variables["x" + wpind] = {};
	model2.variables["xp" + wpind] = {obj:1};
	model2.variables["xn" + wpind] = {obj:1};
	model2.constraints["xprange" + wpind] = {max:0.5};
	model2.constraints["xnrange" + wpind] = {max:0.5};
	model2.variables["xp" + wpind]["xprange" + wpind] = 1;
	model2.variables["xn" + wpind]["xnrange" + wpind] = 1;
	
	//Add min=0, max=1?
}

// Loop over island
for (let k=0; k<islandbordernumberpoints.length; k++) {
	console.log("On islandbordernumberpoint", k);
	let ib = islandbordernumberpoints[k];
	let p = ib[0];
	let numflagsleft = ib[1];
	let surroundingwaterindices = ib[2];
	//let constraint_k = '';
	//let constraintneg_k = '';
	//let model_constraint_k = {};
	for (let l=0; l<surroundingwaterindices.length; l++) {
		//constraint_k += "x" + waterpointstoindexmap.get(surroundingwaterindices[l].toString());
		//constraintneg_k += "-x" + waterpointstoindexmap.get(surroundingwaterindices[l].toString());
		//if (l < surroundingwaterindices.length - 1.5) {
		//	constraint_k += " + ";
		//	constraintneg_k += " + ";
		//}
		// For model
		let wpindl = waterpointstoindexmap.get(surroundingwaterindices[l].toString());
		// Add to constraints
		//model_constraint_k["x" + wpindl] ;
		model.variables["x" + wpindl]["y" + k] = 1 ;
		model2.variables["xp" + wpindl]["y" + k] = 1 ;
		model2.variables["xn" + wpindl]["y" + k] = -1 ;
	}
	//constraintneg_k = constraint_k + " >= " + numflagsleft;
	//constraint_k += " <= " + numflagsleft;
	
	//constraints.push(constraint_k);
	//constraintsneg.push(constraintneg_k);
	//constraintsequal.push(numflagsleft);
	//constraintsnegequal.push(-numflagsleft);
	// Add constraint
	console.log("About to add constraint", "y"+k, numflagsleft);
	model.constraints["y" + k] = {min:numflagsleft, max:numflagsleft};
	model2.constraints["y" + k] = {min:numflagsleft - surroundingwaterindices.length/2, max:numflagsleft - surroundingwaterindices.length/2};
}
//constraints

// Solve LP
let results = solver.Solve(model);
let results2 = solver.Solve(model2);
if (!results.feasible) {
	console.log("FAILED TO GET SOLULTION!");
}

//let constraintsall = constraints.concat(constraintsneg);
//let constraintsequalall = constraintsequal.concat(constraintsnegequal);

// Solve LP
/*var input = {
	type: "minimize",
	objective : "x0 + x1",
	constraints : constraintsall
};
var output = YASMIJ.solve( input );
output.result;*/

// Estimate probabilities each waterpoint is a bomb
// Loop over random samples
let nvalid = 0;
let nattempts = 0;
let pbomb = .3;
let pbombvec = waterpoints.map(x => 0.3);
let pbombmap = new Map();
let pbombeps0 = .05;
let pbombeps = pbombeps0;
waterpoints.forEach(x => pbombmap.set(x.toString(), 0.3));
while (nvalid < 10 && nattempts < 300) {
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
	// Loop over island
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
	if (numlowexacthigh[0] + numlowexacthigh[2] <= 0.5) {
		nvalid += 1;
	} else if (numlowexacthigh[0] > numlowexacthigh[2]) {
		//pbomb += .05;
	} else if (numlowexacthigh[0] < numlowexacthigh[2]) {
		//pbomb -= .05;
	}
	pbombeps *= .99;
}
pbombmap;

highestconf = 2;
highestconfpoint = null;
highestconfaction = null;
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
		conf:highestconf
	   };
