"use strict";

var algorithm = null;
var diamondSquare = null;
var midpointDisplacement = null;
var perlinNoise = null;
var simplexNoise = null;

var imageData = {};

// main
$(document).ready(function() {
  var manager = new Manager();
  var canvas = $('#canvas')[0];
  var context = canvas.getContext('2d');
  imageData = context.getImageData(0, 0, 513, 513);
  manager.init();

  $('#reset').on('click', function() { manager.resetDrawing(false); });

  $('input[type=radio][name=algorithm]').change(function() {
    if (this.value == "diamondSquare") {
      algorithm = diamondSquare;
    }
    else if (this.value == "midpointDisplacement") {
      algorithm = midpointDisplacement;
    }
    else if (this.value == "perlinNoise") {
      algorithm = perlinNoise;
    }
    else {
      algorithm = simplexNoise;
    }
    algorithm.init();
    algorithm.propagate();
    algorithm.display();
  });

  $('input[name=seed]').change(function() {
    var val = $(this).val();
    if (isNaN(val)) {
      var seed = Math.floor(Math.random() * 1000000000);
      Math.seedrandom(seed.toString());
      $(this).val(seed);
    }
    else {
      Math.seedrandom(val.toString());
      $(this).val(val);
    }
    manager.resetDrawing(true);
  });
});

// Manager class
var Manager = function() {
  this.resetDrawing = function(hasSeed = false) {
    console.log("in Manager::resetDrawing");

    algorithm.resetDrawing();
    algorithm.propagate();
    algorithm.display();
  };

  this.init = function() {
    console.log("in Manager::init");

    diamondSquare = new DiamondSquare();
    midpointDisplacement = new MidpointDisplacement();
    perlinNoise = new DiamondSquare();
    simplexNoise = new DiamondSquare();

    algorithm = diamondSquare;

    algorithm.init();
    algorithm.propagate();
    algorithm.display();
  };
};
