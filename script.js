
//console.log("loaded script js")


var board = null;
var isbomb = null;
var isrevealed = null;
var isflagged = null;
var visualboard = null;
var ncol = 10;
var nrow = 10;
var nbombs = 10;
var flagsplaced = 0;
var nopened = null;

var use_stopwatch = false;
var stopwatchisstopped = true;
var gameisactive = false;

function convert_board_to_HTML(board) {
	out = "<table style='font-size:44px;'> \n";
	for (let i=0; i < nrow; i++) {
		out += "\t<tr>\n";
		for (let j=0; j < ncol; j++) {
			out += "\t\t<td class='boardsquare boardsquare" + (isrevealed[i][j] ? "revealed": "notrevealed") +
				((isrevealed[i][j] && isbomb[i][j]) ? " tdrevealedbomb" : "") +
				((!gameisactive && isflagged[i][j] && !isbomb[i][j]) ? " tdbadflag" : "") +
				"' id='boardsquare"+i+"_"+j+"' style='width:25px;height:25px;border:1px solid black' onclick='square_click("+i+", "+j+", event)' oncontextmenu='mark_bomb("+i+","+j+", event);'>";
			//out += board[i][j];
			//console.log(i, j, isrevealed);
			if (isrevealed[i][j]) {
				if (isbomb[i][j]) { // Is a revealed bomb (lost game)
					out += "<div style='text-shadow: 0 0 2px black; font-size:.3em;'>" + "&#128163;" + "</div>"
				} else { // Is a number
					out += "<div style='text-shadow: 0 0 2px black; font-size:17px;'>" + (board[i][j] > 0 ? board[i][j] : "") + "</div>"
				}
			} else if (isflagged[i][j]) { // Flag
				out += "<div style='color:black;text-shadow: 0 0 2px black; font-size:.4em;'>" + "&#9873;" + "</div>"
			} else { // Unopened/unmarked
				out += "<div style='color:black;text-shadow: 0 0 2px black; font-size:12px;'>" + "" + "</div>"
			};
			out += "</td>\n";
		}
		out += "</tr>\n";
	}
	out += "</table>";
	return out;
}
	
function display_board(board) {
	//console.log("Updating board");
	document.getElementById("divboard").innerHTML = convert_board_to_HTML(board);
	//window.requestAnimationFrame(function(){});
	return;
}
//document.getElementById("divboard").innerHTML = convert_board_to_HTML(board)

function input_move(move) {
	// update board
	display_board(board);
	
	// Check game over
	//let game_over = check_game_over();
	//if (game_over > 0) {
	//	alert("Game over, player " + game_over + " wins!");
	//}
	
	// Reset stopwatch if using it
	//if (use_stopwatch) {
	//	timer.reset();
	//}
	
	return true;
}

function square_click(i, j, ev=null, dontshow=false) {
	if (!gameisactive) {return;}
	//console.log("ev is", ev);
	// If control key was pressed, place flag instead
	if (ev!==null && ev.ctrlKey) {
		//console.log("ctrl key was down");
		return mark_bomb(i, j);
	}
	//console.log("clicked on square", i, j);
	
	// If already opened or has a flag, exit
	if (isrevealed[i][j] || isflagged[i][j]) {
		return;
	}
	
	// Start timer if first move
	if (stopwatchisstopped) {
		timer.start();
		stopwatchisstopped = false;
	}
	isrevealed[i][j] = true;
	visualboard[i][j] = board[i][j];
	nopened += 1;
	//let square = document.getElementById("boardsquare"+i+"_"+j);
	
	// Click on bomb
	if (isbomb[i][j]) {
		// Lose game
		return game_lost();
	}
	
	// Click on 0: open all surrounding
	if (board[i][j] == 0) {
		for (let di=-1; di<1.5; di++) {
			for (let dj=-1; dj<1.5; dj++) {
				if (!(di==0 && dj==0) && (i+di>=0) && (i+di<nrow) && (j+dj>=0) && (j+dj<ncol)) {
					if (!isrevealed[i+di][j+dj] && !isflagged[i+di][j+dj]) {
						square_click(i+di, j+dj, null, true);
					}
				}
			}
		}
	}
	if (dontshow) {
		return;
	}
	
	// Check if won
	if (nopened == ncol*nrow - nbombs) {
		return game_won();
	}
	
	input_move();
	return nopened;
}

function mark_bomb(i, j, ev=null) {
	if (!gameisactive) {return;}
	if (isrevealed[i][j]) {return;}
	if (isflagged[i][j]) { // Already flagged, then unflag
		isflagged[i][j] = false;
		visualboard[i][j] = 'u'; // unopened
		flagsplaced -= 1;
	} else { // Not flagged, add flag
		isflagged[i][j] = true;
		visualboard[i][j] = 'f'; // flagged
		flagsplaced += 1;
	}
	document.getElementById('flagsleft').innerHTML = (nbombs - flagsplaced); // "&#9873;" + 
	input_move();
}


function check_game_over() {
	return 0;
}

function reset_game() {
	// Check the difficulty level
	var ele = document.getElementsByName('difficulty');
	for(i = 0; i < ele.length; i++) {
		if(ele[i].checked) {
			//console.log(ele[i].value);
			if (ele[i].value == "easy") {
				ncol=10; nrow=10, nbombs=10;
			} else if (ele[i].value == "medium") {
				ncol=16; nrow=14, nbombs=40;
			} else if (ele[i].value == "hard") {
				ncol=30; nrow=16, nbombs=99;
			} else {
				alert("ERROR: bad difficulty level");
				ncol=30; nrow=16, nbombs=99;
			}
		}
	}
	// Reset board info
	board = Array(nrow);
	isbomb = Array(nrow);
	isrevealed = Array(nrow);
	isflagged = Array(nrow);
	visualboard = Array(nrow);
	for (let i=0; i<nrow; i++) {
		board[i] = Array(ncol);
		isbomb[i] = Array(ncol);
		isrevealed[i] = Array(ncol);
		isflagged[i] = Array(ncol);
		visualboard[i] = Array(ncol);
		for (let j=0; j < ncol; j++) {
			board[i][j] = Math.random();
			//isbomb[i][j] = Math.random() < nbombs / (ncol*nrow);
			isrevealed[i][j] = false;
			isflagged[i][j] = false;
			visualboard[i][j] = 'u';
		}
	}
	// Debug:
	//board[0][0] = 1;
	//board[0][1] = 0;
	//board[1][0] = 0;
	//board[1][1] = 0;
	// Set nbombs squares to have bombs.
	let threshold = board.flat().sort()[nbombs];
	for (let i=0; i<nrow; i++) {
		for (let j=0; j < ncol; j++) {
			isbomb[i][j] = board[i][j] < threshold;
		}
	}
	// board contains number of bombs surrounding each square
	for (let i=0; i<nrow; i++) {
		for (let j=0; j < ncol; j++) {
			if (isbomb[i][j]) {
				board[i][j] = NaN;
			} else {
				board[i][j] = 0;
				for (let di=-1; di<1.5; di++) {
					for (let dj=-1; dj<1.5; dj++) {
						if (!(di==0 && dj==0) && (i+di>=0) && (i+di<nrow) && (j+dj>=0) && (j+dj<ncol)) {
							if (isbomb[i+di][j+dj]) {
								board[i][j] = board[i][j] + 1;
							}
						}
					}	
				}
			}
		}
	}
	flagsplaced = 0;
	nopened = 0;
	document.getElementById('flagsleft').innerHTML = (nbombs - flagsplaced); //"&#9873;" + 
	
	// update board
	display_board(board);
	//setTimeout(1, function(){display_board(board)});
	
	// Update turn indicator
	//document.getElementById("divturn").innerHTML = "Turn: " + (team1_turn ? "&#9711;" : "&#11044;") 
	
	// Reset stopwatch if using it
	if (use_stopwatch) {
		timer.reset();
		timer.stop();
		stopwatchisstopped = true;
	}
	
	gameisactive = true;
	document.getElementById('divgamestatus').innerText = "";
}

function game_lost() {
	timer.update();
	timer.stop();
	gameisactive = false;
	
	// Display board, show all bombs, show unrevealed ones as different color
	display_board(board);
	
	// Display text/alert saying you lost
	//alert("You lost");
	document.getElementById('divgamestatus').innerText = "YOU LOSE! Start a new game.";
}

function game_won() {
	timer.update();
	timer.stop();
	gameisactive = false;
	
	// Display board
	display_board(board);
	
	// Display text/alert saying you won
	//alert("You won!");
	document.getElementById('divgamestatus').innerText = "YOU WIN! Start a new game.";
}

document.addEventListener('keydown', function (event) {
	// New game
	if (event.key === 'n' || event.key === 'r') {
		reset_game();
	}
	// Assist, does all guaranteed moves
	if (event.key === 'a') {
		AImovesguaranteed();
	}
	// Full run AI
	if (event.key === 'f') {
		fullAI();
	}
	// AI do one move
	if (event.key === 'o') {
		AImove1();
	}
	// Show probabilities
	if (event.key === 'p') {
		bestguessisland(true);
	}
});


window.onload = function(e) {
	//console.log("running onload");
	//
	click_stopwatch();
	
	reset_game()
	display_board(board);
	
	// Prevent right click menu from working on the board only
	document.getElementById("divboard").addEventListener('contextmenu', function (e) { 
		//console.log("Prevented right click");
		e.preventDefault(); 
	}, false);
	
}
