var sb = new SudokuBoard(70);
document.body.appendChild(sb.canvas);
var difficulty = 'intermediate';

var selection = puzzles[difficulty];
var board = selection[~~(Math.random() * selection.length)];

window.onresize = function() {
  var halfSize = sb.canvas.width >> 1;
  sb.canvas.style.left = Math.max(0, (window.innerWidth >> 1) - halfSize) + 'px';
  sb.canvas.style.top = Math.max(0, (window.innerHeight >> 1) - halfSize) + 'px';
};
window.onresize();

sb.applyBoard(board);
