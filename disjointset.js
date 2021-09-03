/* jshint esversion:8 */

export class DisjointSet {

	constructor(size) {
		/*
		If the stored value is nonnegative, the parent node is being stored
		If it is negative, this is a root node and the size of the set is being stored
		*/
		this.nodes = [];
		for (let i = 0; i < size; i++) {
			this.nodes.push(-1);
		}
		this.setNum = size;
	}

	getParent(node) {
		let parent;
		if (this.nodes[node] >= 0) {
			parent = this.getParent(this.nodes[node]);
			this.nodes[node] = parent;
		} else {
			parent = node;
		}
		return parent;
	}

	sameSet(node1, node2) {
		return this.getParent(node1) == this.getParent(node2);
	}

	merge(node1, node2) {
		let parent1 = this.getParent(node1);
		let parent2 = this.getParent(node2);
		if (parent1 == parent2) {
			return;
		}
		if (-this.nodes[parent1] >= -this.nodes[parent2]) {
			this.nodes[parent1] += this.nodes[parent2];
			this.nodes[parent2] = parent1;
		} else {
			this.nodes[parent1] += this.nodes[parent2];
			this.nodes[parent2] = parent1;
		}
		this.setNum--;
	}

}