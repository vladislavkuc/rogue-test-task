class Map {
	constructor(config) {
		this.config = config;
		this.field = document.querySelector(`.${config.fieldClass}`);
		this.map = this.generateMap();
		this.tiles = Array.from(document.querySelectorAll(`.${config.tileClass}`));
	}

	generateMap() {
		// Добавление плиток из шаблона в div.field
		const tileTemp = document.querySelector(`#${this.config.tileClass}`);
		this.clearField();
		for (let i = 0;i < this.config.width*this.config.height; i++) {this.field.appendChild(tileTemp.content.cloneNode(true))};

		// Создание двумерного массива карты
		let mapArray = Array(this.config.height).fill(Array(this.config.width).fill(0));

		// Создание коридоров
		const gorizontalTunnels = this.generateTunnelsList(3, 5);
		const verticalTunnels = this.generateTunnelsList(3, 5);
		mapArray = mapArray.map((row, rowIndex) => row.map((_, cellIndex) => gorizontalTunnels.includes(rowIndex) || verticalTunnels.includes(cellIndex) ? 1 : 0))

		// Создание комнат на коридорах
		const rooms = this.generateRoomList(this.config.rooms, gorizontalTunnels, verticalTunnels);
		rooms.forEach(({ xCord, yCord, height, width}) => {
			for (let y = yCord; y < yCord + height; y++)
			for (let x = xCord; x < xCord + width; x++) {
				mapArray[y][x] = 1;
			}
		});

		// Создание зелий
		const potions = this.generateConsumesList(mapArray, this.config.potionsCount);
		potions.forEach(({ xCord, yCord }) => mapArray[yCord][xCord] = 2);

		// Создание мечей
		const swords = this.generateConsumesList(mapArray, this.config.swordsCount);
		swords.forEach(({ xCord, yCord }) => mapArray[yCord][xCord] = 3);

		return mapArray;
	}

	generateTunnelsList(min, max) {
		const tunnelsCount = Utility.getRandomInt(min, max);
		const tunnels = [];
		for (let i = 0; i < tunnelsCount; i++) {
			let tunnelInd = Math.floor(Math.random()*this.config.height);
			while (tunnels.includes(tunnelInd) || tunnels.includes(tunnelInd + 1) || tunnels.includes(tunnelInd - 1)) {
				tunnelInd = Math.floor(Math.random()*this.config.height);
			}
			tunnels.push(tunnelInd);
		}

		return tunnels;
	}

	generateRoomList({ minCount, maxCount, minWidth, maxWidth, minHeight, maxHeight }, gorizontalTunnels, verticalTunnels) {
		const roomsList = [];
		const roomsCount = Utility.getRandomInt(minCount, maxCount);
		
		for (let i = 0; i < roomsCount; i++) {
			let success = false;
			const width = Utility.getRandomInt(minWidth, maxWidth);
			const height = Utility.getRandomInt(minHeight, maxHeight);
			let xCord = Utility.getRandomInt(0, this.config.width - width);
			let yCord = Utility.getRandomInt(0, this.config.height - height);
			while (!success) {
				if (gorizontalTunnels.some(tunnel => tunnel >= yCord - 1 && tunnel <= yCord + height) 
				|| verticalTunnels.some(tunnel => tunnel >= xCord - 1 && tunnel <= xCord + width)) {
					success = true;
				} else {
					xCord = Utility.getRandomInt(0, this.config.width - width);
					yCord = Utility.getRandomInt(0, this.config.height - height);
				}
			}

			roomsList.push({ width, height, xCord, yCord });
		}

		return roomsList;
	}

	generateConsumesList(mapArray, count) {
		const consumesList = [];
		for (let i = 0; i < count; i++) {
			let xCord = Utility.getRandomInt(0, this.config.width - 1);
			let yCord = Utility.getRandomInt(0, this.config.height - 1);
			while (consumesList.some((consume) => consume.xCord == xCord && consume.yCord == yCord) || mapArray[yCord][xCord] != 1) {
				xCord = Utility.getRandomInt(0, this.config.width - 1);
				yCord = Utility.getRandomInt(0, this.config.height - 1);
			}
			consumesList.push({xCord, yCord});
		}
		return consumesList;
	}

	getTileType(xCord, yCord) { 
		if (!this.map[yCord]) return 'outoffield';
		return this.map[yCord][xCord] == 0 ? 'wall' :
		this.map[yCord][xCord] == 1 ? 'floor' :
		this.map[yCord][xCord] == 2 ? 'potion' :
		this.map[yCord][xCord] == 3 ? 'sword' :'outoffield';
	}

	getTileDOM = (xCord, yCord) => this.tiles[yCord * this.config.width + xCord];

	clearField() {
		while (this.field.firstChild) {
			this.field.removeChild(this.field.firstChild);
		}
	}

	render () {
		this.map.map((row, rowIndex) => {
			row.map((tile, tileIndex) => { this.tiles[rowIndex*config.width + tileIndex].classList.add(config.tilesClasses[tile]) })
		})
	}
}