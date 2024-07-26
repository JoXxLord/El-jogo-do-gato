const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 820;
canvas.height = 480;

const GAME_STATES = {
    MENU: 0,
    PLAYING: 1,
    GAME_OVER: 2,
    WIN: 3,
    ENDED: 4 
};
let gameState = GAME_STATES.MENU;

let cat = {
    x: 50,
    y: canvas.height / 2,
    width: 100,
    height: 100
};

let mice = [];
const maxMice = 2;
const mouseSize = 60;
const mouseSpeed = 5;

let estambre = {
    x: cat.x + cat.width,
    y: cat.y + cat.height / 2,
    radius: 5,
    speed: 10,
    shooting: false
};

let score = 0;
const winScore = 25;

const images = {};
const imagePaths = ['Fondo.jpg', 'Gato.png', 'Ratom.png', 'Estambre.png'];

let upKey = false;
let downKey = false;

function loadImages(paths) {
    let loadedImages = 0;
    paths.forEach(path => {
        images[path] = new Image();
        images[path].src = 'Imagenes/' + path;
        images[path].onload = () => {
            loadedImages++;
            if (loadedImages === paths.length) {
                drawMenu(); 
            }
        };
    });
}

function startGame() {
    resetGameState();
    gameState = GAME_STATES.PLAYING;
    generateMice();
    draw();
}

function resetGameState() {
    score = 0;
    mice = [];
    cat.x = 50;
    cat.y = canvas.height / 2;
    estambre.speed = 10;
    estambre.shooting = false; 
}

function generateMice() {
    for (let i = 0; i < maxMice; i++) {
        mice.push({
            x: canvas.width + Math.random() * 400,
            y: Math.random() * (canvas.height - mouseSize),
            width: mouseSize,
            height: mouseSize
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); 

    switch (gameState) {
        case GAME_STATES.MENU:
            drawMenu();
            break;
        case GAME_STATES.PLAYING:
            drawCat();
            drawMice();
            drawScore();
            if (estambre.shooting) {
                drawEstambre();
            }

            moveMice();
            if (estambre.shooting) {
                moveEstambre();
            }

            if (upKey && cat.y > 0) {
                cat.y -= 5;
            }
            if (downKey && cat.y + cat.height < canvas.height) {
                cat.y += 5;
            }

            checkCollision();

            if (mice.length < maxMice) {
                generateMice();
            }
            break;
        case GAME_STATES.GAME_OVER:
            drawGameOver();
            break;
        case GAME_STATES.WIN:
            drawWin();
            break;
        case GAME_STATES.ENDED:
            drawEndMessage(); 
            break;
    }

    requestAnimationFrame(draw);
}

function drawBackground() {
    ctx.drawImage(images['Fondo.jpg'], 0, 0, canvas.width, canvas.height);
}

function drawCat() {
    ctx.drawImage(images['Gato.png'], cat.x, cat.y, cat.width, cat.height);
}

function drawMice() {
    mice.forEach(mouse => {
        ctx.drawImage(images['Ratom.png'], mouse.x, mouse.y, mouse.width, mouse.height);
    });
}

function drawEstambre() {
    ctx.drawImage(images['Estambre.png'], estambre.x - estambre.radius, estambre.y - estambre.radius, estambre.radius * 2, estambre.radius * 2);
}

function drawScore() {
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 10, 30);
}

function drawMenu() {
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("El jueguito del gato", canvas.width / 2 - 150, canvas.height / 2 - 50);
    ctx.font = "bold 20px Arial";
    ctx.fillText("Presiona Espacio para empezar", canvas.width / 2 - 170, canvas.height / 2);
}

function drawGameOver() {
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText("Tienes que llegar a 25 :c", canvas.width / 2 - 200, canvas.height / 2 - 50);
    ctx.font = "bold 20px Arial";
    ctx.fillText("Perdiste :c", canvas.width / 2 - 100, canvas.height / 2);
}

function drawWin() {
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText("¡Ganaste!", canvas.width / 2 - 100, canvas.height / 2 - 50);
    ctx.font = "bold 20px Arial";
    ctx.fillText("Felicidades :D, Ganaste!", canvas.width / 2 - 100, canvas.height / 2);
}

function drawEndMessage() {
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("El juego ha terminado", canvas.width / 2 - 150, canvas.height / 2 - 50);
}

function moveMice() {
    mice.forEach(mouse => {
        mouse.x -= mouseSpeed;
    });
}

function moveEstambre() {
    estambre.x += estambre.speed;
    if (estambre.x > canvas.width) {
        estambre.shooting = false;
    }
}

function checkCollision() {
    mice.forEach((mouse, index) => {
        if (mouse.x < cat.x + cat.width &&
            mouse.x + mouseSize > cat.x &&
            mouse.y < cat.y + cat.height &&
            mouse.y + mouseSize > cat.y) {
            gameState = GAME_STATES.GAME_OVER;
            setTimeout(() => gameState = GAME_STATES.ENDED, 2000); 
        }

        if (estambre.shooting &&
            estambre.x > mouse.x &&
            estambre.x < mouse.x + mouseSize &&
            estambre.y > mouse.y &&
            estambre.y < mouse.y + mouseSize) {
            score++;
            mice.splice(index, 1);
            estambre.shooting = false; 
            if (score >= winScore) {
                gameState = GAME_STATES.WIN;
                setTimeout(() => gameState = GAME_STATES.ENDED, 2000); 
            }
        }
    });

    mice.forEach(mouse => {
        if (mouse.x < cat.x) {
            gameState = GAME_STATES.GAME_OVER;
            setTimeout(() => gameState = GAME_STATES.ENDED, 2000); 
        }
    });
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && gameState === GAME_STATES.MENU) {
        startGame();
    }
    if ((event.code === "Space" || event.code === "Enter") && (gameState === GAME_STATES.GAME_OVER || gameState === GAME_STATES.WIN)) {
        gameState = GAME_STATES.ENDED; 
    }
    if (event.code === "Space" && gameState === GAME_STATES.PLAYING && !estambre.shooting) {
        estambre.shooting = true;
        estambre.x = cat.x + cat.width;
        estambre.y = cat.y + cat.height / 2;
    }
    if (event.code === "KeyW") {
        upKey = true;
    }
    if (event.code === "KeyS") {
        downKey = true;
    }
});

document.addEventListener("keyup", function(event) {
    if (event.code === "KeyW") {
        upKey = false;
    }
    if (event.code === "KeyS") {
        downKey = false;
    }
});

loadImages(imagePaths);
