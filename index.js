const path = require('path'),
	chalk = require('chalk'),
	chokidar = require('chokidar'),
	invalidate = require('invalidate-module');

require('./src')();
chokidar.watch('./src', { ignoreInitial: true }).on('all', (event, filename) => {
	console.clear();
	// console.log(chalk.bgMagenta(' HOT PUSH! '), chalk.green(filename), 'now in sync!');
	invalidate(path.resolve(filename));
	try {
		require('./src')();
	} catch (e) { console.log(e); }
});
