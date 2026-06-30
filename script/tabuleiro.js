const STEP = 75;
const GAP = 4;
const TILE_SIZE = STEP - GAP;

const ORIGIN_X = 0;
const ORIGIN_Y = 0;

const COLS = 15;
const ROWS = 9;

const cells = [];

for (let c = 4; c <= 10; c++) cells.push({ c, r: 0 });

const rightStair = [
  [10, 11],
  [11, 12, 13],
  [13, 14],
  [14],
  [14, 13],
  [13, 12, 11],
  [11, 10],
];

rightStair.forEach((cols, i) => {
  const r = i + 1;
  cols.forEach(c => cells.push({ c, r }));
});

for (let c = 10; c >= 4; c--) cells.push({ c, r: 8 });

const leftStair = [
  [4, 3],
  [3, 2, 1],
  [1, 0],
  [0],
  [0, 1],
  [1, 2, 3],
  [3, 4],
];

leftStair.forEach((cols, i) => {
  const r = 7 - i;
  cols.forEach(c => cells.push({ c, r }));
});


function findIndex(r, c) {
  return cells.findIndex(cell => cell.r === r && cell.c === c);
}

cells[findIndex(1, 3)].cls = "pink";    // perto do Jogador 1 (topo-esquerda)
cells[findIndex(1, 11)].cls = "orange"; // perto do Jogador 2 (topo-direita)
cells[findIndex(7, 11)].cls = "purple"; // perto do Jogador 4 (base-direita)
cells[findIndex(7, 3)].cls = "blue";    // perto do Jogador 3 (base-esquerda)

const board = document.getElementById("board");
const tileEls = [];

cells.forEach((cell, i) => {
    const tile = document.createElement("div");
    tile.className = "tile" + (cell.cls ? " " + cell.cls : "");
    tile.style.left = (ORIGIN_X + cell.c * STEP) + "px";
    tile.style.top = (ORIGIN_Y + cell.r * STEP) + "px";
    tile.style.width = TILE_SIZE + "px";
    tile.style.height = TILE_SIZE + "px";
    tile.dataset.index = i;
    tile.title = "Casa " + (i + 1);
    board.appendChild(tile);
    tileEls.push(tile);
});

const token = document.createElement("div");
token.id = "token";
board.appendChild(token);


function placeTokenAt(index) {
    const tile = tileEls[index];
    const left = parseFloat(tile.style.left) + (CELL - 40) / 2;
    const top = parseFloat(tile.style.top) + (CELL - 40) / 2;
    token.style.left = left + "px";
    token.style.top = top + "px";
}

let currentIndex = 0;
placeTokenAt(currentIndex);

const rollBtn = document.getElementById("rollBtn");
const diceResult = document.getElementById("diceResult");

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function walkToken(steps) {
    if (steps <= 0) {
        rollBtn.disabled = false;
        return;
    }
    currentIndex = (currentIndex + 1) % tileEls.length;
    placeTokenAt(currentIndex);
    setTimeout(() => walkToken(steps - 1), 400);
}

rollBtn.addEventListener("click", () => {
    rollBtn.disabled = true;
    const value = rollDice();
    diceResult.textContent = value;
    walkToken(value);
});