const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const scale = 20; // size of each block

const horizontalSegments = 15;
const verticalSegments = 25;
canvas.width = scale * horizontalSegments;
canvas.height = scale * verticalSegments;

const tetriminoes = {
  I: [[1, 1, 1, 1]],
  J: [
    [1, 1],
    [0, 1],
    [0, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  L: [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
};

let score = 0;
let highScore = 0;
let move;
// Initialize canvasSegments
let canvasSegments = Array(verticalSegments)
  .fill()
  .map(() => Array(horizontalSegments).fill(0));

// Initialize dormantPieces
let dormantPieces = Array(verticalSegments)
  .fill()
  .map(() => Array(horizontalSegments).fill(0));

//draw every segment of the game area

const drawBoard = () => {
  for (let r = 0; r < canvasSegments.length; r++) {
    for (let c = 0; c < canvasSegments[r].length; c++) {
      context.fillStyle = "#1E201E";
      context.fillRect(c * scale, r * scale, scale, scale);
      context.strokeStyle = "#697565";
      context.strokeRect(c * scale, r * scale, scale, scale);
    }
  }
};
//to display the updated score on the #score tag

const displayScore = () => {
  document.getElementById("score").innerText = score;
};
//initalize random tertrimino from the tetrimino array

const randomObject = () => {
  const objectKeys = Object.keys(tetriminoes);
  const randomKey = objectKeys[Math.floor(Math.random() * objectKeys.length)];
  return tetriminoes[randomKey];
};

let activePiece = {};

//create a tetrimino from the randomObject and put it on top center of the gameboard

const createNewPiece = () => {
  activePiece = {
    shape: randomObject(),
    x: Math.floor(horizontalSegments / 2) - 2,
    y: 0,
  };
  checkGameOver();
};

const checkGameOver = ()=>{
    for(let c = 0; c<horizontalSegments;c++){
        if(dormantPieces[activePiece.shape.length][c]){
            clearInterval(move);

            // if the game is over show the result
            document.querySelector(".game-over").style.display = "grid";
            document.getElementById("final-score").innerText = score;
            highScore = score > highScore? score:highScore;
            document.getElementById("high-score").innerText = highScore;
        }
    }
}

//fill the areas of the game board where the acivepiece is found

const drawObject = () => {
  for (let r = 0; r < activePiece.shape.length; r++) {
    for (let c = 0; c < activePiece.shape[r].length; c++) {
      if (activePiece.shape[r][c]) {
        context.fillStyle = "#ECDFCC";
        context.fillRect(
          (activePiece.x + c) * scale,
          (r + activePiece.y) * scale,
          scale,
          scale
        );
        context.strokeStyle = "#3C3D37";
        context.strokeRect(
          (activePiece.x + c) * scale,
          (r + activePiece.y) * scale,
          scale,
          scale
        );
      }
    }
  }
};

//unfill the area of the active piece(when it is moved away)

const clearObject = () => {
  for (let r = 0; r < activePiece.shape.length; r++) {
    for (let c = 0; c < activePiece.shape[r].length; c++) {
      if (activePiece.shape[r][c]) {
        context.fillStyle = "#1E201E";
        context.fillRect(
          (activePiece.x + c) * scale,
          (r + activePiece.y) * scale,
          scale,
          scale
        );
        context.strokeStyle = "#697565";
        context.strokeRect(
          (activePiece.x + c) * scale,
          (r + activePiece.y) * scale,
          scale,
          scale
        );
      }
    }
  }
};

//count the score when the hoizonal dormant segments fill without gap
//and clear the horizontal filled row

const checkScore = () => {
  let count = 0;
  for (let r = activePiece.y; r < verticalSegments; r++) {
    for (let c = 0; c < horizontalSegments; c++) {
      if (dormantPieces[r][c]) {
        count++;
      }
    }
    if (count == horizontalSegments) {

      //shift the upper rows down and remove the filled row

      dormantPieces.splice(r, 1);
      dormantPieces.unshift(new Array(horizontalSegments).fill(0));
      drowDormantPieces(); //a function to redraw the dormant pieces after they are updated

      score++;
      displayScore(); //finally display the updated score

      return true;
    }
    count = 0;
  }
  return false;
};

//to redrow the udated dormant segments when a player clears a raw

const drowDormantPieces = () => {
  drawBoard();
  for (let r = 0; r < dormantPieces.length; r++) {
    for (let c = 0; c < dormantPieces[0].length; c++) {
      if (dormantPieces[r][c]) {
        context.fillStyle = "#ECDFCC";
        context.fillRect(c * scale, r * scale, scale, scale);
        context.strokeStyle = "#3C3D37";
        context.strokeRect(c * scale, r * scale, scale, scale);
      }
    }
  }
};

//to detect if the active piece is colided with the game board boundary or other dormant pieces

const isCollision = () => {
  // Check boundaries
  if (activePiece.x < 0) return { left: true };
  if (activePiece.x + activePiece.shape[0].length > horizontalSegments)
    return { right: true };
  if (activePiece.y + activePiece.shape.length > verticalSegments)
    return { down: true };

  // Check collision with dormant pieces
  for (let r = 0; r < activePiece.shape.length; r++) {
    for (let c = 0; c < activePiece.shape[r].length; c++) {
      if (activePiece.shape[r][c]) {
        const boardRow = activePiece.y + r;
        const boardCol = activePiece.x + c;
        if (
          boardRow >= 0 &&
          boardRow < verticalSegments &&
          boardCol >= 0 &&
          boardCol < horizontalSegments &&
          dormantPieces[boardRow][boardCol]
        ) {
          return { down: true };
        }
      }
    }
  }
  return false;
};

//to make the active piece dormant(when reached the bottom destination)

const makeDormant = () => {
  for (let r = 0; r < activePiece.shape.length; r++) {
    for (let c = 0; c < activePiece.shape[r].length; c++) {
      if (activePiece.shape[r][c]) {
        const boardRow = activePiece.y + r;
        const boardCol = activePiece.x + c;
        if (
          boardRow >= 0 &&
          boardRow < verticalSegments &&
          boardCol >= 0 &&
          boardCol < horizontalSegments
        ) {
          dormantPieces[boardRow][boardCol] = 1;
        }
      }
    }
  }
  createNewPiece();
};

//to move the active piece when there is no collision

const moveDown = () => {
  clearObject();
  activePiece.y++;
  if (isCollision().down) {
    activePiece.y--; // Move back up
    drawObject(); // Draw before making dormant
    makeDormant();
    console.log(checkScore());
  } else {
    drawObject();
  }
};

const moveRight = () => {
  clearObject();
  activePiece.x++;
  if (isCollision().right) {
    activePiece.x--; //move back left
  }
  drawObject();
};

const moveLeft = () => {
  clearObject();
  activePiece.x--;
  if (isCollision().left) {
    activePiece.x++; //move back right
  }
  drawObject();
};

//to rotate the active piece to the anticlockwise direction

const rotate = () => {
  clearObject();
  const originalShape = [...activePiece.shape.map((row) => [...row])];
  let newShape = activePiece.shape[0].map((_, c) =>
    activePiece.shape.map((row) => row[c])
  );
  newShape = newShape.map((row) => row.reverse());

  activePiece.shape = newShape;
  if (isCollision()) {
    activePiece.shape = originalShape; // Revert if collision
  }
  drawObject();
};


//put key down events to control using the keyboard
const handleClick = ()=>{
    document.body.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "ArrowDown":
            moveDown();
            break;
          case "ArrowRight":
            moveRight();
            break;
          case "ArrowLeft":
            moveLeft();
            break;
          case "ArrowUp":
            rotate();
            break;
        }
      });
}

handleClick();
let speed;
//put all together in a start game function

const startGame = (spd) => {
  speed = spd;
  document.querySelector(".start-page").style.display = "none";
  drawBoard();
  displayScore();
  createNewPiece();
  drawObject();

  move = setInterval(() => {
    moveDown();
  }, spd);
};

//let the player restart the game if the game is over
const restart = ()=>{
    document.querySelector(".game-over").style.display = "none";

    //reinitialize dormant pieces from 0
    dormantPieces = Array(verticalSegments)
    .fill()
    .map(() => Array(horizontalSegments).fill(0));

    //clear the previous moves
    clearInterval(move);

    //reset score
    score = 0;
    displayScore();

    //triger the game to start🚀🚀🚀
    startGame(speed);
}