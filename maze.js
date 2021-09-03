/* jshint esversion:8 */
import {DisjointSet} from "./disjointset.js";

function randomInt(n) {
	return Math.floor(Math.random()*n);
}

function shuffle(array) {
	for (let i = 0; i < array.length-1; i++) {
		let randomIndex = i + randomInt(array.length-i);
		[array[i], array[randomIndex]] = [array[randomIndex], array[i]];
	}
}

export class Maze {

	constructor(x, y, rowSize, colSize) {
		this.x = x;
		this.y = y;
		this.rowSize = rowSize;
		this.colSize = colSize;
		[this.passages, this.cells] = this.createGraph();

		const finalCell = this.cells[Math.floor(rowSize/2)][colSize-1];
		finalCell.neighborNum += 1;
		finalCell.isFinal = true;

		this.emptyDeadends = this.cells.flat().filter((cell) => cell.neighborNum === 1);
		this.fullDeadends = [];
		this.draw();
		this.initLetters();
	}

	draw() {
		ctx.fillStyle = Maze.wallColor;
		ctx.fillRect(this.x, this.y,
			Maze.bothWidth*this.rowSize + Maze.wallWidth,
			Maze.bothWidth*this.colSize + Maze.wallWidth
		);

		for (const column of this.cells) {
			for (const cell of column) {
				cell.draw();
			}
		}
		ctx.fillStyle = Maze.emptyColor;
		for (const [cell1, cell2] of this.passages) {
			this.drawWall(cell1, cell2);
		}
	}

	drawWall(cell1, cell2, color) {
		if (!color) {
			if (cell1.isFinal || cell2.isFinal) {
				color = Maze.finalColor;
			} else {
				color = Maze.emptyColor;
			}
		}
		ctx.fillStyle = color;

		if (cell1.col == cell2.col) {
			ctx.fillRect(
				this.x + Maze.bothWidth*cell1.col+Maze.wallWidth,
				this.y + Maze.bothWidth*Math.max(cell1.row, cell2.row),
				Maze.cellWidth, Maze.wallWidth);
		} else {
			ctx.fillRect(
				this.x + Maze.bothWidth*Math.max(cell1.col, cell2.col),
				this.y + Maze.bothWidth*cell1.row+Maze.wallWidth,
				Maze.wallWidth, Maze.cellWidth);
		}
	}

	createGraph() {
		// The algorithm used is taken from:
		// https://en.wikipedia.org/wiki/Maze_generation_algorithm#Randomized_Kruskal's_algorithm

		// Each cell (c, r) in the maze is in the index r*rowSize+c in the disjointset and the cells array
		let subtrees = new DisjointSet(this.rowSize*this.colSize);

		let cells = [];
		for (let col = 0; col < this.rowSize; col++) {
			cells.push([]);
			for (let row = 0; row < this.colSize; row++) {
				cells[col][row] = new Cell(col, row, this.x, this.y);
			}
		}

		let walls = [];
		for (let col = 0; col < this.rowSize; col++) {
			for (let row = 0; row < this.colSize; row++) {
				if (col != this.rowSize-1) {
					walls.push([cells[col][row], cells[col+1][row]]);
				}
				if (row != this.colSize-1) {
					walls.push([cells[col][row], cells[col][row+1]]);
				}
			}
		}
		shuffle(walls);

		let passages = [];
		for (let wall of walls) {
			let node1 = wall[0].row*this.rowSize + wall[0].col;
			let node2 = wall[1].row*this.rowSize + wall[1].col;
			if (subtrees.sameSet(node1, node2)) {
				continue;
			}
			passages.push(wall);
			subtrees.merge(node1, node2);
			wall[0].neighborNum++;
			wall[1].neighborNum++;
			if (subtrees.setNum == 1) {
				break;
			}
		}
		return [passages, cells];
	}

	initLetters() {
		const time = new Date().getTime();
		for (let i = 0; i < Math.floor(Maze.letterDuration/500); i++) {
			this.initLetter(time - i*500);
		}
		setInterval(this.initLetter.bind(this), 500);
		setInterval(this.redrawLetters.bind(this), 50);
	}

	initLetter(time = new Date().getTime()) {
		const letter = String.fromCharCode(97+randomInt(26));
		const cell = this.emptyDeadends.splice(randomInt(this.emptyDeadends.length), 1)[0];
		this.fullDeadends.push(cell);
		cell.initLetter(time, letter);
		setTimeout((() => this.removeLetter(cell)).bind(this), time+Maze.letterDuration-new Date().getTime());
	}

	removeLetter(cell) {
		const cellIndex = this.fullDeadends.indexOf(cell);
		if (cellIndex >= 0) {
			this.fullDeadends.splice(cellIndex, 1);
		}
		this.emptyDeadends.push(cell);
		cell.removeLetter();
	}

	redrawLetters() {
		for (let cell of this.fullDeadends) {
			cell.draw();
		}
	}

	getCellInCoords(x, y) {
		x -= this.x;
		y -= this.y;
		if (x % Maze.bothWidth >= Maze.wallWidth && y % Maze.bothWidth >= Maze.wallWidth) {
			const col = Math.floor(x / Maze.bothWidth);
			const row = Math.floor(y / Maze.bothWidth);
			if (this.cells[col] && this.cells[col][row]) {
				return this.cells[col][row];
			}
		}
		return null;
	}

	isNeighbor(cell1, cell2) {
		if (Math.abs(cell1.col-cell2.col) + Math.abs(cell1.row-cell2.row) !== 1) {
			return false;
		}

		// this.passage includes {cell1, cell2}
		return this.passages.filter((x)=>x[0] === cell1 && x[1] === cell2 || x[1] === cell1 && x[0] === cell2).length > 0;
	}

}

// Is this usage normal?
Maze.cellWidth = 25;
Maze.wallWidth = 5;
Maze.bothWidth = Maze.cellWidth + Maze.wallWidth;
Maze.emptyColor = "#FFFFFF";
Maze.wallColor = "#000000";
Maze.deadendColor = "#EEEEEE";
Maze.highlightColor = "#99DDFF";
Maze.finalColor = "#00FF00";
Maze.letterDuration = 30000; // in milliseconds


class Cell {
	constructor(col, row, mazeX, mazeY) {
		this.col = col;
		this.row = row;
		this.neighborNum = 0;
		this.letter = " ";
		this.x = mazeX + Maze.bothWidth*col + Maze.wallWidth;
		this.y = mazeY + Maze.bothWidth*row + Maze.wallWidth;
		this.spawnTime = 0;
		this.highlighted = false;
	}

	draw() {
		if (this.isFinal) {
			ctx.fillStyle = Maze.finalColor;
			ctx.fillRect(this.x, this.y+Maze.cellWidth, Maze.cellWidth, Maze.wallWidth);
		} else if (this.highlighted) {
			ctx.fillStyle = Maze.highlightColor;
		} else if (this.neighborNum === 1) {
			ctx.fillStyle = Maze.deadendColor;
		} else {
			ctx.fillStyle = Maze.emptyColor;
		}
		ctx.fillRect(
			this.x,
			this.y,
			Maze.cellWidth, Maze.cellWidth);
		if (this.letter != " ") {
			let opacity = 1 - (new Date().getTime() - this.spawnTime)/Maze.letterDuration;
			ctx.fillStyle = `rgba(0, 0, 96, ${opacity})`;
			ctx.fillText(this.letter, this.x+Maze.cellWidth/2, this.y+Maze.cellWidth/2);
		}
	}

	initLetter(time, letter) {
		this.letter = letter;
		this.spawnTime = time;
		this.draw();
	}

	removeLetter() {
		this.letter = " ";
		this.spawnTime = 0;
		this.draw();
	}
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.font = "24px serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";