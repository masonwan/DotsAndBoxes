if (!window.aiList) {
	window.aiList = [];
}

window.aiList.push({
	name: 'Normal AI',
	think: function (game) {
		if (game.isEnded) {
			return null;
		}

		var lines = game.emptyLines;
		var safeChoices = [];

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var boxes = line.boxes;
			var isSafe = true;

			for (var j = 0; j < boxes.length; j++) {
				var box = boxes[j];

				if (box.numOwnedLines === 3) {
					// If the box is free to take, take it.
					return line;
				} else if (box.numOwnedLines === 2) {
						// Mark if the line could make the opponent getting score.
					isSafe = false;
				}
			}

			// If none of boxes is dangerous, then push the line into safe queue for later use.
			if (isSafe) {
				safeChoices.push(line);
			}
		}

		// Use the one of the safe choices, if any.
		if (safeChoices.length > 0) {
			var index = Math.floor(Math.random() * safeChoices.length);
			return safeChoices[index];
		}

		// Till here, the rest of empty boxes should all have exact two empty lines.
		// Identify all the chains in the current board.
		var chains = [];
		var emptyBoxes = game.emptyBoxes.slice(0);

		while (emptyBoxes.length > 0) {
			// Find each chain.
			var emptyBox = emptyBoxes.shift();
			var chainedBoxes = [];
			var boxes = [emptyBox];

			while (boxes.length > 0) {
				// Find the box's neighbors.
				var box = boxes.shift();
				chainedBoxes.push(box);

				var row = box.row, col = box.column;
				var neighborBoxes = [];

				if (row > 0 && box.upLine.owner === null) {
					// Up
					neighborBoxes.push(game.board.boxes[row - 1][col]);
				}

				if (col > 0 && box.leftLine.owner === null) {
					// Left
					neighborBoxes.push(game.board.boxes[row][col - 1]);
				}

				if (col < game.board.numCols - 1 && box.rightLine.owner === null) {
					// Right
					neighborBoxes.push(game.board.boxes[row][col + 1]);
				}

				if (row < game.board.numRows - 1 && box.downLine.owner === null) {
					// Down
					neighborBoxes.push(game.board.boxes[row + 1][col]);
				}

				for (var i = 0; i < neighborBoxes.length; i++) {
					var neighborBox = neighborBoxes[i];

					// If the neighbor box is net yet processed
					if (emptyBoxes.indexOf(neighborBox) >= 0) {
						emptyBoxes.splice(emptyBoxes.indexOf(neighborBox), 1);
						boxes.push(neighborBox);
					}
				}
			}

			chains.push({
				boxes: chainedBoxes
			});
		}

		if (chains.length <= 0) {
			return null;
		}

		chains.sort(function (chain1, chain2) { return (chain1.boxes.length === chain2.boxes.length) ? 0 : (chain1.boxes.length > chain2.boxes.length ? 1 : -1); });

		// Find a random chain and choose a random line in it.
		var firstChain = chains[0];
		var smallestChains = [firstChain];

		for (var i = 1; i < chains.length; i++) {
			var chain = chains[i];

			if (chain.boxes.length > firstChain.boxes.length) {
				break;
			}

			smallestChains.push(chain);
		}

		var randomChain = smallestChains[Math.floor(Math.random() * smallestChains.length)];
		var lines = [];
		randomChain.boxes.forEach(function (box, index, array) {
			for (var i = 0; i < box.lines.length; i++) {
				var line = box.lines[i];

				if (line.owner === null) {
					lines.push(line);
				}
			}
		});
		return lines[Math.floor(Math.random() * lines.length)];
	}
});