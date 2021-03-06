// https://stackoverflow.com/questions/20318822/how-to-create-a-stopwatch-using-javascript
var Stopwatch = function(elem, options) {

  var timer       = createTimer(),
      startButton = createButton("start", start),
      stopButton  = createButton("stop", stop),
      resetButton = createButton("reset", reset),
      offset,
      clock,
      interval;

  // default options
  options = options || {};
  options.delay = options.delay || 100;

  // append elements     
  elem.appendChild(timer);
  //elem.appendChild(startButton);
  //elem.appendChild(stopButton);
  //elem.appendChild(resetButton);

  // initialize
  reset();

  // private functions
  function createTimer() {
    return document.createElement("span");
  }

  function createButton(action, handler) {
    var a = document.createElement("a");
    a.href = "#" + action;
    a.innerHTML = action;
    a.addEventListener("click", function(event) {
      handler();
      event.preventDefault();
    });
    return a;
  }

  function start() {
    if (!interval) {
      offset   = Date.now();
      interval = setInterval(update, options.delay);
    }
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  function reset() {
    clock = 0;
    render();
  }

  function update() {
    clock += delta();
    // Stop after max time
    if (clock > 1000*1000) {
      stop();
    }
    render();
  }

  function render() {
    //timer.innerHTML = Math.round(clock/1000); 
    timer.innerHTML = (clock/1000).toFixed(1); 
  }

  function delta() {
    var now = Date.now(),
        d   = now - offset;

    offset = now;
    return d;
  }

  // public API
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
  this.update = update;
};

var timer = null;
window.addEventListener("load", function(e) {
  //timer = new Stopwatch(document.getElementById('stopwatch'), {delay: 10});
})
function click_stopwatch() {
  if (use_stopwatch) { // Already using, so reset it or turn it off?
    timer.reset()
  } else {
    document.getElementById('stopwatch').innerHTML = "";
    timer = new Stopwatch(document.getElementById('stopwatch'), {delay: 50});
    //timer.start()
    use_stopwatch = true;
  }
}
