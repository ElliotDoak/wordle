const tileDisplay = document.querySelector(".tile-container");
const keyboard = document.querySelector(".key-container");
const msgDisplay = document.querySelector(".msg-container");

let word;

const getWordle = () => {
  fetch("http://localhost:8000/word")
    .then((response) => response.json())
    .then((json) => {
      console.log(json), (word = json.toUpperCase());
    })
    .catch((err) => console.log(err));
};

getWordle();

let currentRow = 0;
let currentTile = 0;
let isGameOver = false;
const SUCCESS_MSG = "Well aren't you a clever clogs!";
const NOT_A_WORD_MSG = "Sorry but that's not a word 👎🏻";
const GAME_OVER = "GAME OVER! Better luck next time... 👀";

const keys = [
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "enter",
  "Z",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
  "<<",
];

const guessRows = [
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
];

guessRows.forEach((guessRow, guessRowIndex) => {
  const rowElement = document.createElement("div");
  rowElement.setAttribute("id", "guessRow-" + guessRowIndex);
  guessRow.forEach((guess, guessIndex) => {
    const tileElement = document.createElement("div");
    tileElement.setAttribute(
      "id",
      "guessRow-" + guessRowIndex + "-tile-" + guessIndex
    );
    tileElement.classList.add("tile");
    rowElement.append(tileElement);
  });
  tileDisplay.append(rowElement);
});

const handleClick = (letter) => {
  if (!isGameOver) {
    if (letter === "<<") {
      deleteLetter();
      return;
    }
    if (letter === "enter") {
      checkRow();
      return;
    }
    addLetter(letter);
  }
};

const addLetter = (letter) => {
  if (currentTile < 5 && currentRow < 6) {
    const tile = document.getElementById(
      "guessRow-" + currentRow + "-tile-" + currentTile
    );
    tile.textContent = letter;
    guessRows[currentRow][currentTile] = letter;
    tile.setAttribute("data", letter);
    currentTile++;
  }
};

const deleteLetter = () => {
  if (currentTile > 0) {
    currentTile--;
    const tile = document.getElementById(
      "guessRow-" + currentRow + "-tile-" + currentTile
    );
    tile.textContent = "";
    guessRows[currentRow][currentTile] = "";
    tile.setAttribute("data", "");
  }
};

const checkRow = () => {
  const guess = guessRows[currentRow].join("");

  if (currentTile > 4) {
    fetch(`http://localhost:8000/check/?word=${guess}`)
      .then((response) => response.json())
      .then((json) => {
        if (json == "Entry word not found") {
          showMessage(NOT_A_WORD_MSG);
          return;
        } else {
          flipTile();
          if (word == guess) {
            showMessage(SUCCESS_MSG);
            isGameOver = true;
            return;
          } else {
            if (currentRow >= 5) {
              isGameOver = true;
              showMessage(GAME_OVER);
              return;
            }
            if (currentRow < 5) {
              currentRow++;
              currentTile = 0;
            }
          }
        }
      });
  }
};

const showMessage = (message) => {
  const msgElement = document.createElement("p");
  msgElement.textContent = message;
  msgDisplay.append(msgElement);
  if (message != GAME_OVER) {
    setTimeout(() => msgDisplay.removeChild(msgElement), 3000);
  }
};

const addColourToKey = (keyLetter, colour) => {
  const key = document.getElementById(keyLetter);
  key.classList.add(colour);
};

const flipTile = () => {
  const rowTiles = document.querySelector("#guessRow-" + currentRow).childNodes;
  let checkWord = word;
  const guess = [];

  rowTiles.forEach((tile) => {
    guess.push({ letter: tile.getAttribute("data"), color: "grey-overlay" });
  });

  guess.forEach((guess, index) => {
    if (guess.letter == word[index]) {
      guess.color = "green-overlay";
      checkWord = checkWord.replace(guess.letter, "");
    }
  });

  guess.forEach((guess) => {
    if (checkWord.includes(guess.letter)) {
      guess.color = "yellow-overlay";
      checkWord = checkWord.replace(guess.letter, "");
    }
  });

  rowTiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("flip");
      tile.classList.add(guess[index].color);
      addColourToKey(guess[index].letter, guess[index.color]);
    }, 500 * index);
  });

  rowTiles.forEach((tile, index) => {
    const dataLetter = tile.textContent;
    setTimeout(() => {
      tile.classList.add("flip");
      if (dataLetter == word[index]) {
        tile.classList.add("green-overlay");
        addColourToKey(dataLetter, "green-overlay");
      } else if (word.includes(dataLetter)) {
        tile.classList.add("yellow-overlay");
        addColourToKey(dataLetter, "yellow-overlay");
      } else {
        tile.classList.add("grey-overlay");
        addColourToKey(dataLetter, "grey-overlay");
      }
    }, 500 * index);
  });
};

keys.forEach((key) => {
  const buttonElement = document.createElement("button");
  buttonElement.textContent = key;
  buttonElement.setAttribute("id", key);
  buttonElement.addEventListener("click", () => handleClick(key));
  keyboard.append(buttonElement);
});
