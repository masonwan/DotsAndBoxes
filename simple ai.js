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
					return line;
				} else if (box.numOwnedLines === 2) {
					isSafe = false;
				}
			}

			if (isSafe) {
				safeChoices.push(line);
			}
		}

		if (safeChoices.length > 0) {
			var index = Math.floor(Math.random() * safeChoices.length);
			return safeChoices[index];
		}

		var index = Math.floor(Math.random() * lines.length);
		return lines[index];
	}
});