if (!window.aiList) {
	window.aiList = [];
}

window.aiList.push({
	name: 'Simple AI',
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

		var index = Math.floor(Math.random() * lines.length);
		return lines[index];
	}
});