/*
# Strategies
1. If any **free box** is found, finish it. Because if you don't do it, the opponent could do it without any penalty.
2. 

# Principles
1. To maintain control for a chain, the player must sacrifice two boxes.
2. To maintain control for a cycle, the player must sacrifice four boxes.

# Definitions
Chain: a set of boxes which are connected together by the unmarked lines. The set of boxes has an obvious start and end.
Control: the advantage which a player has for choosing the next chain opener.
Long chain: a chain which has three or more boxes. So the chain opener has the control.
Cycle: a chain where no end could be determined.
Free box: a box which has only one unmarked line and connect no other box.
*/

if (!window.aiList) {
	window.aiList = [];
}

window.aiList.push({
	name: 'Smart AI',
	think: function (game) {
		if (game.isEnded) {
			return null;
		}
	}
});