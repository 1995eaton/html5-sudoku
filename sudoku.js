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
  this.setLineWidths(8, 4);
  this.canvas = document.createElement('canvas');
  this.canvas.className = 'sudoku-board';
  this.setSize(this.squareSize);
  this._ctx = this.canvas.getContext('2d');
  this.clear();
  this._setupListeners();
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
      if (!this._hintMode) {
        this.setSquare(this._lastHover[0], this._lastHover[1], +key, true);
      } else {
        var x = this._lastHover[0], y = this._lastHover[1];
        if (!this._givens[y][x]) {
          if (this.board[y][x] !== 0) {
            if (+key === 0) {
              this.board[y][x] = 0;
              this.setSquare(this._lastHover[0], this._lastHover[1], this.board[y][x], true);
              this.updateHints(x, y);
            }
            return;
          }
          if (+key === 0) {
            this._hints[y][x] = this._hints[y][x].map(function() {
              return false;
            });
          } else {
            this._hints[y][x][+key - 1] = !this._hints[y][x][+key - 1];
          }
          this.setSquare(this._lastHover[0], this._lastHover[1], this.board[y][x], true);
          this.updateHints(x, y);
        }
      }
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
      case 'H':
        this._hintMode = !this._hintMode;
        this.setSquare(hv[0], hv[1], this.board[hv[1]][hv[0]], true);
        break;
      case 'E':
        this.showErrors();
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
    if (this._givens[y][x]) {
      n = this.board[y][x];
    } else if (n === 0)
      this.board[y][x] = 0;
    if (color) {
      if (!this._hintMode) {
        this._ctx.fillStyle = '#ddd';
      } else {
        this._ctx.fillStyle = '#c2ffc2';
      }
      this._ctx.fillRect(loc[0], loc[1], this.squareSize, this.squareSize);
      this._ctx.fillStyle = '#000';
    } else {
      this.clearSquare(x, y);
    }
    if (typeof n !== 'number')
      return;
    n = ~~n;
    if (n < 1 || n > 9) {
      this.updateHints(x, y);
      return;
    }
    var fontSize = ~~(this.squareSize * 0.75);
    var font = 'bold ' + fontSize + 'px arial';
    if (color && n !== this.board[y][x])
      this._errors[y][x] = false;
    if (this._errors[y][x]) {
      this._ctx.fillStyle = '#ff0000';
    } else if (this._givens[y][x]) {
      this._ctx.fillStyle = '#000';
    } else {
      this._ctx.fillStyle = '#777';
    }
    this.board[y][x] = n;
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
    for (var i = 0; i < 81; i++) {
      var c = str[i];
      if (c < '1' || c > '9')
        continue;
      c = +c;
      var x = i % 9, y = ~~(i / 9);
      this._givens[y][x] = true;
      this.board[y][x] = c;
      this.setSquare(x, y, c);
    }
    this.solve();
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
  applySolution: function() {
    this.solve();
    for (var y = 0; y < 9; y++) {
      for (var x = 0; x < 9; x++) {
        this.setSquare(x, y, this._solution[y][x]);
      }
    }
  },
  solve: function() {
    if (this._solution !== null)
      return;
    var boardStr = this.board.map(function(e) { return e.join(''); }).join('');
    var solver = new SudokuSolver();
    return this._solution = solver.solve(boardStr).board;
  },
  updateHints: function(x, y) {
    for (var i = 0; i < 9; i++) {
      if (this._hints[y][x][i]) {
        this.addHint(x, y, i + 1);
      }
    }
  },
  addHint: function(x, y, n) {
    this._hints[y][x][n - 1] = true;
    var loc = this._squareLocation(x, y);
    var hs = (this.squareSize / 3);
    var xx = (n - 1) % 3, yy = ~~((n - 1) / 3);
    var posX = loc[0] + ~~(hs * (xx + 0.5)),
        posY = loc[1];
    var fontSize = ~~(hs * 0.75);
    var font = 'bold ' + fontSize + 'px arial';
    var fontHeight = getFontHeight(font, n);
    posY += fontHeight;
    posY += hs * yy;
    posY += (hs - fontHeight) >> 1;
    // posY -= (hs - fontHeight) >> 1;
    this._ctx.font = font;
    this._ctx.fillStyle = '#777';
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'bottom';
    this._ctx.font = font;
    this._ctx.fillText(n, posX, posY);
  },
  clear: function() {
    this.board = Array.apply(null, Array(9)).map(function() {
      return Array.apply(null, Array(9)).map(function() { return 0; });
    });
    this._hints = Array.apply(null, Array(9)).map(function() {
      return Array.apply(null, Array(9)).map(function() {
        return [false, false, false, false, false, false, false, false, false];
      });
    });
    this._lastHover = null;
    this._lastClick = null;
    this._activeClick = false;
    this._solution = null;
    this._givens = Array.apply(null, Array(9)).map(function() {
      return Array.apply(null, Array(9)).map(function() { return false; });
    });
    this._errors = Array.apply(null, Array(9)).map(function() {
      return Array.apply(null, Array(9)).map(function() { return false; });
    });
    this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this._drawLines();
  },
  showErrors: function() {
    this.solve();
    for (var y = 0; y < 9; y++) {
      for (var x = 0; x < 9; x++) {
        if (this.board[y][x] > 0 && this._solution[y][x] !== this.board[y][x]) {
          this._errors[y][x] = true;
          if (this._lastHover && this._lastHover[0] === x &&
              this._lastHover[1] === y) {
            this.setSquare(x, y, this.board[y][x], true);
          } else {
            this.setSquare(x, y, this.board[y][x]);
          }
        } else {
          this._errors[y][x] = false;
        }
      }
    }
  },
};
