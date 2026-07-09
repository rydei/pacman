let mainScreen;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;

//images
let blueGhostImage;
let orangeGhostImage;
let redGhostImage;
let pinkGhostImage;
let pacmanUp;
let pacmanDown;
let pacmanRight;
let pacmanLeft;
let wallImage;

//X = wall, O = skip, P = pac man, ' ' = food
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

const walls = new Set();
const foods = new Set();
const ghosts =  new Set();
let pacman;

const directions = ['U','D','L','R']
let score = 0;
let lives = 3;
let gameOver = false;
let tap = 0;
let tapTimer = null;
//while loading up
window.onload =  function (){

mainScreen = document.getElementById("mainScreen");
mainScreen.height = boardHeight;
mainScreen.width = boardWidth;
context = mainScreen.getContext("2d");
loadImage();
loadMap();
for (let ghost of ghosts.values()) {
    const newDirection = directions[Math.floor(Math.random()*4)]
    ghost.updateDirection(newDirection);
}
update();
document.addEventListener("keyup",movePacman);
console.log(walls.size)
}

//loading map
function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();

    for (let r = 0; r < rowCount;r++)
    for (let c = 0; c < columnCount; c++) {
        const row = tileMap[r];
        const tileMapChar= row[c];

        const x = c*tileSize;
        const y = r*tileSize;

        if (tileMapChar == "X" ) {

            const wall = new Block(wallImage,x,y,tileSize,tileSize)
            walls.add(wall);
        }
        else if (tileMapChar == "b") {
            const Ghost = new Block(blueGhostImage,x,y,tileSize,tileSize);
            ghosts.add(Ghost);

        }
        else if (tileMapChar == "o") {
            const Ghost = new Block(orangeGhostImage,x,y,tileSize,tileSize);
            ghosts.add(Ghost);
            
        }
        else if (tileMapChar == "p") {
            const Ghost = new Block(pinkGhostImage,x,y,tileSize,tileSize);
            ghosts.add(Ghost);
            
        }
        else if (tileMapChar == "r") {
            const Ghost = new Block(redGhostImage,x,y,tileSize,tileSize);
            ghosts.add(Ghost);}

        else if (tileMapChar == "P") {
            pacman = new Block(pacmanRight,x,y,tileSize,tileSize);
        }
        else if (tileMapChar == " ") {
            const food = new Block(null,x+ 14,y + 14,4,4);  
            foods.add(food);
        }
    
    }
}

function update() {
    if (gameOver) {
        return;
    }
    move();
    draw();
    setTimeout(update, 60);
}

function draw() {
    context.clearRect(0,0,boardWidth,boardHeight);
    context.drawImage(pacman.image,pacman.x,pacman.y,pacman.width,pacman.height);
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image,ghost.x,ghost.y,ghost.width,ghost.height);
    }
    for (let wall of walls.values()) {
        context.drawImage(wall.image,wall.x,wall.y,wall.width,wall.height);
    }
    context.fillStyle = "white";
    for (let food of foods.values()) {
        context.fillRect(food.x,food.y,food.width,food.height);
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

//assigning images
function loadImage() {
    wallImage = new Image();
    wallImage.src = "assets/wall.png";
    blueGhostImage = new Image();
    blueGhostImage.src = "assets/blueGhost.png";
    orangeGhostImage = new Image();
    orangeGhostImage.src = "assets/orangeGhost.png";
    redGhostImage = new Image();
    redGhostImage.src = "assets/redGhost.png";
    pinkGhostImage = new Image();
    pinkGhostImage.src = "assets/pinkGhost.png";
    pacmanUp = new Image();
    pacmanUp.src = "assets/pacmanUp.png";
    pacmanDown = new Image();
    pacmanDown.src = "assets/pacmanDown.png";
    pacmanRight = new Image();
    pacmanRight.src = "assets/pacmanRight.png";
    pacmanLeft = new Image();
    pacmanLeft.src = "assets/pacmanLeft.png";
}
//moving pacman

function movePacman(e) {
    if (gameOver) {
        loadMap();
        resetPositions();
        lives = 3 ;
        score = 0;
        gameOver = false;
        update();
        return;
    }

    if (e.code == "Space") {
        tap += 1;

        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => {
            
            if (tap == 1) {
                pacman.updateDirection('U');
                pacman.image = pacmanUp;
            } 
            else if (tap == 2) {
                pacman.updateDirection('D');
                pacman.image = pacmanDown;
            } 
            else if (tap == 3) {
                pacman.updateDirection('L');
                pacman.image = pacmanLeft;
            } 
            else if (tap >= 4) { // 4 taps (or more) goes right
                pacman.updateDirection('R');
                pacman.image = pacmanRight;
            }
            tap = 0;
            
        }, 300); 
    }
}

function move(){
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    //check wall collision
    for (let wall of walls.values()) {
        if (pacman.x < 0) {
        pacman.x = boardWidth;
    }
    else if (pacman.x > boardWidth) {
    pacman.x = 0;
    }
        if (collision(pacman,wall)) {
        pacman.x -= pacman.velocityX;
        pacman.y -= pacman.velocityY;
        break;
    }
    }

    for (let ghost of ghosts.values()) {
        if (collision(ghost, pacman)) {
            lives -= 1;
            if (lives == 0) {
                gameOver = true;
                return;
            }
            resetPositions();
        }
    ghost.x += ghost.velocityX;
    ghost.y += ghost.velocityY;

    if (ghost.y == tileSize*9 && ghost.direction != 'U' && ghost.direction != 'D') {
            ghost.updateDirection('U');
        }


    if (ghost.x < 0) {
        ghost.x = boardWidth;
    }
    else if (ghost.x > boardWidth) {
        ghost.x = 0;
    }
            for (let wall of walls.values()) {
        if (collision(ghost,wall)) {
        ghost.x -= ghost.velocityX;
        ghost.y -= ghost.velocityY;
        const newDirection = directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }
    }
    }

     let foodEaten = null;
    for (let food of foods.values()) {
        if (collision(pacman, food)) {
            foodEaten = food;
            score += 10;
            break;
        }
    }
    foods.delete(foodEaten);

}

function collision(a,b) {
    return a.x < b.x + b.width && 
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

function resetPositions() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
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
    this.direction = 'R';
    this.velocityX = 0;
    this.velocityY = 0;
}

updateDirection(direction){
    const lastDirection = this.direction;
    this.direction = direction;
    this.updateVelocity();
    this.x += this.velocityX;
    this.y += this.velocityY;

    for (let wall of walls.values()) {
        if (collision(this,wall)) {
            this.x -= this.velocityX;
            this.y -= this.velocityY;
            this.direction = lastDirection;
            this.updateVelocity();
            return;
        }
    }
}

updateVelocity() {
    if (this.direction == 'U') {
        this.velocityX = 0;
        this.velocityY = -tileSize/4;
    }
    else if (this.direction == 'D') {
        this.velocityX = 0;
        this.velocityY = tileSize/4;
    }
    else if (this.direction == 'L') {
    this.velocityX = -tileSize/4;
    this.velocityY = 0;
    }
    else if (this.direction == 'R') {
    this.velocityX = tileSize/4;
    this.velocityY = 0;
    }
}
 reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}