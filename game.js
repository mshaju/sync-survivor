let gameTime = 30;
let gameInterval;
let spawnInterval;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let gameRunning = false;
let gameEnded = false; // ✅ prevents double endGame calls

let score = 0;
let health = 3;
let slow = false;

const player = {
    x: 200,
    y: canvas.height - 120,
    size: 50,
    speed: 8
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
    health = 3;
    items = [];
    slow = false;

    gameTime = 30;

    document.getElementById("mode").innerText = "FRIDAY 5:00 PM RUSH";

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    // ⏱ TIMER
    gameInterval = setInterval(() => {
        if (!gameRunning) return;

        gameTime--;

        document.getElementById("mode").innerText =
            `TIME LEFT: ${gameTime}s`;

        if (gameTime <= 0) {
            endGame(true);
        }
    }, 1000);

    // 🎯 SPAWN CONTROLLED
    spawnInterval = setInterval(spawn, 800);
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
        x: Math.random() * canvas.width,
        y: -50,
        emoji: item.emoji,
        type: item.type,
        speed: slow ? 2 : 4 + Math.random() * 3
    });
}

/* =========================
   UPDATE
========================= */
function update() {
    if (!gameRunning) return;

    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));

    items.forEach((item, i) => {
        item.y += item.speed;

        if (
            item.x < player.x + player.size &&
            item.x + 40 > player.x &&
            item.y < player.y + player.size &&
            item.y + 40 > player.y
        ) {
            if (item.type === "good") score += 10;
            if (item.type === "bad") health--;
            if (item.type === "coffee") activateSlow();

            items.splice(i, 1);
        }

        if (item.y > canvas.height) items.splice(i, 1);
    });

    if (health <= 0) {
        endGame(false);
    }

    document.getElementById("score").innerText = score;
    document.getElementById("health").innerText = "❤️".repeat(health);
}

/* =========================
   DRAW
========================= */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
   GAME OVER (FIXED)
========================= */
function endGame(survived) {
    if (gameEnded) return; // ✅ prevents duplicate calls
    gameEnded = true;

    gameRunning = false;

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    // ✅ LOCK SCORE BEFORE ANYTHING ELSE
    const finalScore = score;

    document.getElementById("finalScore").innerText = finalScore;
    document.getElementById("gameOver").style.display = "flex";

    if (survived) {
        document.querySelector("#gameOver h1").innerText =
            "FRIDAY 5:00 PM SURVIVED!";
    } else {
        document.querySelector("#gameOver h1").innerText =
            "SYSTEM FAILURE";
    }
}

/* =========================
   TOUCH SUPPORT
========================= */
let touchX = null;

canvas.addEventListener("touchstart", e => {
    touchX = e.touches[0].clientX;
});

canvas.addEventListener("touchmove", e => {
    let x = e.touches[0].clientX;
    player.x += (x - touchX);
    touchX = x;
});

/* =========================
   START LOOP
========================= */
loop();
