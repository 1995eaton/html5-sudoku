var sb = new SudokuBoard(80);
document.body.appendChild(sb.canvas);
var board = '.1.8.42..2781..9...3.2.9.1..6..8.3.....697.....4.3..2..2.7.6.9...5..8632..13.5.4.';

window.onresize = function() {
  var halfSize = sb.canvas.width >> 1;
  sb.canvas.style.left = Math.max(0, (window.innerWidth >> 1) - halfSize) + 'px';
  sb.canvas.style.top = Math.max(0, (window.innerHeight >> 1) - halfSize) + 'px';
};
window.onresize();

sb.applyBoard(board);
// sb.setSquare(0, 0, 5);
// sb.showErrors();
// sb.addHint(1, 1, 1);
// sb.addHint(1, 1, 2);
// sb.addHint(1, 1, 3);
// sb.addHint(1, 1, 4);
// sb.addHint(1, 1, 5);
// sb.addHint(1, 1, 6);
// sb.addHint(1, 1, 7);
// sb.addHint(1, 1, 8);
// sb.addHint(1, 1, 9);
