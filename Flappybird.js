

var player;
var columns = [];

var gameManager = {

	canvas: document.getElementById('ctx'),
	startGame: function(){
		this.ctx = this.canvas.getContext('2d'); 
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.interval = setInterval(update, 1000 / 60);
	},
	clear:function(){
		this.ctx.clearRect(0,0, this.width, this.height);
	}
}

function column(x,y,width,height, speedX){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = 'red';
	this.speedX = speedX;
	this.update = function(){
		this.x += this.speedX;
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
	columns.push(new column(500,500,20,-100,-5));
}

function update(){
	gameManager.clear();
	player.draw();
	player.update();

	var gapPos = Math.random() * 300 + 100;
	var col1Height = gapPos - 100;
	var col2Height = -500 + col1Height + 100;

	var colHeight = [];

	colHeight.push(col1Height);
	colHeight.push(col2Height);

	for(var i = 0; i < columns.length;i++){

		columns[i].draw();
		columns[i].update();

		if (columns[i].x < -20)
		{
			columns[i].x += 530;
			columns[i].height = colHeight[i];
			
		}

	}
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
    accelerate(0.1);
  }
});

function accelerate(n) {
  player.gravity = n;
}