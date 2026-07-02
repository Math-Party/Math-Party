import { carregar, salvar } from './storage.js';

// ---- Carrega jogadores salvos na tela anterior ----
const dadosSalvos = carregar();
const jogadoresSalvos = dadosSalvos.jogadores || [];
const desabilitadosSalvos = dadosSalvos.desabilitados || [];

const mapaCards = {
    'jogador-1': document.querySelector('.player-card.p1'),
    'jogador-2': document.querySelector('.player-card.p2'),
    'jogador-3': document.querySelector('.player-card.p3'),
    'jogador-4': document.querySelector('.player-card.p4'),
};

const corPorJogador = {
    'jogador-1': '--card1-bg',
    'jogador-2': '--card2-bg',
    'jogador-3': '--card3-bg',
    'jogador-4': '--card4-bg',
};

function aplicarJogadoresNosCards() {
    jogadoresSalvos.forEach((jogador) => {
        const card = mapaCards[jogador.id];
        if (!card) return;

        const nomeEl = card.querySelector('.name');
        if (nomeEl) nomeEl.textContent = jogador.nome;

        const scoreEl = card.querySelector('.score');
        if (scoreEl) scoreEl.textContent = `${jogador.pontos ?? 0} pontos`;
    });

    desabilitadosSalvos.forEach((jogador) => {
        const card = mapaCards[jogador.id];
        if (!card) return;
        card.classList.add('bloqueado');
    });
}
aplicarJogadoresNosCards();

function adicionarPontos(jogadorId, valor) {
    const jogador = jogadoresSalvos.find((j) => j.id === jogadorId);
    if (!jogador) return;

    jogador.pontos = (jogador.pontos ?? 0) + valor;

    const card = mapaCards[jogadorId];
    if (card) {
        const scoreEl = card.querySelector('.score');
        if (scoreEl) scoreEl.textContent = `${jogador.pontos} pontos`;
    }

    salvar({ jogadores: jogadoresSalvos, desabilitados: desabilitadosSalvos });
}

const STEP = 80;
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

function findIndexByCls(cls) {
    return cells.findIndex(cell => cell.cls === cls);
}

const casaInicialPorJogador = {
    'jogador-1': findIndexByCls('pink'),
    'jogador-2': findIndexByCls('orange'),
    'jogador-3': findIndexByCls('blue'),
    'jogador-4': findIndexByCls('purple'),
};

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

// ---- Tokens dos jogadores (imagem própria de cada um) ----
const tokenImagemPorJogador = {
    'jogador-1': '../images/adicaoToken.png',
    'jogador-2': '../images/divisaoToken.png',
    'jogador-3': '../images/subtracaoToken.png',
    'jogador-4': '../images/multiplicacaoToken.png',
};

const TOKEN_SIZE = 45; // deve bater com o width padrão de .player-token no CSS

// fator de correção visual — ajusta caso a imagem do token tenha proporção diferente
const escalaPorJogador = {
    'jogador-1': 1,
    'jogador-2': 1,
    'jogador-3': 1,
    'jogador-4': 1.2, // multiplicacaoToken é desenhado menor, compensa aqui
};

// como organizar N tokens dentro da mesma casa (offsets relativos ao centro)
const layoutsPorQuantidade = {
    1: [{ x: 0, y: 0 }],
    2: [{ x: -13, y: 0 }, { x: 13, y: 0 }],
    3: [{ x: -13, y: -10 }, { x: 13, y: -10 }, { x: 0, y: 14 }],
    4: [{ x: -13, y: -13 }, { x: 13, y: -13 }, { x: -13, y: 13 }, { x: 13, y: 13 }],
};

const tokensPorJogador = {};

jogadoresSalvos.forEach((jogador) => {
    const img = document.createElement('img');
    img.src = tokenImagemPorJogador[jogador.id];
    img.className = 'player-token';
    board.appendChild(img);

    tokensPorJogador[jogador.id] = {
        el: img,
        currentIndex: casaInicialPorJogador[jogador.id] ?? 0,
    };
});

// Reorganiza TODOS os tokens: agrupa por casa e ajusta tamanho/posição de cada grupo
function atualizarLayoutTokens() {
    const grupos = {}; // index da casa -> lista de jogadorIds

    jogadoresSalvos.forEach((jogador) => {
        const info = tokensPorJogador[jogador.id];
        if (!grupos[info.currentIndex]) grupos[info.currentIndex] = [];
        grupos[info.currentIndex].push(jogador.id);
    });

    Object.entries(grupos).forEach(([indexStr, jogadorIds]) => {
        const index = Number(indexStr);
        const tile = tileEls[index];
        const qtd = jogadorIds.length;

        const tamanhoBase = qtd === 1 ? TOKEN_SIZE : TOKEN_SIZE / (qtd >= 3 ? 2.2 : 1.7);
        const layout = layoutsPorQuantidade[Math.min(qtd, 4)];

        const centroX = parseFloat(tile.style.left) + TILE_SIZE / 2;
        const centroY = parseFloat(tile.style.top) + TILE_SIZE / 2;

        jogadorIds.forEach((jogadorId, i) => {
            const info = tokensPorJogador[jogadorId];
            const offset = layout[i] || { x: 0, y: 0 };

            const escalaCorrecao = escalaPorJogador[jogadorId] ?? 1;
            const tamanho = tamanhoBase * escalaCorrecao;

            // offset de posição usa a escala "base" (sem a correção visual),
            // pra o token maior não empurrar os outros de posição
            const escalaPosicao = tamanhoBase / TOKEN_SIZE;

            info.el.style.width = tamanho + 'px';
            info.el.style.left = (centroX + offset.x * escalaPosicao - tamanho / 2) + 'px';
            info.el.style.top = (centroY + offset.y * escalaPosicao - tamanho / 2) + 'px';
        });
    });
}

function placeTokenAt(jogadorId, index) {
    const info = tokensPorJogador[jogadorId];
    if (!info) return;

    info.currentIndex = index;
    atualizarLayoutTokens();
}

// posiciona todos os tokens na sua casa colorida inicial
jogadoresSalvos.forEach((jogador) => {
    placeTokenAt(jogador.id, casaInicialPorJogador[jogador.id] ?? 0);
});

// ---- Turno, cor do center e dado 3D ----
const center = document.getElementById('center');
const turnoTexto = document.getElementById('turnoTexto');
const dice = document.getElementById('dice');
const rollBtn = document.getElementById('rollBtn');

let turnoAtual = 0;
let totalX = 0;
let totalY = 0;

const rotacaoPorValor = {
    1: { x: 0,   y: 0 },
    2: { x: -90, y: 0 },
    3: { x: 0,   y: -90 },
    4: { x: 0,   y: 90 },
    5: { x: 90,  y: 0 },
    6: { x: 0,   y: 180 },
};

function proximaRotacao(atual, alvoMod) {
    const base = atual - (atual % 360);
    const voltasExtras = 360 * (2 + Math.floor(Math.random() * 2)); // 2 ou 3 voltas
    let alvo = base + voltasExtras + alvoMod;
    if (alvo <= atual) alvo += 360;
    return alvo;
}

function atualizarTurno() {
    const jogador = jogadoresSalvos[turnoAtual];
    if (!jogador) return;

    const varCor = corPorJogador[jogador.id];
    center.style.background = `var(${varCor})`;
    turnoTexto.textContent = `Sua vez: ${jogador.nome}`;
}

atualizarTurno();

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function girarDadoPara(valor) {
    const rot = rotacaoPorValor[valor];
    totalX = proximaRotacao(totalX, rot.x);
    totalY = proximaRotacao(totalY, rot.y);
    dice.style.transform = `rotateX(${totalX}deg) rotateY(${totalY}deg)`;
}

function walkToken(steps) {
    const jogador = jogadoresSalvos[turnoAtual];

    if (steps <= 0) {
        rollBtn.disabled = false;
        turnoAtual = (turnoAtual + 1) % jogadoresSalvos.length;
        atualizarTurno();
        return;
    }

    const info = tokensPorJogador[jogador.id];
    const proximoIndex = (info.currentIndex + 1) % tileEls.length;
    placeTokenAt(jogador.id, proximoIndex);

    setTimeout(() => walkToken(steps - 1), 400);
}

rollBtn.addEventListener('click', () => {
    rollBtn.disabled = true;
    const value = rollDice();
    girarDadoPara(value);

    // espera a animação do dado (1.1s) antes de andar a peça
    setTimeout(() => walkToken(value), 1100);
});