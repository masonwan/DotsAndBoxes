// Game objects
Color = { Yellow: 1, Green: -1 };

Game = (function () {
	Game.prototype.changePlayer = function () {
		var temp = this.currentPlayer;
		this.currentPlayer = this.opponentPlayer;
		this.opponentPlayer = temp;
	}

	Game.prototype.play = function (line) {
		if (line == null) {
			throw 'line is null';
		}

		if (line.owner !== null) {
			throw 'Play a owned line.';
		}

		line.owner = game.currentPlayer;
		var ownedBoxes = [];

		line.boxes.forEach(function (box, index, array) {
			if (box.owner !== null) {
				this.emptyBoxes.splice(this.emptyBoxes.indexOf(box), 1);
				ownedBoxes.push(box);
			}
		}, this);

		if (ownedBoxes.length === 0) {
			this.changePlayer();
		}

		this.undoList.push(line);
		this.redoList.length = 0;

		this.emptyLines.splice(this.emptyLines.indexOf(line), 1);

		return ownedBoxes;
	}

	Game.prototype.undo = function () {
		if (this.undoList.length <= 0) {
			return;
		}

		var line = this.undoList.pop();
		line.owner = null;

		var restoredBoxes = [];

		line.boxes.forEach(function (box, index, array) {
			box.owner = null;
			box.update();

			if (box.isCritical) {
				restoredBoxes.push(box);
				this.emptyBoxes.push(box);
			}
		}, this);

		if (restoredBoxes.length === 0) {
			this.changePlayer();
		}

		this.redoList.push(line);
		this.emptyLines.push(line);

		return line;
	}

	Game.prototype.redo = function () {
		if (this.redoList.length <= 0) {
			return;
		}

		var line = this.redoList.pop();
		line.owner = this.currentPlayer;
		var ownedBoxes = [];

		line.boxes.forEach(function (box, index, array) {
			if (box.owner !== null) {
				this.emptyBoxes.splice(this.emptyBoxes.indexOf(box), 1);
				ownedBoxes.push(box);
			}
		}, this);

		if (ownedBoxes.length === 0) {
			this.changePlayer();
		}

		this.undoList.push(line);
		this.emptyLines.splice(this.emptyLines.indexOf(line), 1);

		return ownedBoxes;
	}

	Object.defineProperties(Game.prototype, {
		isEnded: {
			get: function () {
				return this.emptyLines.length === 0;
			}
		}
	});

	function Game(numRows, numCols, currentPlayer) {
		this.board = new Board(numRows, numCols);
		this.currentPlayer = currentPlayer;
		this.opponentPlayer = -currentPlayer;
		this.undoList = [];
		this.redoList = [];
		this.emptyLines = this.board.lines.slice(0);
		this.emptyBoxes = this.board.boxList.slice(0);

		this.scoreTable = {};
		this.scoreTable[Color.Green] = 0;
		this.scoreTable[Color.Yellow] = 0;
	}

	return Game;
})();

Board = (function () {
	function Board(numRows, numCols) {
		this.numRows = numRows;
		this.numCols = numCols;
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
	Box.prototype.update = function () {
		var count = 0;

		for (var i = 0; i < this.lines.length; i++) {
			if (this.lines[i].owner) {
				++count;
			}
		}

		this.numOwnedLines = count;
		this.isCritical = count === 3;
	}

	function Box(id, row, col, lines) {
		this.id = id;

		if (!lines) {
			throw 'lines is set';
		}

		if (lines.length != 4) {
			throw "lines' length is wrong";
		}

		this.numOwnedLines = 0;
		this.isCritical = false;

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
					box.update();

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

// Local variables
if (!window.aiList) {
	window.aiList = [];
}

document.addEventListener('readystatechange', onReadyStateChanged);

var game = null;
var numRows = numCols = 4;
var players = {}; 26
players[Color.Yellow] = null;
players[Color.Green] = null;

var restartButton, undoButton, redoButton;

function onReadyStateChanged() {
	document.removeEventListener('readystatechange', onReadyStateChanged);

	// Buttons
	restartButton = document.querySelector('#restart');
	restartButton.addEventListener('click', onRestartClicked);

	undoButton = document.querySelector('#undo');
	undoButton.addEventListener('click', onUndoClicked);

	redoButton = document.querySelector('#redo');
	redoButton.addEventListener('click', onRedoClicked);

	window.addEventListener('keydown', onKeyPressed);

	// Grid size
	var selectElement = document.querySelector('#gridSize');
	selectElement.addEventListener('change', onGridSizeChanged);
	onGridSizeChanged();

	// Resize
	window.addEventListener('resize', changeBoardSize);

	// Player options
	var selectElements = document.querySelectorAll('.player');

	for (var i = 0; i < selectElements.length; i++) {
		selectElements[i].addEventListener('change', onPlayerChanged);
	}

	generatePlayerOptions();
}

// Grid size
function onGridSizeChanged() {
	var selectElement = document.querySelector('select');
	var value = selectElement.value;
	numRows = numCols = (value < 2 || value > 10) ? 3 : parseInt(value);
	game = new Game(numRows, numCols, Color.Yellow);

	generateBoard();
	updateButtons();

	clearTimeout(timeoutId);
	continuePlay();
}

function changeBoardSize() {
	var sidebarWidth = 240;
	var sidebarElement = document.querySelector('#sidebar');
	sidebarElement.style.minWidth = sidebarElement.style.width = sidebarWidth + 'px';

	var boardElement = document.querySelector('#board');
	var availableWidth = Math.max(window.innerWidth - (2 * ((numCols + 1) * 2) - sidebarWidth), 500);
	var availableHeight = Math.max(window.innerHeight - (2 * ((numRows + 1) * 2)), 500);
	var boardLength = Math.min(availableWidth, availableHeight);

	var ratioDotToBox = 4;
	var dotLength = Math.floor(boardLength / ((ratioDotToBox * numCols) + (numCols + 1)));
	var boxLength = dotLength * ratioDotToBox;

	var elementNodeList = document.querySelectorAll('#board td');

	for (var i = 0; i < elementNodeList.length; i++) {
		var element = elementNodeList[i];
		var height, width;

		if (element.classList.contains('dot')) {
			height = width = dotLength;
		} else if (element.classList.contains('vline')) {
			width = dotLength;
			height = boxLength;
		} else if (element.classList.contains('hline')) {
			width = boxLength;
			height = dotLength;
		} else if (element.classList.contains('box')) {
			height = width = boxLength;
		}

		element.style.minHeight = element.style.height = height + 'px';
		element.style.minWidth = element.style.width = width + 'px';
	}
}

// Player, AI
function generatePlayerOptions() {
	var selectElements = document.querySelectorAll('.player');

	for (var i = 0; i < selectElements.length; i++) {
		var optionElement;
		optionElement = document.createElement('option');
		optionElement.value = 0;
		optionElement.selected = true;
		optionElement.innerText = 'Human';
		selectElements[i].appendChild(optionElement);

		for (var j = 0; j < aiList.length; j++) {
			var ai = aiList[j];
			optionElement = document.createElement('option');
			optionElement.value = j + 1;
			optionElement.innerText = ai.name;

			selectElements[i].appendChild(optionElement);
		}
	}
}

function onPlayerChanged() {
	var target = event.target;
	var index = parseInt(target.value);
	var player = (index === 0) ? null : aiList[index - 1];

	if (target.classList.contains('yellow')) {
		players[Color.Yellow] = player;
	} else if (target.classList.contains('green')) {
		players[Color.Green] = player;
	}

	window.clearTimeout(timeoutId);
	continuePlay();
}

var delayedMilliseconds = 10;
var timeoutId;

function continuePlay() {
	if (game.isEnded) {
		return;
	}

	var player = players[game.currentPlayer];

	if (player === null) {
		// Human player, wait for play.
		return;
	}

	timeoutId = setTimeout(function () {
		var line = player.think(game);
		playLine(line);
		continuePlay();
	}, delayedMilliseconds);
}

function onLineClicked() {
	if (players[game.currentPlayer] !== null) {
		return;
	}

	var target = event.target;
	var line = game.board.lines[target.lineId];

	if (line.owner !== null) {
		return;
	}

	playLine(line);
	continuePlay();
}

function playLine(line) {
	line.element.classList.add(getPlayerClass(game.currentPlayer));
	line.element.classList.remove('none');

	game.play(line);

	updateBoard();
	updateScoreBoard();
	updateButtons();
}

// Board
function generateBoard() {
	var boardTable = document.querySelector('#board');

	while (boardTable.hasChildNodes()) {
		boardTable.removeChild(boardTable.lastChild);
	}

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
	updateScoreBoard();
}

function updateBoard() {
	game.board.lines.forEach(function (line) {
		line.element.classList.remove(getPlayerClass(Color.Green));
		line.element.classList.remove(getPlayerClass(Color.Yellow));
		line.element.classList.remove(getPlayerClass(null));
		line.element.classList.add(getPlayerClass(line.owner));
	}, this);

	game.board.boxList.forEach(function (box) {
		box.element.classList.remove(getPlayerClass(Color.Green));
		box.element.classList.remove(getPlayerClass(Color.Yellow));
		box.element.classList.remove(getPlayerClass(null));
		box.element.classList.add(getPlayerClass(box.owner));
	}, this);
}

function updateScoreBoard() {
	var boxes = game.board.boxList;
	var scoreTable = {};
	scoreTable[Color.Yellow] = 0;
	scoreTable[Color.Green] = 0;

	for (var i = 0; i < boxes.length; i++) {
		var box = boxes[i];

		if (box.owner !== null) {
			++scoreTable[box.owner];
		}
	}

	var yellowDiv = document.querySelector('.score.yellow');
	yellowDiv.innerText = scoreTable[Color.Yellow];
	var greenDiv = document.querySelector('.score.green');
	greenDiv.innerText = scoreTable[Color.Green];
}

// Buttons, Shortcuts
function onRestartClicked() {
	clearTimeout(timeoutId);
	onGridSizeChanged();
}

function onUndoClicked() {
	var line = game.undo();

	if (line == null) {
		return;
	}

	updateScoreBoard();
	updateBoard();
	updateButtons();
}

function onRedoClicked() {
	game.redo();
	updateScoreBoard();
	updateBoard();
	updateButtons();
}

function updateButtons() {
	undoButton.disabled = game.undoList.length <= 0;
	redoButton.disabled = game.redoList.length <= 0;

	var currentPlayerScoreElement = document.querySelector('.score.' + getPlayerClass(game.currentPlayer));
	var oppoentPlayerScoreElement = document.querySelector('.score.' + getPlayerClass(game.opponentPlayer));
}

function onKeyPressed(ev) {
	if (ev.keyCode === 85) {
		onUndoClicked();
	} else if (ev.keyCode === 82) {
		onRedoClicked();
	}
}

// Helper
function getPlayerClass(player) {
	switch (player) {
		case Color.Yellow:
			return 'yellow';
		case Color.Green:
			return 'green';
		case null:
			return 'none';
		default:
			throw 'Unknown player: ' + player;
	}
}

Object.prototype.clone = function () {
	var obj = (this instanceof Array) ? [] : {};

	for (i in this) {
		if (i !== 'clone') {
			if (this[i] && typeof this[i] === 'object') {
				obj[i] = this[i].clone();
			} else {
				obj[i] = this[i];
			}
		}
	}

	return obj;
};