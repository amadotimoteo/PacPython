//board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let PythonUptImage;
let PythonDowntImage;
let PythonLeftImage;
let PythonRigthImage;
let wallImage;

//X = wall, O = skip, P = python, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX" 
];

const nextLevelMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X   X     X     X X",
    "X X X XXX X XXX X X",
    "X X             X X",
    "X X XXX XXX XXX X X",
    "X   X       X     X",
    "XXX X XXXXX X XXX X",
    "X   X   b   X   X X",
    "X XXX   o   XXX X X",
    "X     P p     r   X",
    "X XXX       XXX X X",
    "X   X XXXXX X   X X",
    "X X           X X X",
    "X XXX XXXXX XXX X X",
    "X     X     X     X",
    "XXXXXXXXXXXXXXXXXXX",
    "X                 X",
    "X XXXXXXXXXXXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXX"
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let python;

const direction = ["U", "D", "L", "R"];
let score = 0;
let lives = 3;
let gameOver = false;


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); 

    loadImages();
    loadMap();
   // console.log(walls.size);
   // console.log(foods.size);
   // console.log(ghosts.size);
   for (let ghost of ghosts.values()) {
        const newDirection = direction[Math.floor(Math.random() *4)]; //0-3
        ghost.updateDirection(newDirection);
   }
    update();
    document.addEventListener("keyup", movePython);
}

function loadImages() {
    wallImage = new Image();
    wallImage.src = "wall.png";
    blueGhostImage = new Image();
    blueGhostImage.src = "blueghost.png";
    orangeGhostImage = new Image();
    orangeGhostImage.src = "orangeghost.png";
    pinkGhostImage = new Image();
    pinkGhostImage.src = "pinkghost.png";
    redGhostImage = new Image();
    redGhostImage.src = "redghost.png";

    PythonUptImage = new Image();
    PythonUptImage.src = "pythonup.png";
    PythonDowntImage = new Image();
    PythonDowntImage.src = "/pythondown.png";
    PythonLeftImage = new Image();
    PythonLeftImage.src = "pythonleft.png";
    PythonRigthImage = new Image();
    PythonRigthImage.src = "pythonright.png";
}  

function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            const row = tileMap[r];
            const tileMapChar = row[c];

            const x = c*tileSize;
            const y = r*tileSize;

            if (tileMapChar == "X") { //block wall
                const wall = new Block(wallImage, x, y, tileSize, tileSize);
                walls.add(wall);
            }
            else if (tileMapChar == "b") { //blue ghost
                const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == "o") { //orange ghost
                const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == "p") { //pink ghost
                const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == "r") { //red ghost
                const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);  
            }
            else if (tileMapChar == "P") { //python
                python = new Block(PythonRigthImage, x, y, tileSize, tileSize);
    }
            else if (tileMapChar == " ") { //food
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);

        }
    }
}
}   

function update() {
    if (gameOver) {
        return;
    }
    move();
    draw();
    setTimeout(update, 50);
}

function draw() {
    context.clearRect(0, 0, boardWidth, boardHeight);
    context.drawImage(python.image, python.x, python.y, python.width, python.height);
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    context.fillStyle = "yellow";
    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }

    context.fillStyle = "white";
    context.font="14px sans-serif";
    if (gameOver) {
        context.fillText("Game Over: " + String(score), tileSize/2, tileSize/2);
    }
    else {
        context.fillText("x" + String(lives) + " " + String(score), tileSize/2, tileSize/2);
    }
}


function move() {
    // Move Python
    python.x += python.velocityX;
    python.y += python.velocityY;

    for (let wall of walls.values()) {
        if (collision(python, wall)) {
            python.x -= python.velocityX;
            python.y -= python.velocityY;
            break;
        }
    }

    // Túnel lateral para Python
    if (python.x < -python.width) {
        python.x = boardWidth;
    } else if (python.x > boardWidth) {
        python.x = -python.width;
    }

    // Move Ghosts
    for (let ghost of ghosts.values()) {
         if (ghost.y == tileSize*9 && ghost.direction != 'U' && ghost.direction != 'D') {
            ghost.updateDirection('U');}
    
        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        // Colisão com paredes
        for (let wall of walls.values()) {
            if (collision(ghost, wall)) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = direction[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
            }
        }

        // Colisão com Python
        if (collision(ghost, python)) {
            lives -= 1;
            if (lives == 0) {
                gameOver = true;
                return;
            }
            resetPositions();
        }

        // Túnel lateral para Fantasmas
        if (ghost.x < -ghost.width) {
            ghost.x = boardWidth;
        } else if (ghost.x > boardWidth) {
            ghost.x = -ghost.width;
        }
    }

    // Comer alimentos
    let eatenFood = null;
    for (let food of foods.values()) {
        if (collision(python, food)) {
            eatenFood = food;
            score += 10;
            break;
        }
    }
    foods.delete(eatenFood);

    // Próximo nível
    if (foods.size === 0) {
        tileMap.length = 0;
        for (let i = 0; i < nextLevelMap.length; i++) {
            tileMap.push(nextLevelMap[i]);
        }
        loadMap();

        python.reset();
        python.velocityX = 0;
        python.velocityY = 0;

        for (let ghost of ghosts.values()) {
            ghost.reset();
            const newDirection = direction[Math.floor(Math.random() * 4)];
            ghost.updateDirection(newDirection);
        }
    }
}


function movePython(e) {
    if (gameOver) {
        loadMap();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;
        update();
        return;
    }

    if (e.code == "ArrowUp" || e.code == "KeyW") {
        python.updateDirection("U");
    }
    else if (e.code == "ArrowDown" || e.code == "KeyS") {
        python.updateDirection("D");
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        python.updateDirection("L");
    }
    else if (e.code == "ArrowRight" || e.code == "KeyD") {
        python.updateDirection("R");
    }

    if (python.direction == "U") {
        python.image = PythonUptImage;
    }
    else if (python.direction == "D") {
        python.image = PythonDowntImage;
    }
    else if (python.direction == "L") {
        python.image = PythonLeftImage;
    }
    else if (python.direction == "R") {
        python.image = PythonRigthImage;
    }
    
}

function collision (a, b){
    return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y);
}

function resetPositions() {
    python.reset();
    python.velocityX = 0;
    python.velocityY = 0;
    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = direction[Math.floor(Math.random()*4)];
    }
}

class Block {
    constructor(image, x, y, width, height) {
         this.image = image;
         this.x = x;
         this.y = y;
         this.width = width;
         this.height = height;

         this.startX = x;
         this.startY = y;

         this.direction = "R";
         this.velocityX = 0;
         this.velocityY = 0;
    }        

    updateDirection(direction) {
    const prevDirection = this.direction;
    this.direction = direction;
    this.updateVelocity();
    this.x += this.velocityX;
    this.y += this.velocityY;

    for (let wall of walls.values()) {
        if (collision(this, wall)) {
            this.x -= this.velocityX;
            this.y -= this.velocityY;
            this.direction = prevDirection;
            this.updateVelocity();
            return;
        }
    }
}
    updateVelocity() {
    if (this.direction == "U") {
        this.velocityX = 0;
        this.velocityY = -tileSize/4;
    }
    else if (this.direction == "D") {
        this.velocityX = 0;
        this.velocityY = tileSize/4;
    }
    else if (this.direction == "L") {
        this.velocityX = -tileSize/4;
        this.velocityY = 0;
    }
    else if (this.direction == "R") {
        this.velocityX = tileSize/4;
        this.velocityY = 0;
    }
}


reset() {
    this.x = this.startX;
    this.y = this.startY;
}

}

