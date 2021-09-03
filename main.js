/* jshint esversion:8 */
import {Maze} from "./maze.js";

function mouseDown(event) {
	if (!maze) {
		return;
	}
	const pressedCell = maze.getCellInCoords(event.offsetX, event.offsetY);
	if (!pressedCell) {
		return;
	}
	isDragging = true;
	pressedCell.highlighted = true;
	pressedCell.draw();
	dragPath.push(pressedCell);
};

function mouseMove(event) {
	if (!maze || !isDragging || !dragPath.length) {
		return;
	}
	const pressedCell = maze.getCellInCoords(event.offsetX, event.offsetY);
	const prevCell = dragPath[dragPath.length-1];
	if (!pressedCell || !maze.isNeighbor(prevCell, pressedCell)) {
		return;
	}
	if (pressedCell.isFinal) {
		inputstr += dragPath[0].letter;
		input.innerHTML = inputstr;
		mouseUp(event);
	} else if (pressedCell.highlighted) {
		maze.drawWall(prevCell, pressedCell);
		prevCell.highlighted = false;
		prevCell.draw();
		dragPath.pop();
	} else {
		maze.drawWall(prevCell, pressedCell, Maze.highlightColor);
		pressedCell.highlighted = true;
		pressedCell.draw();
		dragPath.push(pressedCell);
	}
};

function mouseUp(event) {
	if (!isDragging) {
		return;
	}
	let prevCell = null;
	for (const cell of dragPath) {
		cell.highlighted = false;
		cell.draw();
		if (prevCell != null) {
			maze.drawWall(prevCell, cell);
		}
		prevCell = cell;
	}
	dragPath = [];
	isDragging = false;
};

const input = document.getElementById("input");
let isDragging = false;
let dragPath = [];
let inputstr = "";
let maze = null;
window.onload = function() {
    document.body.onmousedown = (event) => mouseDown(event);
    document.body.onmousemove = (event) => mouseMove(event);
    document.body.onmouseup = (event) => mouseUp(event);
    maze = new Maze(0, 0, 41, 21);
};
