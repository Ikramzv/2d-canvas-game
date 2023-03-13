function refresh(canvas, ctx) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
}

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => refresh(canvas, ctx));

  ctx.fillStyle = "white";
  ctx.font = "30px Bangers";
  ctx.textAlign = "center";

  class Player {
    constructor(game) {
      this.game = game;
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.collisionRadius = 50;
      this.speedX = 0;
      this.speedY = 0;
      this.dx = 0;
      this.dy = 0;
      this.speedModifier = 5;
      this.image = document.getElementById("bull");
      this.spriteWidth = 255;
      this.spriteHeight = 256;
      this.width = this.spriteWidth - 20;
      this.height = this.spriteHeight - 20;
      this.spriteX;
      this.spriteY;
      this.frameX = 0;
      this.frameY = 0;

      this.angle = 0;
      this.va = 0.1;
    }

    draw(context) {
      context.save();
      context.translate(0, Math.cos(this.angle) * 20);
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (this.game.debug) {
        this.game.drawDebug(
          context,
          this.collisionX,
          this.collisionY,
          this.collisionRadius
        );
      }
      context.restore();

      context.beginPath();
      context.moveTo(this.collisionX, this.collisionY);
      context.lineTo(this.game.mouse.x, this.game.mouse.y);
      context.stroke();
    }

    update() {
      this.angle += this.va;
      const { mouse } = this.game;
      this.dx = mouse.x - this.collisionX;
      this.dy = mouse.y - this.collisionY;
      const distance = Math.hypot(this.dx, this.dy);

      if (distance > this.speedModifier) {
        this.speedX = this.dx / distance || 0;
        this.speedY = this.dy / distance || 0;
      } else {
        this.speedX = 0;
        this.speedY = 0;
      }

      this.collisionX += this.speedX * this.speedModifier;
      this.collisionY += this.speedY * this.speedModifier;

      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 30;

      const angle = Math.atan2(this.dy, this.dx);

      if (angle < -2.74 || angle > 2.74) this.frameY = 6;
      else if (angle < -1.96) this.frameY = 7;
      else if (angle < -1.17) this.frameY = 0;
      else if (angle < -0.39) this.frameY = 1;
      else if (angle < 0.39) this.frameY = 2;
      else if (angle < 1.17) this.frameY = 3;
      else if (angle < 1.96) this.frameY = 4;
      else if (angle < 2.74) this.frameY = 5;

      // horizontal boundaries
      if (this.collisionX < this.collisionRadius) {
        this.collisionX = this.collisionRadius;
      } else if (this.collisionX > this.game.width - this.collisionRadius) {
        this.collisionX = this.game.width - this.collisionRadius;
      }
      // vertical boundaries
      if (this.collisionY < this.collisionRadius + this.game.topMargin) {
        this.collisionY = this.collisionRadius + this.game.topMargin;
      } else if (this.collisionY > this.game.height - this.collisionRadius) {
        this.collisionY = this.game.height - this.collisionRadius;
      }

      this.game.obstacles.forEach((obstacle) => {
        const [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, obstacle);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
        }
      });
    }

    restart() {
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
    }
  }

  class Obstacle {
    constructor(game) {
      this.game = game;
      this.collisionX = Math.random() * this.game.width;
      this.collisionY = Math.random() * this.game.height;
      this.collisionRadius = 50;
      this.image = document.getElementById("obstacles");
      this.spriteWidth = 250;
      this.spriteHeight = 250;
      this.width = this.spriteWidth - 50;
      this.height = this.spriteHeight - 50;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 70;
      this.frameX = Math.floor(Math.random() * 4);
      this.frameY = Math.floor(Math.random() * 3);
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );

      if (!this.game.debug) return;

      this.game.drawDebug(
        context,
        this.collisionX,
        this.collisionY,
        this.collisionRadius
      );
    }
  }

  class Egg {
    constructor(game) {
      this.game = game;
      this.collisionRadius = 55;
      this.margin = this.collisionRadius * 2;

      this.collisionX =
        this.margin + Math.random() * (this.game.width - this.margin * 2);
      this.collisionY =
        this.game.topMargin +
        Math.random() * (this.game.height - this.game.topMargin - this.margin);
      this.image = document.getElementById("egg");

      this.spriteWidth = 110;
      this.spriteHeight = 135;
      this.width = this.spriteWidth - 20;
      this.height = this.spriteHeight - 20;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5;

      this.hatchTimer = 0;
      this.hatchInterval = 5000;
      this.markedForDeletion = false;
    }

    draw(context) {
      context.drawImage(
        this.image,
        0,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (!this.game.debug) return;
      this.game.drawDebug(
        context,
        this.collisionX,
        this.collisionY,
        this.collisionRadius
      );
      context.fillText(
        (this.hatchTimer * 0.001).toFixed(0),
        this.collisionX,
        this.collisionY - this.collisionRadius - 10
      );
    }

    update(deltaTime) {
      let collisionObjects = [this.game.player, ...this.game.enemies];
      // collisions
      collisionObjects.forEach((object) => {
        const [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;

          this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;

          this.spriteX = this.collisionX - this.width * 0.5;
          this.spriteY = this.collisionY - this.height * 0.5;
        }
      });

      // hatching
      if (
        this.hatchTimer > this.hatchInterval ||
        this.collisionY < this.game.topMargin - 20
      ) {
        this.game.hatchlings.push(
          new Larva(this.game, this.collisionX, this.collisionY)
        );
        this.markedForDeletion = true;
        this.game.eggs = this.game.removeGameObject(this.game.eggs);
      } else {
        this.hatchTimer += deltaTime;
      }
    }
  }

  class Enemy {
    constructor(game) {
      this.game = game;
      this.collisionRadius = 60;
      this.collisionX = this.game.width;
      this.collisionY =
        this.game.topMargin +
        Math.random() *
          (this.game.height - this.game.topMargin - this.collisionRadius);
      this.speedX = Math.random() * 3 + 0.5;

      this.image = document.getElementById("toads");

      this.spriteWidth = 140;
      this.spriteHeight = 260;
      this.width = this.spriteWidth - 20;
      this.height = this.spriteHeight - 60;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5;
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 4);

      this.angle = 0;
      this.va = 0.1;
    }

    draw(context) {
      context.save();
      context.translate(0, Math.cos(this.angle) * 5);
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );

      if (!this.game.debug) return context.restore();

      this.game.drawDebug(
        context,
        this.collisionX,
        this.collisionY,
        this.collisionRadius
      );
      context.restore();
    }

    update() {
      this.angle += this.va;

      this.collisionX -= this.speedX;
      if (this.spriteX + this.width < 0 && !this.game.gameOver) {
        this.collisionX = this.game.width;
        this.frameY = Math.floor(Math.random() * 4);
        this.collisionY =
          this.game.topMargin +
          Math.random() *
            (this.game.height - this.game.topMargin - this.collisionRadius);
      }

      const objects = [this.game.player, ...this.game.obstacles];

      objects.forEach((object) => {
        const [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
        }
      });

      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5;
    }
  }

  class Larva {
    constructor(game, x, y) {
      this.game = game;
      this.collisionX = x;
      this.collisionY = y;
      this.collisionRadius = 30;

      this.image = document.getElementById("larva");

      this.speedY = 1 + Math.random();

      this.spriteWidth = 150;
      this.spriteHeight = 150;
      this.width = this.spriteWidth - 30;
      this.height = this.spriteHeight - 30;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5;
      this.markedForDeletion = false;

      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 2);
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (!this.game.debug) return;
      this.game.drawDebug(
        context,
        this.collisionX,
        this.collisionY,
        this.collisionRadius
      );
    }

    update() {
      this.collisionY -= this.speedY;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5;
      // move to safety
      if (this.collisionY < this.game.topMargin - 40) {
        this.markedForDeletion = true;
        this.game.hatchlings = this.game.removeGameObject(this.game.hatchlings);
        if (!this.game.gameOver) this.game.score++;
        for (let i = 0; i < 3; i++) {
          this.game.particles.push(
            new FireFly(this.game, this.collisionX, this.collisionY, "yellow")
          );
        }
      }

      const objects = [this.game.player, ...this.game.obstacles];
      objects.forEach((object) => {
        const [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
        }
      });

      if (this.game.gameOver) return;
      this.game.enemies.forEach((enemy) => {
        if (this.game.checkCollision(this, enemy)[0]) {
          this.markedForDeletion = true;
          this.game.hatchlings = this.game.removeGameObject(
            this.game.hatchlings
          );
          this.game.lostHatchlings++;
          for (let i = 0; i < 3; i++) {
            this.game.particles.push(
              new Spark(this.game, this.collisionX, this.collisionY, "blue")
            );
          }
        }
      });
    }
  }

  class Particle {
    constructor(game, x, y, color) {
      this.game = game;
      this.collisionX = x;
      this.collisionY = y;
      this.color = color;
      this.radius = Math.floor(Math.random() * 10 + 5);
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * 2 + 0.5;
      this.angle = 0;
      this.va = Math.random() * 0.1 + 0.01;
      this.markedForDeletion = false;
    }

    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(
        this.collisionX,
        this.collisionY,
        this.radius,
        0,
        Math.PI * 2
      );
      context.fill();
      context.stroke();
      context.restore();
    }
  }

  class FireFly extends Particle {
    constructor(game, x, y, color) {
      super(game, x, y, color);
    }

    update() {
      this.angle += this.va;
      this.collisionX += Math.cos(this.angle) * this.speedX;
      this.collisionY -= this.speedY;
      if (this.collisionY < 0 - this.radius) {
        this.markedForDeletion = true;
        this.game.particles = this.game.removeGameObject(this.game.particles);
      }
    }
  }

  class Spark extends Particle {
    constructor(game, x, y, color) {
      super(game, x, y, color);
    }

    update() {
      this.angle += this.va * 0.5;
      this.collisionX -= Math.cos(this.angle) * this.speedX;
      this.collisionY -= Math.sin(this.angle) * this.speedY;
      if (this.radius > 0.1) this.radius -= 0.05;
      if (this.radius < 0.2) {
        this.markedForDeletion = true;
        this.game.particles = this.game.removeGameObject(this.game.particles);
      }
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.topMargin = 260;
      this.player = new Player(this);

      this.numberOfObstacles = 10;
      this.obstacles = [];

      this.eggs = [];
      this.maxEggs = 500;
      this.eggTimer = 20;
      this.eggInterval = 1000;

      this.hatchlings = [];
      this.lostHatchlings = 0;
      this.score = 0;

      this.winningScore = 5;

      this.enemies = [];

      this.particles = [];

      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      };

      this.fps = 70;
      this.timer = 0;
      this.interval = 1000 / this.fps;

      this.gameObjects = [];

      this.debug = true;
      this.gameOver = false;

      canvas.addEventListener("mousedown", (e) => {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
        this.mouse.pressed = true;
      });
      canvas.addEventListener("mouseup", (e) => {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
        this.mouse.pressed = false;
      });
      canvas.addEventListener("mousemove", (e) => {
        if (!this.mouse.pressed) return;
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "d") this.debug = !this.debug;
        if (this.gameOver && /r/i.test(e.key)) {
          this.restart();
          this.init();
        }
      });
    }

    restart() {
      this.gameOver = false;
      this.score = 0;
      this.eggTimer = 0;
      this.lostHatchlings = 0;
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      };
      [
        this.enemies,
        this.eggs,
        this.hatchlings,
        this.obstacles,
        this.particles,
      ].forEach((object) => {
        object.splice(0, object.length);
      });

      this.player.restart();
    }

    init() {
      for (let i = 0; i < 3; i++) {
        this.addEnemy();
      }
      let attempts = 0;
      while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
        let temp = new Obstacle(this);
        let overlap = false;

        this.obstacles.forEach((obstacle) => {
          const distanceBuffer = 150;
          const [collision] = this.checkCollision(
            temp,
            obstacle,
            distanceBuffer
          );
          if (collision) {
            overlap = true;
          }
        });

        const margin = temp.collisionRadius * 2;
        if (
          !overlap &&
          temp.spriteX > 0 &&
          temp.spriteX < this.width - temp.width &&
          temp.collisionY > this.topMargin + margin &&
          temp.collisionY < this.height - margin
        ) {
          this.obstacles.push(temp);
        }
        attempts++;
      }
    }

    drawDebug(ctx, x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.restore();
      ctx.stroke();
    }

    addEgg() {
      this.eggs.push(new Egg(this));
    }

    addEnemy() {
      this.enemies.push(new Enemy(this));
    }

    render(context, deltaTime) {
      if (this.timer > this.interval) {
        // fps
        context.clearRect(0, 0, this.width, this.height);
        this.timer = 0;
        this.gameObjects = [
          ...this.eggs,
          ...this.obstacles,
          ...this.enemies,
          ...this.hatchlings,
          ...this.particles,
          this.player,
        ];
        this.gameObjects.sort((a, b) => {
          return a.collisionY - b.collisionY;
        });
        this.gameObjects.forEach((object) => {
          object.draw(context);
          if (object.update) object.update(deltaTime);
        });
      }
      this.timer += deltaTime;

      // add egg

      if (
        this.eggTimer > this.eggInterval && // checks whether timer has elapsed interval or not
        this.eggs.length < this.maxEggs && // check currently existing eggs count
        !this.gameOver // checks whether game is over or not
      ) {
        this.eggTimer = 0;
        this.addEgg();
      } else {
        this.eggTimer += deltaTime;
      }

      // draw game status
      context.save();
      context.textAlign = "left";
      context.fillText("Score : " + this.score, 25, 50);
      if (this.debug) {
        context.fillText("Lost : " + this.lostHatchlings, 25, 100);
      }
      context.restore();

      // win / lose message

      if (this.score >= this.winningScore) {
        this.gameOver = true;
        context.save();
        context.fillStyle = "rgba(0,0,0,0.5)";
        context.fillRect(0, 0, this.width, this.height);
        context.fillStyle = "white";
        context.textAlign = "center";
        context.shadowOffsetX = 4;
        context.shadowOffsetY = 4;
        context.shadowBlur = 15;
        let message1;
        let message2;
        let shadowColor;
        if (this.lostHatchlings <= 5) {
          message1 = "Bullseyee !!!";
          message2 = "You bullied the bullies";
          shadowColor = "green";
        } else {
          // lose
          message1 = "Bullocks !!";
          message2 = `You lost ${this.lostHatchlings} hatchlings , don't be a pushover`;
          shadowColor = "red";
        }
        context.shadowColor = shadowColor;
        context.font = "90px Bangers";
        context.fillText(message1, this.width * 0.5, this.height * 0.5 - 20);
        context.font = "40px Bangers";
        context.fillText(message2, this.width * 0.5, this.height * 0.5 + 30);
        context.fillText(
          `Final score ${this.score} . Press "R" to butt heads again !!`,
          this.width * 0.5,
          this.height * 0.5 + 80
        );
        context.restore();
      }
    }

    removeGameObject(objects) {
      return objects.filter((egg) => !egg.markedForDeletion);
    }

    checkCollision(a, b, buffer = 0) {
      const dx = a.collisionX - b.collisionX;
      const dy = a.collisionY - b.collisionY;
      const distance = Math.hypot(dx, dy);
      const sumOfRadii = a.collisionRadius + b.collisionRadius;
      return [distance < sumOfRadii + buffer, distance, sumOfRadii, dx, dy];
    }
  }

  const game = new Game(canvas);

  game.init();
  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    game.render(ctx, deltaTime);

    requestAnimationFrame(animate);
  }

  animate(0);
});
