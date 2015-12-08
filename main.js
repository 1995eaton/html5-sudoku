var sb = new SudokuBoard(80);
document.body.appendChild(sb.canvas);
var board = '..............3.85..1.2.......5.7.....4...1...9.......5......73..2.1........4...9';

window.onresize = function() {
  var halfSize = sb.canvas.width >> 1;
  sb.canvas.style.left = Math.max(0, (window.innerWidth >> 1) - halfSize) + 'px';
  sb.canvas.style.top = Math.max(0, (window.innerHeight >> 1) - halfSize) + 'px';
};
window.onresize();

sb.applyBoard(board);
sb.solve();
