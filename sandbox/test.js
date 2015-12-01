var distMin = 50;
var distMax = 750;
var coefMin = 0;
var coefMax = 100;
var distAct = 50;

var speedCoef = coefMin+(coefMax-coefMin)*((distAct-distMin)/(distMax-distMin));
console.log(speedCoef); //TODO: Remove