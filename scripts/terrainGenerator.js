/*
http://jmecom.github.io/blog/2015/diamond-square/
*/

var imageData = {};
var paintmode = 'PAINT_LIFE';

// main
$(document).ready(function() {
  var running = false;
  var speed = 1.0;
  var interval;
  
  var manager = new Manager();
  var canvas = $('#canvas')[0];
  var context = canvas.getContext('2d');

  imageData = context.getImageData(0, 0, 513, 513);
  manager.init();
  running = true;

  var isPressed = false;
  var x = 0, y = 0;
  $("#canvas").on({
    mousedown: function() {
      isPressed = true;
      x = event.pageX - $('#canvas').offset().left;
      y = event.pageY - $('#canvas').offset().top;
      manager.dabSomePaint(parseInt(x), 500-parseInt(y));
    },
    mouseup: function() {
      isPressed = false;
    },
    mousemove: function() {
      if (isPressed) {
        x = event.pageX - $('#canvas').offset().left;
        y = event.pageY - $('#canvas').offset().top;
        manager.dabSomePaint(parseInt(x), 500-parseInt(y));
      }
    }
  });

  $('#clear').on('click', function() { manager.resetDrawing(false); });
  $('#pause').on('click', function() { 
    if (running)
      $(this).text("Play"); 
    else
      $(this).text("Pause"); 
    running = !running;
  });
  $('input[type=radio][name=brush]').change(function() {
    if (this.value == "life") {
      paintmode = 'PAINT_LIFE';
    }
    else {
      paintmode = 'PAINT_DEATH';
    }
  });
  $('input[name=speed]').change(function() {
    speed = $(this).val() / 100.0;
    clearInterval(interval);
    var ONE_TIME_FRAME = 1000.0 / 60.0 / speed;
    interval = setInterval(animation_step, ONE_TIME_FRAME);
  });

  var animation_step = function() {
    if (running) {
      //manager.propagate();
      //manager.display();
    }
  }

  var ONE_TIME_FRAME = 1000.0 / 60.0 / speed;
  interval = setInterval(animation_step, ONE_TIME_FRAME);
});

// Manager class
var Manager = function() {
  var display_map = [];

  this.resetDrawing = function() {
    console.log("in Manager::resetDrawing");

    var size = 513*513;
    var step_size = 513 - 1;

    for (var i = 0; i < size; i++) {
      display_map[i] = 0.0;
    }

    display_map[this.index(0, 0)] = Math.random();
    display_map[this.index(512, 0)] = Math.random();
    display_map[this.index(0, 512)] = Math.random();
    display_map[this.index(512, 512)] = Math.random();

    this.propagate();
    this.display();

  };

  this.index = function(i, j) {
    return i+513*j;
  };

  this.init = function() {
    console.log("in Manager::init");
    var size = 513*513;
    display_map = new Array(size);

    // generate new random board
    this.resetDrawing();
  };

  this.propagate = function() {
    var step_size = 513 - 1;
    var random_scale = 1.0;

    while (step_size > 1) {
      for (var i=0; i<513-1; i+=step_size) {
        for (var j=0; j<513-1; j+=step_size) {
          this.diamond_step(i, j, step_size, random_scale);
          this.square_step(i, j, step_size, random_scale);
        }
      }

      step_size /= 2;
      random_scale /= 2;
    }
  };

  this.diamond_step = function(i, j, step_size, random_scale) {
    var avg = (
      display_map[this.index(i, j)] +
      display_map[this.index(i + step_size, j)] +
      display_map[this.index(i, j + step_size)] +
      display_map[this.index(i + step_size, j + step_size)]
    ) / 4.0;

    display_map[this.index(i + step_size/2, j + step_size/2)] = avg + this.get_random(random_scale);
  }

  this.square_step = function(i, j, step_size, random_scale) {
    var avg_top = (display_map[this.index(i, j)] + display_map[this.index(i + step_size, j)] + display_map[this.index(i + step_size/2, j + step_size/2)]) / 3.0;
    var avg_left = (display_map[this.index(i, j)] + display_map[this.index(i, j + step_size)] + display_map[this.index(i + step_size/2, j + step_size/2)]) / 3.0;
    var avg_right = (display_map[this.index(i + step_size, j)] + display_map[this.index(i + step_size, j + step_size)] + display_map[this.index(i + step_size/2, j + step_size/2)]) / 3.0;
    var avg_bottom = (display_map[this.index(i, j + step_size)] + display_map[this.index(i + step_size, j + step_size)] + display_map[this.index(i + step_size/2, j + step_size/2)]) / 3.0;

    display_map[this.index(i + step_size/2, j)] = avg_top + this.get_random(random_scale);
    display_map[this.index(i, j + step_size/2)] = avg_left + this.get_random(random_scale);
    display_map[this.index(i + step_size, j + step_size/2)] = avg_right + this.get_random(random_scale);
    display_map[this.index(i + step_size/2, j + step_size)] = avg_bottom + this.get_random(random_scale);
  }

  this.get_random = function(scale) {
    var rand = (Math.random() >= 0.5) ? Math.random() * scale : Math.random() * -1 * scale;
    return rand;
  }

  this.dabSomePaint = function(x, y) {
    console.log("in Manager::dabSomePaint");
    var brush_width = 10;
    var xstart = parseInt(x - brush_width);
    var ystart = parseInt(y - brush_width);
    if (xstart < 0) { xstart = 0; }
    if (ystart < 0) { ystart = 0; }

    var xend = x + brush_width;
    var yend = y + brush_width;
    if (xend >= 500) { xend = 500-1; }
    if (yend >= 500) { yend = 500-1; }

    if (paintmode == 'PAINT_DEATH') {
      for (var ix=xstart; ix <= xend; ix++) {
        for (var iy=ystart; iy <= yend; iy++) {
          var index = ix + 500*(500-iy);

          display_map[index] = 0;
        }
      }
    }
    else if (paintmode == 'PAINT_LIFE') {
      for (var ix=xstart; ix <= xend; ix++) {
        for (var iy=ystart; iy <= yend; iy++) {
          var index = ix + 500*(500-iy);

          display_map[index] = 1;
        }
      }
    }
  };

  this.display = function() {
    // console.log("in Manager::display");
    var canvas = $('#canvas')[0];
    var context = canvas.getContext('2d');

    var j = 0;
    for (var i = 0; i < imageData.data.length; i += 4) {
      var val = display_map[j];

      if (val <= 0.71) {
        // red
        imageData.data[i] = 50.0;

        // green
        imageData.data[i+1] = 50.0;

        // blue
        imageData.data[i+2] = val * 255.0;
        
        // alpha
        imageData.data[i+3] = 255;
      }
      else {
        // red
        imageData.data[i] = 10.0;

        // green
        imageData.data[i+1] = val * 255.0;

        // blue
        imageData.data[i+2] = 50.0;
        
        // alpha
        imageData.data[i+3] = 255;
      }

      j++;
    }

    context.clearRect(0, 0, 513, 513);
    context.putImageData(imageData, 0, 0);
  };
};
