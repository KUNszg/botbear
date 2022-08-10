const requireDir = require('require-dir');
const tools = require('../tools/tools.js');

module.exports = {
	name: 'delay',
	ping: true,
	description: 'This command will add the bot´s internal delay, to the end of the response. Example: "bb delay randomline NymN"',
	permission: 2000,
	category: 'Dev command',
	showDelay: true,
	execute: async (channel, user, input, perm) => {
		try {
			if (module.exports.permission > perm) {
				return;
			}
			input.splice(1, 1);

			let msg = input.join(' ');
			input = await tools.Alias(msg);
			let realcommand = input[1];

			if (realcommand === 'ping' || realcommand === 'delay') {
				return;
			}

			const commands = requireDir('../commands');

			if (typeof commands[realcommand] === 'undefined') {
				console.log('undefined');
				return;
			}

			let result = await commands[realcommand].execute(channel, user, input, perm);


			if (!result) {
				return;
			}

			return result;

		} catch (err) {
			console.log(err);
			return 'FeelsDankMan Error';
		}
	}
};