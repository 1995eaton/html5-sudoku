var getFontHeight = (function() {
  var cache = {};
  var elem = document.createElement('div');
  return function(font, str) {
    if (cache[font + str] !== void 0)
      return cache[font + str];
    elem.style.font = font;
    elem.textContent = str;
    document.body.appendChild(elem);
    var height = elem.clientHeight;
    cache[font + str] = height;
    elem.remove();
    return height;
  };
})();

function SudokuBoard(squareSize) {
  this.squareSize = ~~squareSize || 50;
  this._resetBoard();
  this.setLineWidths(8, 4);
  this.canvas = document.createElement('canvas');
  this.canvas.className = 'sudoku-board';
  this.setSize(this.squareSize);
  this._ctx = this.canvas.getContext('2d');
  this.clear();
  this._setupListeners();
  this._lastHover = null;
  this._lastClick = null;
  this._activeClick = false;
}

SudokuBoard.prototype = {
  _mouseMove: function(event) {
    var xp, yp, br = this.canvas.getBoundingClientRect();
    xp = event.clientX - br.left;
    yp = event.clientY - br.top;
    var y, x;
    outerLoop:
    for (y = 0; y < 9; y++) {
      for (x = 0; x < 9; x++) {
        var loc = this._squareLocation(x, y);
        if (xp > loc[0] && xp < loc[0] + this.squareSize &&
            yp > loc[1] && yp < loc[1] + this.squareSize) {
          if (this._lastHover === null) {
            this.setSquare(x, y, this.board[y][x], true);
          } else if (this._lastHover[0] !== x || this._lastHover[1] !== y) {
            this.setSquare(this._lastHover[0], this._lastHover[1],
                           this.board[this._lastHover[1]][this._lastHover[0]]);
            this.setSquare(x, y, this.board[y][x], true);
          }
          this._lastHover = [x, y];
          break outerLoop;
        }
      }
    }
    if (this._lastHover !== null && (x === 9 || y === 9))
        this.setSquare(this._lastHover[0], this._lastHover[1],
                       this.board[this._lastHover[1]][this._lastHover[0]]);
    if (x === 9 && y === 9)
      this._lastHover = null;
  },
  _mouseDown: function(event) {
    var xp, yp, br = this.canvas.getBoundingClientRect();
    xp = event.clientX - br.left;
    yp = event.clientY - br.top;
    var y, x;
    outerLoop:
    for (y = 0; y < 9; y++) {
      for (x = 0; x < 9; x++) {
        var loc = this._squareLocation(x, y);
        if (xp > loc[0] && xp < loc[0] + this.squareSize &&
            yp > loc[1] && yp < loc[1] + this.squareSize) {
          if (this._lastHover === null) {
            this.setSquare(x, y, this.board[y][x], true);
          } else if (this._lastHover[0] !== x || this._lastHover[1] !== y) {
            this.setSquare(this._lastHover[0], this._lastHover[1],
                           this.board[this._lastHover[1]][this._lastHover[0]]);
            this.setSquare(x, y, this.board[y][x], true);
          }
          this._lastHover = [x, y];
          break outerLoop;
        }
      }
    }
    if (this._lastHover !== null && (x === 9 || y === 9))
        this.setSquare(this._lastHover[0], this._lastHover[1],
                       this.board[this._lastHover[1]][this._lastHover[0]]);
    if (x === 9 && y === 9)
      this._lastHover = null;
  },
  _keyPress: function(event) {
    var key = String.fromCharCode(event.which);
    // console.log(key);
    if (this._lastHover !== null && key >= '0' && key <= '9') {
      this.setSquare(this._lastHover[0], this._lastHover[1], +key, true);
    } else if (this._lastHover !== null) {
      var hv = this._lastHover;
      var lv = hv.slice();
      var match = false;
      switch (key) {
      case 'j':
        if (hv[1] < 8) match = (hv[1]++, true);
        break;
      case 'k':
        if (hv[1] > 0) match = (hv[1]--, true);
        break;
      case 'l':
        if (hv[0] < 8) match = (hv[0]++, true);
        break;
      case 'h':
        if (hv[0] > 0) match = (hv[0]--, true);
        break;
      }
      if (match) {
        this.setSquare(lv[0], lv[1], this.board[lv[1]][lv[0]]);
        key = this.board[hv[1]][hv[0]];
        this.setSquare(hv[0], hv[1], +key, true);
      }
    }
  },
  _setupListeners: function() {
    // this.canvas.onmousemove = this._mouseMove.bind(this);
    this.canvas.onmousedown = this._mouseDown.bind(this);
    window.onkeypress = this._keyPress.bind(this);
  },
  setLineWidths: function(major, minor) {
    this.majorWidth = major + (major & 1);
    this.minorWidth = minor + (minor & 1);
  },
  setSize: function(pixels) {
    var size = pixels * 9 + this.minorWidth * 6 + this.majorWidth * 4;
    this.canvas.width  = size;
    this.canvas.height = size;
  },
  _squareLocation: function(x, y) {
    var posX = ~~(x / 3);
    posX = (this.majorWidth * (posX + 1)) + this.minorWidth * (x - posX);
    posX += this.squareSize * x;
    var posY = ~~(y / 3);
    posY = (this.majorWidth * (posY + 1)) + this.minorWidth * (y - posY);
    posY += this.squareSize * y;
    return [posX, posY];
  },
  clearSquare: function(x, y) {
    var loc = this._squareLocation(x, y);
    var xp = loc[0], yp = loc[1];
    this._ctx.clearRect(xp, yp, this.squareSize, this.squareSize);
  },
  setSquare: function(x, y, n, color) {
    var loc = this._squareLocation(x, y);
    if (this.givens[y][x]) {
      n = this.board[y][x];
    } else if (n === 0)
      this.board[y][x] = 0;
    if (color) {
      this._ctx.fillStyle = '#eee';
      this._ctx.fillRect(loc[0], loc[1], this.squareSize, this.squareSize);
      this._ctx.fillStyle = '#000';
    } else {
      this.clearSquare(x, y);
    }
    if (typeof n !== 'number')
      return;
    n = ~~n;
    if (n < 1 || n > 9)
      return;
    this.board[y][x] = n;
    var fontSize = ~~(this.squareSize * 0.75);
    var font = 'bold ' + fontSize + 'px arial';
    if (this.givens[y][x]) {
      this._ctx.fillStyle = '#000';
    } else {
      this._ctx.fillStyle = '#777';
    }
    var posX = loc[0] + (this.squareSize >> 1),
        posY = loc[1] + this.squareSize;
    var fontHeight = getFontHeight(font, n);
    posY -= (this.squareSize - fontHeight) >> 1;
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'bottom';
    this._ctx.font = font;
    this._ctx.fillText(n, posX, posY);
  },
  applyBoard: function(str) {
    this.clear();
    this.givens = Array.apply(null, Array(9)).map(function() {
      return Array.apply(null, Array(9)).map(function() { return false; });
    });
    for (var i = 0; i < 81; i++) {
      var c = str[i];
      if (c < '1' || c > '9')
        continue;
      c = +c;
      var x = i % 9, y = ~~(i / 9);
      this.givens[y][x] = true;
      this.board[y][x] = c;
      this.setSquare(x, y, c);
    }
  },
  _drawLines: function() {
    var off = 0;
    for (var i = 0; i < 10; i++) {
      var lw = i % 3 === 0 ? this.majorWidth : this.minorWidth;
      off += lw >> 1;
      this._ctx.lineWidth = lw;
      this._ctx.beginPath();
        this._ctx.moveTo(0, off);
        this._ctx.lineTo(this.canvas.width, off);
      this._ctx.closePath();
      this._ctx.stroke();

      this._ctx.beginPath();
        this._ctx.moveTo(off, 0);
        this._ctx.lineTo(off, this.canvas.width);
      this._ctx.closePath();
      this._ctx.stroke();
      off += lw >> 1;
      off += this.squareSize;
    }
  },
  _resetBoard: function() {
    this.board = Array.apply(null, Array(9)).map(function() {
      return Array.apply(null, Array(9)).map(function() { return 0; });
    });
  },
  solve: function() {
    var boardStr = this.board.map(function(e) { return e.join(''); }).join('');
    var solver = new SudokuSolver();
    var solution = solver.solve(boardStr);
    var board = solution.board;
    for (var i = 0; i < 81; i++) {
      var x = ~~(i % 9), y = ~~(i / 9);
      this.setSquare(x, y, board[i]);
    }
  },
  clear: function() {
    this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this._resetBoard();
    this._drawLines();
  }
};
