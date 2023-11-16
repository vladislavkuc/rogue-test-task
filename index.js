const config = {
	width: 40,
	height: 24,
	tileClass: 'tile',
	fieldClass: 'field',
	healthClass: 'health',
	playerClass: 'tileP',
	enemyClass: 'tileE',
	potionsCount: 10,
	swordsCount: 2,
	swordPower: 10,
	tilesClasses: {
		0: 'tileW',
		1: 'tile',
		2: 'tileHP',
		3: 'tileSW',
	},
	rooms: {
		minCount: 5,
		maxCount: 10,
		minHeight: 3,
		maxHeight: 8,
		minWidth: 3,
		maxWidth: 8,
	},
	playerStats: {
		maxHealth: 100,
		strength: 10,
	},
	enemyStats: {
		maxHealth: 50,
		strength: 5,
	}
};

class Utility {
	static getRandomInt(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1))
	}
}

class Game {
	constructor() {
		this.map = new Map(config);
		this.enemies = [];
		for (let i = 0; i < 10; i++)  this.enemies.push(new Enemy(config.enemyStats.maxHealth, config.enemyStats.strength, this.map, config.healthClass));
		this.player = new Player(config.playerStats.maxHealth, config.playerStats.strength, this.map, config.healthClass, this.enemies);
	}

	init () {
		this.map.render();
		this.enemies.forEach(enemy => enemy.init());
		this.player.init();
	}
}

const game = new Game();
game.init();