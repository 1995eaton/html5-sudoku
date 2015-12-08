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
  this.setLineWidths(4, 1);
  this.canvas = document.createElement('canvas');
  this.canvas.className = 'sudoku-board';
  this.setSize(~~squareSize || 50);
  this._ctx = this.canvas.getContext('2d');
  this.clear();
  this._setupListeners();
}

SudokuBoard.prototype = {
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
          this.focusSquare(x, y);
          break outerLoop;
        }
      }
    }
  },
  _keyDown: function(event) {
    switch (event.which) {
    case 37: this.moveSelection('left'); break;
    case 38: this.moveSelection('up'); break;
    case 39: this.moveSelection('right'); break;
    case 40: this.moveSelection('down'); break;
    }
  },
  moveSelection: function(direction) {
    var hv = this._lastHover;
    var lv = hv.slice();
    var match = false;
    switch (direction) {
    case 'down':
      if (hv[1] < 8) match = (hv[1]++, true);
      break;
    case 'up':
      if (hv[1] > 0) match = (hv[1]--, true);
      break;
    case 'right':
      if (hv[0] < 8) match = (hv[0]++, true);
      break;
    case 'left':
      if (hv[0] > 0) match = (hv[0]--, true);
      break;
    }
    if (match) {
      this.setSquare(lv[0], lv[1], this.board[lv[1]][lv[0]]);
      key = this.board[hv[1]][hv[0]];
      this.setSquare(hv[0], hv[1], +key, true);
    }
  },
  _keyPress: function(event) {
    var key = String.fromCharCode(event.which);
    var noteKeys = {
      '!': '1',
      '@': '2',
      '#': '3',
      '$': '4',
      '%': '5',
      '^': '6',
      '&': '7',
      '*': '8',
      '(': '9'
    };
    if (this._lastHover === null)
      return;
    var tempNoteMode = false;
    if (noteKeys.hasOwnProperty(key)) {
      key = noteKeys[key];
      tempNoteMode = true;
    }
    if (key >= '0' && key <= '9') {
      if (!this._noteMode && !tempNoteMode) {
        this.setSquare(this._lastHover[0], this._lastHover[1], +key, true);
      } else {
        var x = this._lastHover[0], y = this._lastHover[1];
        if (!this._givens[y][x]) {
          if (this.board[y][x] !== 0) {
            if (+key === 0) {
              this.board[y][x] = 0;
              this.setSquare(this._lastHover[0], this._lastHover[1], this.board[y][x], true);
            }
            return;
          }
          if (+key === 0) {
            this._notes[y][x] = this._notes[y][x].map(function() {
              return false;
            });
          } else {
            this._notes[y][x][+key - 1] = !this._notes[y][x][+key - 1];
          }
          this.setSquare(this._lastHover[0], this._lastHover[1], this.board[y][x], true);
        }
      }
    } else {
      var hv = this._lastHover;
      var lv = hv.slice();
      var match = false;
      switch (key) {
      case 'h': this.moveSelection('left'); break;
      case 'k': this.moveSelection('up'); break;
      case 'l': this.moveSelection('right'); break;
      case 'j': this.moveSelection('down'); break;
      case 'H':
        this._noteMode = !this._noteMode;
        this.setSquare(hv[0], hv[1], this.board[hv[1]][hv[0]], true);
        break;
      case 'Z':
        this.applySolution();
        this._lastHover = null;
        this.focusSquare(4, 4);
        break;
      case 'X':
        this.clear();
        this.focusSquare(4, 4);
        break;
      case ')':
        if (this._noteMode) {
          this._notes[hv[1]][hv[0]] = this._notes[hv[1]][hv[0]].map(function() {
            return true;
          });
          this.setSquare(hv[0], hv[1], this.board[hv[1]][hv[0]], true);
        } else {
          this._notes[hv[1]][hv[0]] = this._notes[hv[1]][hv[0]].map(function() {
            return false;
          });
          this.setSquare(hv[0], hv[1], this.board[hv[1]][hv[0]], true);
        }
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
    this.canvas.onmousedown = this._mouseDown.bind(this);
    window.onkeydown = this._keyDown.bind(this);
    window.onkeypress = this._keyPress.bind(this);
  },
  setLineWidths: function(major, minor) {
    this.majorWidth = major + (major & 1);
    this.minorWidth = minor + (minor & 1);
  },
  setSize: function(pixels) {
    // avoid floating point spacing for notes
    pixels = (pixels - pixels % 3) + 3;

    this.squareSize = pixels;
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
  focusSquare: function(x, y) {
    if (this._lastHover === null) {
      this.setSquare(x, y, this.board[y][x], true);
    } else if (this._lastHover[0] !== x || this._lastHover[1] !== y) {
      this.setSquare(this._lastHover[0], this._lastHover[1],
                     this.board[this._lastHover[1]][this._lastHover[0]]);
      this.setSquare(x, y, this.board[y][x], true);
    }
    this._lastHover = [x, y];
    if (this._lastHover !== null && (x === 9 || y === 9))
        this.setSquare(this._lastHover[0], this._lastHover[1],
                       this.board[this._lastHover[1]][this._lastHover[0]]);
    if (x === 9 && y === 9)
      this._lastHover = null;
  },
  setSquare: function(x, y, n, color) {
    var loc = this._squareLocation(x, y);
    if (this._givens[y][x]) {
      n = this.board[y][x];
    } else if (n === 0)
      this.board[y][x] = 0;
    if (color) {
      if (!this._noteMode) {
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
      this.updateNotes(x, y);
      return;
    }
    var fontSize = ~~(this.squareSize * 0.75);
    var font = 'bold ' + fontSize + 'px sans-serif';
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
        posY = loc[1];
    var fontHeight = getFontHeight(font, n);
    posY += fontHeight;
    posY += (this.squareSize - fontHeight) >> 1;
    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'bottom';
    this._ctx.font = font;
    this._ctx.fillText(n, posX, posY);
  },
  addNote: function(x, y, n) {
    this._notes[y][x][n - 1] = true;
    var loc = this._squareLocation(x, y);
    var hs = (this.squareSize / 3);
    var xx = (n - 1) % 3, yy = ~~((n - 1) / 3);
    var posX = loc[0] + ~~(hs * (xx + 0.5)),
        posY = loc[1];
    var fontSize = ~~(hs * 0.75);
    var font = 'bold ' + fontSize + 'px sans-serif';
    var fontHeight = getFontHeight(font, n);
    posY += fontHeight;
    posY += hs * yy;
    posY += (hs - fontHeight) >> 1;
    this._ctx.font = font;
    this._ctx.fillStyle = '#777';
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
    this.focusSquare(4, 4);
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
  updateNotes: function(x, y) {
    for (var i = 0; i < 9; i++) {
      if (this._notes[y][x][i]) {
        this.addNote(x, y, i + 1);
      }
    }
  },
  clear: function() {
    this.board = Array.apply(null, Array(9)).map(function() {
      return Array.apply(null, Array(9)).map(function() { return 0; });
    });
    this._notes = Array.apply(null, Array(9)).map(function() {
      return Array.apply(null, Array(9)).map(function() {
        return [false, false, false, false, false, false, false, false, false];
      });
    });
    this._lastHover = null;
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
