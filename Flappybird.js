
class Component {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    draw() {
        gameManager.ctx.fillStyle = this.color;
        gameManager.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    hasCollidedWithRect(rect) {
        return !(
            ((this.y + this.height) < (rect.y)) ||
            (this.y > (rect.y + rect.height)) ||
            ((this.x + this.width) < rect.x) ||
            (this.x > (rect.x + rect.width))
        );
    }
}

class Player extends Component {
    constructor(x, y, width, height, color) {
        super(x, y, width, height, color);
        this.gravity = 0.05;
        this.gravitySpeed = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.sprites = [];
        for (var i = 0; i < 4; i++) {
            this.sprites.push(new Image());
            this.sprites[i].src = "frame-" + i + ".png";
        }
        this.currentSprite = 0;
    }
    update() {
        if (gameManager.frameCount % 7 == 0)
            this.currentSprite++;
        if (this.currentSprite >= 4)
            this.currentSprite = 0;

        this.#setGravitySpeed();
        this.y += this.speedY + this.gravitySpeed;
        this.x += this.speedX;

        if (this.y < 0 || this.y > gameManager.height - this.height) {
            gameManager.audioChannels[2].play();
            gameManager.stopGame();
        }
    }
    accelerate(value) {
        this.gravity = value;
    }
    drawImage() {
        gameManager.ctx.drawImage(this.sprites[this.currentSprite], this.x, this.y, this.width, this.height);
    }
    #setGravitySpeed() {
        this.gravitySpeed += this.gravity;

        if (this.gravity < 0)
            this.accelerate(0.15);

        if (this.gravitySpeed >= 5)
            this.gravitySpeed = 5;
        else if (this.gravitySpeed <= -5)
            this.gravitySpeed = -4;
    }
}

class Column extends Component {

    constructor(x, y, width, height, color, speedX, imgSrc) {
        super(x, y, width, height, color);
        this.speedX = speedX;
        this.img = new Image();
        this.img.src = imgSrc;
    }
    update() {
        if (gameManager.stopped)
            return

        this.x += this.speedX;

        if (this.hasCollidedWithRect(player)) {
            gameManager.audioChannels[2].play();
            gameManager.stopGame();
        }

    }
    drawColumn() {
        gameManager.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
    respawn(height, y) {
        if (gameManager.score > 20 && gameManager.score) {
            this.speedX = -6;
        }
        else if (gameManager.score >= 40) {
            this.speedX = Math.random > 0.7 ? -7 : -6;
        }

        this.x = gameManager.width + 50;
        this.height = height;
        this.y = y;
        gameManager.scoreFlag = false;
    }
}

class Collectable extends Component {
    constructor(x, y, width, height, color, audioSrc) {
        super(x, y, width, height, color);
        this.audioSrc = audioSrc;
        this.currentSpriteIndex = 0;
        this.sprites = [];
        this.hidden = false;

        for (var i = 1; i < 7; i++) {
            this.sprites.push(new Image());
            this.sprites[i - 1].src = "Images/Coin" + i + ".png";
        }
    }
    update() {
        this.x -= 5;
        if (this.x <= -40 && columns.some(x => x.x <= -40)) {
            gameManager.collectables.splice(0, 1);
            var randX = Math.random() * 200 + 700;
            var randY = Math.random() * 300 + 100;
            gameManager.collectables.push(new Collectable(randX, randY, 30, 30, null));
        }
            
        if (gameManager.frameCount % 10 == 0)
            this.currentSpriteIndex++;
        if (this.currentSpriteIndex >= this.sprites.length)
            this.currentSpriteIndex = 0;

        if (this.hasCollidedWithRect(player) && !this.hidden) {
            gameManager.audioChannels[3].play();
            this.hidden = true;
            gameManager.score++;
        }

    }
    drawImage() {
        if (!this.hidden)
            gameManager.ctx.drawImage(this.sprites[this.currentSpriteIndex], this.x, this.y, this.width, this.height);
    }

}

class GameManager {

    constructor() {
        this.canvas = document.getElementById('ctx');
        this.score = 0;
        this.scoreFlag = false;
        this.stopped = true;
        this.img = new Image();
        this.img.src = "background.png";
        this.img.style.filter = "grayscale(100%)";
        this.imgX = 0;
        this.imgY = 0;

        this.img2 = new Image();
        this.img2.src = "background.png";
        this.img2X = this.canvas.width;
        this.img2Y = 0;
        this.frameCount = 0;        
        this.audioChannels = [];
        this.loadAudio();
    }
    startGame() {
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.interval = setInterval(update, 1000/60);
        this.score = 0;
        this.stopped = false;
        player = new Player(30, 240, 35, 35, 'white');
        columns.push(new Column(500, 0, 50, 200, 'red', -5, "pipeTop.png"));
        columns.push(new Column(500, 300, 50, 250, 'red', -5, "pipeBottom.png"));
        this.collectables = [];
        this.collectables.push(new Collectable(300,200, 30,30, null));
    }
    stopGame() {
        clearInterval(this.interval);
        columns = [];
        player = null;
        this.drawFinalScore();
        this.stopped = true;
        this.clear();
    }
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    drawScore() {
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = 'red';
        this.ctx.fillText(this.score, 430, 50);
    }
    drawFinalScore() {
        this.drawBackground();
        this.ctx.font = "100px Arial";
        this.ctx.fillStyle = 'red';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.score, this.width/2, this.height/2);
    }
    drawBackground() {
        //his.canvas.filter.greyscale("0%");
        this.ctx.drawImage(this.img, this.imgX, this.imgY, this.canvas.width, this.canvas.height + 200);
        this.ctx.drawImage(this.img2, this.img2X, this.img2Y, this.canvas.width, this.canvas.height + 200);
    }
    updateBackground() {
        if (this.imgX <= this.canvas.width * -1)
            this.imgX *= -1;
        else if (this.img2X <= this.canvas.width * -1)
            this.img2X *= -1;

        this.imgX += -1;
        this.img2X += -1;
    }
    updateScore(player, column) {
        if (player.x > column.x + column.width && !this.scoreFlag) {
            this.scoreFlag = true;
            this.score++;
        }
    }
    loadAudio() {
        var audio = new Audio('Jump.wav');
        var deathAudio = new Audio('Death.wav');
        var coinAudio = new Audio('Audio/CoinCollect.wav');

        for (var i = 0; i < 2; i++) {

            this.audioChannels.push(audio);
            this.audioChannels[i].volume = 0.3;
        }

        this.audioChannels.push(deathAudio);
        this.audioChannels.push(coinAudio);
        this.audioChannels[3].volume = 0.3;
        this.audioChannels.forEach(x => x.load());   
    }
}

//-------------------------------------------------------------------------

var player;
var columns = [];
var gameManager = new GameManager();

function startGame() {
    gameManager.startGame();
}

function update() {
    gameManager.clear();
    gameManager.frameCount++;

    // Update Component Positions and Score

    gameManager.updateScore(player, columns[0]);
    gameManager.updateBackground();

    player.update();
    if (gameManager.stopped) {
        gameManager.drawFinalScore();
        return;
    }

    columns.forEach(x => x.update());
    if (gameManager.stopped) {
        gameManager.drawFinalScore();
        return;
    }

    gameManager.collectables.forEach(x => x.update());

    // Respawn columns when they are off screen
    if (columns.some(x => x.x <= -40)) {

        // Works out a column gap at a new/random position

        var gapHeight = 150;
        var gapPos = Math.random() * 250 + 100;
        var col1Height = gapPos - (gapHeight / 2);
        var col2Height = 500;

        columns[0].respawn(col1Height, 0);
        columns[1].respawn(col2Height, gapPos + (gapHeight / 2));
    }


    // Draw Components and Score 
    gameManager.drawBackground();
    player.drawImage();
    columns.forEach(x => x.drawColumn());
    gameManager.drawScore();
    gameManager.collectables.forEach(x => x.drawImage());
}

document.addEventListener('keydown', event => {
    event.preventDefault();
    if (event.repeat) {
        player.accelerate(0.15);
        return;
    }

    if (event.code === 'Space' && !gameManager.stopped) {
        player.accelerate(-5);
         
        for (var i = 0; i < 2; i++) {
            if (gameManager.audioChannels[i].paused) {
                gameManager.audioChannels[i].play();
                console.log("audio channel:" + i);
                break;
            }
        }
    }
});

document.addEventListener('keyup', event => {
    if (event.code === 'Space') {
        if (gameManager.stopped) {
            gameManager.startGame();
        }     
        else
            player.accelerate(0.15);
    }
});


