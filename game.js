let gameTime = 30;
let gameInterval;
let spawnInterval;

/* =========================
   FIXED GAME ARENA SIZE
========================= */
const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

/* =========================
   STATE
========================= */
let gameRunning = false;
let gameEnded = false;

let score = 0;
let slow = false;

/* =========================
   PLAYER (faster + tighter feel)
========================= */
const player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 80,
    size: 50,
    speed: 9
};

let keys = [];
let items = [];

/* =========================
   INPUT
========================= */
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* =========================
   START GAME
========================= */
function startGame() {
    document.getElementById("landing").style.display = "none";
    document.getElementById("hud").style.display = "block";
    document.getElementById("gameOver").style.display = "none";

    gameRunning = true;
    gameEnded = false;

    score = 0;
    items = [];
    slow = false;

    gameTime = 30;

    document.getElementById("mode").innerText = "30s SYNC APOCALYPSE STARTED";

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    /* TIMER */
    gameInterval = setInterval(() => {
        if (!gameRunning) return;

        gameTime--;

        document.getElementById("mode").innerText =
            `TIME LEFT: ${gameTime}s`;

        if (gameTime <= 0) {
            endGame(true);
        }
    }, 1000);

    /* SPAWN (harder now) */
    spawnInterval = setInterval(spawn, 500);
}

/* =========================
   RESTART
========================= */
function restartGame() {
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    startGame();
}

/* =========================
   SPAWN ITEMS
========================= */
function spawn() {
    if (!gameRunning) return;

    const types = [
        { emoji: "✅", type: "good" },
        { emoji: "💾", type: "good" },
        { emoji: "📘", type: "good" },
        { emoji: "❌", type: "bad" },
        { emoji: "⚠️", type: "bad" },
        { emoji: "☕", type: "coffee" }
    ];

    const item = types[Math.floor(Math.random() * types.length)];

    items.push({
        x: Math.random() * GAME_WIDTH,
        y: -50,
        emoji: item.emoji,
        type: item.type,
        speed: slow ? 3 : 5 + Math.random() * 4   // harder + faster
    });
}

/* =========================
   UPDATE (CORE FIXED LOGIC)
========================= */
function update() {
    if (!gameRunning) return;

    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

    /* clamp inside game arena */
    player.x = Math.max(0, Math.min(GAME_WIDTH - player.size, player.x));

    items.forEach((item, i) => {
        item.y += item.speed;

        /* collision */
        if (
            item.x < player.x + player.size &&
            item.x + 40 > player.x &&
            item.y < player.y + player.size &&
            item.y + 40 > player.y
        ) {
            if (item.type === "good") {
                score += 10;
            }

            if (item.type === "coffee") {
                activateSlow();
            }

            /* ❌ BAD = INSTANT FAIL */
            if (item.type === "bad") {
                endGame(false);
                return;
            }

            items.splice(i, 1);
        }

        /* missed item */
        if (item.y > GAME_HEIGHT) items.splice(i, 1);
    });

    document.getElementById("score").innerText = score;
}

/* =========================
   DRAW
========================= */
function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.font = "40px Arial";
    ctx.fillText("🧑‍💻", player.x, player.y);

    items.forEach(i => {
        ctx.font = "30px Arial";
        ctx.fillText(i.emoji, i.x, i.y);
    });
}

/* =========================
   LOOP
========================= */
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

/* =========================
   COFFEE MODE
========================= */
function activateSlow() {
    slow = true;
    document.getElementById("mode").innerText = "COFFEE MODE ☕";

    setTimeout(() => {
        slow = false;
        document.getElementById("mode").innerText = "NORMAL";
    }, 4000);
}

/* =========================
   GAME OVER
========================= */
function endGame(survived) {
    if (gameEnded) return;
    gameEnded = true;

    gameRunning = false;

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOver").style.display = "flex";

    document.querySelector("#gameOver h1").innerText =
        survived ? "FRIDAY 5:00 PM SURVIVED!" : "SYSTEM FAILURE";
}

/* =========================
   TOUCH (FIXED)
========================= */
let touchX = null;

canvas.addEventListener("touchstart", e => {
    touchX = e.touches[0].clientX;
});

canvas.addEventListener("touchmove", e => {
    let x = e.touches[0].clientX;
    player.x = x - player.size / 2;
});

/* =========================
   START GAME LOOP
========================= */
loop();
