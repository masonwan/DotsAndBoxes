document.addEventListener('readystatechange', onReadyStateChanged);

var game = null;
var YELLOW = 1, GREEN = -1;
var numRows = numCols = 5;

function onReadyStateChanged() {
	document.removeEventListener('readystatechange', onReadyStateChanged);

	var selectElement = document.querySelector('select');
	selectElement.addEventListener('change', onSelectChanged);
	onSelectChanged();

	window.addEventListener('resize', changeBoardSize);

	var restartButton = document.querySelector('#restart');
	restartButton.addEventListener('click', onRestartClicked);
}

function onSelectChanged() {
	var selectElement = document.querySelector('select');
	var value = selectElement.value;
	numRows = numCols = (value < 3 || value > 10) ? 3 : parseInt(value);
	game = new Game(numRows, numCols, GREEN);

	console.log(game);

	generateBoard();
}

function generateBoard() {
	var boardTable = document.querySelector('#board');
	boardTable.innerHTML = '';

	var numHorizontalCells = numRows * 2 + 1;
	var numVerticalCells = numCols * 2 + 1;
	var lineId = 0;
	var boxId = 0;

	for (var row = 0; row < numHorizontalCells; row++) {
		var tableRow = document.createElement('tr');
		var isEvenRow = row % 2 == 0;

		for (var col = 0; col < numVerticalCells; col++) {
			var tableCell = document.createElement('td');
			var isEvenCol = col % 2 == 0;

			if (isEvenRow) {
				if (isEvenCol) {
					tableCell.className = 'dot';
				} else {
					tableCell.className = 'hline none';
					tableCell.lineId = lineId;
					tableCell.addEventListener('click', onLineClicked);

					game.board.lines[lineId].element = tableCell;
					++lineId;
				}
			} else {
				if (isEvenCol) {
					tableCell.className = 'vline none';
					tableCell.lineId = lineId;
					tableCell.addEventListener('click', onLineClicked);

					game.board.lines[lineId].element = tableCell;
					++lineId;
				} else {
					tableCell.className = 'box';
					tableCell.boxId = boxId;

					game.board.boxList[boxId].element = tableCell;
					++boxId;
				}
			}

			tableRow.appendChild(tableCell);
		}

		boardTable.appendChild(tableRow);
	}

	changeBoardSize();
}

function changeBoardSize() {
	var ratioDotToBox = 4;
	var boardLength = Math.min(window.innerHeight, window.innerWidth * 0.8, window.innerWidth - 240) - 20;
	var dotLength = Math.floor(boardLength / ((ratioDotToBox * numRows) + (numRows + 1)));
	var boxLength = dotLength * ratioDotToBox;

	var elementNodeList = document.querySelectorAll('td, tr');

	for (var i = 0; i < elementNodeList.length; i++) {
		var element = elementNodeList[i];
		var height, width;

		switch (element.className) {
			case 'dot':
				height = width = dotLength;
				break;
			case 'vline':
				height = boxLength;
				width = dotLength;
				break;
			case 'hline':
				height = dotLength;
				width = boxLength;
				break;
			case 'box':
				height = width = boxLength;
				break;
			default:
				continue;
		}

		element.style.height = height + 'px';
		element.style.width = width + 'px';
	}
}

function onLineClicked() {
	var target = event.target;
	var line = game.board.lines[target.lineId];

	if (line.owner !== null) {
		console.log('The line is owned by ' + getPlayerClass(line.owner));
		return;
	}

	line.owner = game.currentPlayer;

	target.classList.add(getPlayerClass(game.currentPlayer));
	target.classList.remove('none');

	var boxes = line.boxes;
	var isAnyBoxOwned = false;

	for (var i = 0; i < boxes.length; i++) {
		var box = boxes[i];

		if (box.owner !== null) {
			isAnyBoxOwned = true;
			box.element.classList.add(getPlayerClass(box.owner));
		}
	}

	if (isAnyBoxOwned === false) {
		game.changePlayer();
	}
}

function onRestartClicked() {
	onSelectChanged();
}

function getPlayerClass(player) {
	if (player === YELLOW) {
		return 'yellow';
	}

	if (player === GREEN) {
		return 'green';
	}

	if (player === null) {
		return 'none';
	}

	throw 'Unknown player: ' + player;
}

Game = (function () {
	Game.prototype.changePlayer = function () {
		var temp = this.currentPlayer;
		this.currentPlayer = this.opponentPlayer;
		this.opponentPlayer = temp;
	}

	function Game(numRows, numCols, currentPlayer) {
		this.board = new Board(numRows, numCols);
		this.currentPlayer = currentPlayer;
		this.opponentPlayer = -currentPlayer;
	}

	function play() {

	}

	return Game;
})();

Board = (function () {
	function Board(numRows, numCols) {
		this.boxes = new Array(numRows);
		this.boxList = [];
		this.lines = new Array((numRows + 1) * numCols + numRows * (numCols + 1));

		var boxId = 0;

		for (var row = 0; row < numRows; row++) {
			this.boxes[row] = new Array(numCols);

			for (var col = 0; col < numCols; col++) {
				var lines = new Array(4), line;
				var baseId = row * (2 * numCols + 1) + col;

				// Up line
				if (row === 0) {
					line = lines[0] = new Line(baseId);
					this.lines[line.id] = line;
				} else {
					line = lines[0] = this.boxes[row - 1][col].downLine;
				}

				// Right line
				line = lines[1] = new Line(baseId + numCols + 1);
				this.lines[line.id] = line;

				// Down line
				line = lines[2] = new Line(baseId + 2 * numCols + 1);
				this.lines[line.id] = line;

				// Left line
				if (col === 0) {
					line = lines[3] = new Line(baseId + numCols);
					this.lines[line.id] = line;
				} else {
					lines[3] = this.boxes[row][col - 1].rightLine;
				}

				var box = this.boxes[row][col] = new Box(boxId, row, col, lines);
				this.boxList.push(box);
				++boxId;
			}
		}
	}

	return Board;
})();

Box = (function () {

	Object.defineProperties(Box.prototype, {
		numOwnedLines: {
			get: function () {
				var count = 0;

				for (var i = 0; i < this.lines.length; i++) {
					if (this.lines[i].owner) {
						++count;
					}
				}

				return count;
			}
		},
		isCritical: {
			get: function () { return this.numOwnedLines === 3; }
		}
	});

	function Box(id, row, col, lines) {
		this.id = id;

		if (!lines) {
			throw 'lines is set';
		}

		if (lines.length != 4) {
			throw "lines' length is wrong";
		}

		this.row = row;
		this.column = col;
		this.owner = null;
		this.lines = lines;

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];

			if (line.boxes.indexOf(this) < 0) {
				line.boxes.push(this);
			}
		}

		this.upLine = lines[0];
		this.rightLine = lines[1];
		this.downLine = lines[2];
		this.leftLine = lines[3];
	}

	return Box;
})();

Line = (function () {
	Object.defineProperties(Line.prototype, {
		owner: {
			get: function () { return this._owner; },
			set: function (value) {
				this._owner = value;

				for (var i = 0; i < this.boxes.length; i++) {
					var box = this.boxes[i];

					if (box.numOwnedLines === 4) {
						box.owner = value;
					}
				}
			}
		}
	});

	function Line(id) {
		this.id = id;
		this.boxes = [];
		this._owner = null;
	}

	return Line;
})();