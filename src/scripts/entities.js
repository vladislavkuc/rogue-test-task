class Entity {
	constructor(maxHealth, strength, map, healthClass) {
		this.maxHealth = maxHealth;
		this.health = maxHealth;
		this.strength = strength;
		this.map = map;
		this.healthClass = healthClass;

		let xCord = Utility.getRandomInt(0, config.width - 1);
		let yCord = Utility.getRandomInt(0, config.height - 1);
		while(this.map.map[yCord][xCord] != 1) {
			xCord = Utility.getRandomInt(0, config.width - 1);
			yCord = Utility.getRandomInt(0, config.height - 1);
		}
		this.xCord = xCord;
		this.yCord = yCord;
	}

	getDamage (damage, className) {
		if (this.health > damage) {
			this.health = this.health - damage;
		} else {
			this.health = 0;
		}

		this.clear(className);
		if (this.health > 0) { 
			this.render(className)
		} else {
			this.die()
		};
	}

	die() {}

	clear(className) {
		const domElement = this.map.getTileDOM(this.xCord, this.yCord);
		domElement.removeChild(domElement.querySelector(`.${this.healthClass}`));
		domElement.classList.remove(className);
	}
	
	render(styleClass) {
		const domElement = this.map.getTileDOM(this.xCord, this.yCord);
		const healthBar = document.querySelector(`#${this.healthClass}`).content.cloneNode(true);
		healthBar.querySelector(`.${this.healthClass}`).style.width = `${Math.floor(this.health*100/this.maxHealth)}%`
		domElement.appendChild(healthBar);
		domElement.classList.add(styleClass);
	}
}

class Player extends Entity {
	constructor(maxHealth, strength, map, healthClass, enemies){
		super(maxHealth, strength, map, healthClass);
		this.moveDelay = false;
		this.enemies = enemies;
	}

	init() {
		this.render();
		document.addEventListener('keydown', this.makeAction.bind(this));
	}

	makeAction(event) {
		event.code == 'KeyW' ? this.move(this.xCord, this.yCord - 1) :
		event.code == 'KeyA' ? this.move(this.xCord - 1, this.yCord) :
		event.code == 'KeyS' ? this.move(this.xCord, this.yCord + 1) :
		event.code == 'KeyD' ? this.move(this.xCord + 1, this.yCord) :
		event.code == 'Space' ? this.atack(event) : null;
	}

	move(xTarget, yTarget) {
		const tileType = this.map.getTileType(xTarget, yTarget)
		if (this.moveDelay || tileType == 'wall' || tileType == 'outoffield') return;
		this.clear(config.playerClass);
		this.yCord = yTarget;
		this.xCord = xTarget;
		this.render();
		this.map.map[this.yCord][this.xCord] = 1;
		
		switch (tileType) {
			case 'potion':
				this.map.getTileDOM(this.xCord, this.yCord).classList.remove('tileHP');
				this.heal();
				break;
			case 'sword':
				this.map.getTileDOM(this.xCord, this.yCord).classList.remove('tileSW');
				this.increaseStregth();
				break;
		}

		this.moveDelay = true;
		setTimeout(() => this.moveDelay = false, 200);
	}

	atack(event) {
		event.preventDefault();
		this.enemies.forEach(enemy => {
			if (Math.abs(enemy.xCord - this.xCord) <= 1 && Math.abs(enemy.yCord - this.yCord) <= 1) {
				enemy.getDamage(this.strength, config.enemyClass);
				this.getDamage(enemy.strength, config.playerClass);
			}
		});
		this.enemies = this.enemies.filter(enemy => enemy.health > 0);
	}

	heal() {
		this.health = this.maxHealth;
		this.clear(config.playerClass);
		this.render();
	}

	increaseStregth() {
		this.strength = this.strength + config.swordPower;
	}

	render() {
		super.render(config.playerClass);
	}
	
	die () {
		document.removeEventListener('keydown', this.makeAction.bind(this));
	}
}


class Enemy extends Entity {
	constructor(maxHealth, strength, map, healthClass){
		super(maxHealth, strength, map, healthClass);
	}

	init() {
		this.render();
		this.randomMoveInterval = setInterval(() => this.randomMove(), 1000);
	}

	render() {
		super.render(config.enemyClass);
	}

	randomMove() {
		// Умеют ходить по диагонали :)
		const xTarget = this.xCord + Utility.getRandomInt(-1, 1);
		const yTarget = this.yCord + Utility.getRandomInt(-1, 1);

		if (this.map.getTileType(xTarget, yTarget) !== 'floor') return;
		this.clear(config.enemyClass);
		this.xCord = xTarget;
		this.yCord = yTarget;
		this.render();
	}

	die() {
		clearInterval(this.randomMoveInterval);
	}
}
