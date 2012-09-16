(function () {
	document.addEventListener('readystatechange', onReadyStateChanged);

	function onReadyStateChanged() {
		if (document.readyState !== 'complete') {
			return;
		}

		document.removeEventListener('readystatechange', onReadyStateChanged);
		set();
	}

	function set() {
		if (typeof Game === 'undefined') {
			setTimeout(set, 0);
			return;
		}

		var changeEvent = document.createEvent('Event');
		changeEvent.initEvent('change', true, true);

		var gridElement = document.querySelector('#gridSize');
		gridElement.value = 4;
		gridElement.dispatchEvent(changeEvent);

		var lineIds = [0, 1, 4, 10, 11, 12, 13, 14, 20, 21, 22, 23, 24, 31, 33, 35, 36, 37, 39];

		lineIds.forEach(function (id, index) {
			playLine(game.board.lines[id]);
		});

		var selectElements = document.querySelectorAll('.player');
		selectElements[0].value = 0;	// Normal AI.
		selectElements[0].dispatchEvent(changeEvent);
		selectElements[1].value = 0;
		selectElements[1].dispatchEvent(changeEvent);

		console.log(game);
	}
})();