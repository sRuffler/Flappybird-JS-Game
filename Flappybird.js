

var player;
var columns = [];

var gameManager = {

	canvas: document.getElementById('ctx'),
	score:0,
	scoreFlag:false,
	stopped:true,
	startGame: function(){
		this.ctx = this.canvas.getContext('2d'); 
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.interval = setInterval(update, 1000 / 60);
		this.score = 0;
		this.stopped = false;
	},
	stopGame:function(){
		clearInterval(this.interval);
		columns = [];
		player = null;
		this.drawFinalScore();
		this.stopped = true;
	},
	clear:function(){
		this.ctx.clearRect(0,0, this.width, this.height);
	},
	drawScore:function(){
		this.ctx.font = "30px Arial";
		this.ctx.fillText(this.score, 430, 50);
	},
	drawFinalScore:function(){
		this.clear();
		this.ctx.font = "100px Arial";
		this.ctx.fillText('', 410, 50);
		this.ctx.fillText(this.score, 230, 250);
	}
}

function column(x,y,width,height, speedX){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = 'red';
	this.speedX = speedX;
	this.update = function(colHeight){
		this.x += this.speedX;

		if (isCollide(this,player))
			gameManager.stopGame();		
	}
	this.respawn = function(height, y){
		this.x += 530;
		this.height = height;
		this.y = y;
		gameManager.scoreFlag = false;
	}
	this.draw = function(){
		gameManager.ctx.fillStyle = this.color;
		gameManager.ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}

function entitiy(x,y,width,height,color){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;
	this.gravity = 0.05;
	this.gravitySpeed = 0;
	this.speedX = 0;
	this.speedY = 0;
	this.update = function(){
		this.gravitySpeed += this.gravity;

		// Limit gravity speed
		if (this.gravitySpeed >= 5)
			this.gravitySpeed = 5;
		else if (this.gravitySpeed <= -10)
			this.gravitySpeed = -10;

		this.y += this.speedY + this.gravitySpeed;
		this.x += this.speedX;

		if (this.x > columns[0].x + columns[0].width && !gameManager.scoreFlag)
		{
			gameManager.scoreFlag = true;
			gameManager.score++;
		}

		if (this.y < 0 || this.y > gameManager.height)
		{
			gameManager.stopGame();
		}
	}
	this.draw = function(){
		gameManager.ctx.fillStyle = this.color;
		gameManager.ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}

function startGame(){
	gameManager.startGame();
	player = new entitiy(10,10,20,20,'white');
	columns.push(new column(500,0,20,200, -5));
	columns.push(new column(500,300,20,250,-5));
}

function update(){
	gameManager.clear();
	player.draw();
	player.update();

	var gapPos = Math.random() * 300 + 100;
	var col1Height = gapPos - 50;
	var col2Height = 500;

	var colY = [];
	var colHeight = [];

	colHeight.push(col1Height);
	colHeight.push(col2Height);

	colY.push(0);
	colY.push(gapPos + 50);

	for(var i = 0; i < columns.length;i++){

		columns[i].draw();
		columns[i].update(colHeight[i]);	

		if (columns[i].x < -20)
		{
			columns[i].respawn(colHeight[i], colY[i]);			
		}
	}
	
	gameManager.drawScore(); 
}

document.addEventListener('keydown', event => {

  if (event.repeat) 
  	return;

  if (event.code === 'Space') {
    accelerate(-0.3);
  }
});
document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
  	if (gameManager.stopped)
  		startGame();
  	else
  		accelerate(0.1);
  }
});

function accelerate(n) {
  player.gravity = n;
}

function isCollide(a, b) {
    return !(
        ((a.y + a.height) < (b.y)) ||
        (a.y > (b.y + b.height)) ||
        ((a.x + a.width) < b.x) ||
        (a.x > (b.x + b.width))
    );
}