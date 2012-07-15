if (!window.aiList) {
	window.aiList = [];
}

window.aiList.push({
	name: 'Random AI',
	think: function (game) {
		if (game.isEnded) {
			return null;
		}

		var lines = game.emptyLines;
		var index = Math.floor(Math.random() * lines.length);
		return lines[index];
	}
});