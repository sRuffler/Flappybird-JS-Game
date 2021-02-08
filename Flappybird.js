
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
    }
    update() {
        this.#setGravitySpeed();
        this.y += this.speedY + this.gravitySpeed;
        this.x += this.speedX;

        if (this.y < 0 || this.y > gameManager.height) {
            gameManager.stopGame();
        }
    }
    #setGravitySpeed() {
        this.gravitySpeed += this.gravity;

        if (this.gravity < 0)
            accelerate(0.15);

        if (this.gravitySpeed >= 5)
            this.gravitySpeed = 5;
        else if (this.gravitySpeed <= -5)
            this.gravitySpeed = -5;
    }
}

class Column extends Component {

    constructor(x, y, width, height, color, speedX) {
        super(x, y, width, height, color);
        this.speedX = speedX;
    }
    update() {
        this.x += this.speedX;

        if (this.hasCollidedWithRect(player))
            gameManager.stopGame();
    }
    respawn(height, y) {
        this.x += gameManager.width + 30;
        this.height = height;
        this.y = y;
        gameManager.scoreFlag = false;
    }

}

var player;
var columns = [];

var gameManager = {

    canvas: document.getElementById('ctx'),
    score: 0,
    scoreFlag: false,
    stopped: true,
    startGame: function () {
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.interval = setInterval(update, 1000 / 60);
        this.score = 0;
        this.stopped = false;
    },
    stopGame: function () {
        clearInterval(this.interval);
        columns = [];
        player = null;
        this.drawFinalScore();
        this.stopped = true;
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },
    drawScore: function () {
        this.ctx.font = "30px Arial";
        this.ctx.fillText(this.score, 430, 50);
    },
    drawFinalScore: function () {
        this.clear();
        this.ctx.font = "100px Arial";
        if (this.score < 10)
            this.ctx.fillText(this.score, 230, 270);
        else if (this.score > 9 && this.score < 100)
            this.ctx.fillText(this.score, 210, 270);
        else
            this.ctx.fillText(this.score, 190, 270);
    },
    updateScore: function (player, column) {
        if (player.x > column.x + column.width && !this.scoreFlag) {
            this.scoreFlag = true;
            this.score++;
        }
    }
}

function startGame() {
    gameManager.startGame();
    player = new Player(30, 240, 20, 20, 'white');
    columns.push(new Column(500, 0, 20, 200,'red', -5));
    columns.push(new Column(500, 300, 20, 250,'red', -5));
}

function update() {
    gameManager.clear();

    player.update();

    gameManager.updateScore(player, columns[0]);

    if (gameManager.stopped)
        return;

    var gapPos = Math.random() * 300 + 100;
    var col1Height = gapPos - 50;
    var col2Height = 500;

    var colY = [];
    var colHeight = [];

    colHeight.push(col1Height);
    colHeight.push(col2Height);

    colY.push(0);
    colY.push(gapPos + 50);

    for (var i = 0; i < columns.length; i++) {

        columns[i].draw();
        columns[i].update();

        if (gameManager.stopped)
            return;

        if (columns[i].x < -20) {
            columns[i].respawn(colHeight[i], colY[i]);
        }
    }

    player.draw();
    gameManager.drawScore();
}

document.addEventListener('keydown', event => {
    event.preventDefault();
    if (event.repeat) {
        accelerate(0.15);
        return;
    }

    if (event.code === 'Space' && !gameManager.stopped) {
        accelerate(-5);
    }
});
document.addEventListener('keyup', event => {
    if (event.code === 'Space') {
        if (gameManager.stopped)
            startGame();
        else
            accelerate(0.15);
    }
});

function accelerate(n) {
    player.gravity = n;
}