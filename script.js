const BOARD_SIZE = 12
const NUMBER_OF_MINES = 15

const root = document.querySelector(":root")
const field = document.querySelector('.field')
const toggle = document.querySelector('.toggle')
const smiley = document.querySelector('.smiley')

let grid = []

let tilesLeft = BOARD_SIZE * BOARD_SIZE - NUMBER_OF_MINES
let minesLeft = NUMBER_OF_MINES
let gameRunning = false
let time = 0
let timer
let tiles = []

smiley.addEventListener('click', newGame)

function startGame() {
    root.style.setProperty("--grid-size", BOARD_SIZE);
    createGrid()
    createBombs()
    populateGrid()
    displayMinesLeft()
    displayTime()
    tiles = [...document.querySelectorAll(".tile")]
    tiles.forEach((tile) => {
        tile.addEventListener("click", clickTile);
        tile.addEventListener("contextmenu", rightclickTile);
    });
    smiley.src = 'media/images/happy.png'
}

function createGrid() {
    for(i = 0; i < BOARD_SIZE; i++) {
        grid[i] = []
        for(j = 0; j < BOARD_SIZE; j++) {
            grid[i][j] = false
        }
    }
}

function createBombs() {
    for (i = 0; i < NUMBER_OF_MINES; i++) {
        const x = randomNumber(0, grid.length)
        const y = randomNumber(0, grid.length)
        if(grid[x][y] === false) {
            grid[x][y] = true
        } else {
            i--
        }
    }
}

function populateGrid() {
    grid.forEach((row, y) => {
        row.forEach((el, x) =>{
            const tile = document.createElement('div')
            const img = document.createElement('img')
            tile.classList.add('tile', 'hidden', 'border-up-small')
            tile.appendChild(img)
            field.appendChild(tile)
            if (el !== true) {
                grid[y][x] = checkNeighbours(y, x)
            }
        })
    })
}

function checkNeighbours(y, x) {
    let num = 0;
    for (i = -1; i < 2; i++) {
        if(grid[y + i]) {
            for (j = -1; j < 2; j++) {
                if (grid[y + i][x + j] === true) {
                    num++
                }
            }          
        }
    }
    return num
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function clickTile(e) {
    if(gameRunning === false) {
        gameRunning = true
        startTimer()
    }
    const pos = findPosition(e)
    if (toggle.checked === true) {
        markTile(pos)
        return
    }
    revealTile(pos)
}

function rightclickTile(e) {
    e.preventDefault()
    if (gameRunning === false) {
        gameRunning = true;
        startTimer();
    }
    const pos = findPosition(e)
    markTile(pos)
}

function findPosition(e) {
    const tileNum = tiles.findIndex((tile) => tile === e.target.closest('div'));
    const y = Math.floor(tileNum / BOARD_SIZE);
    const x = tileNum % BOARD_SIZE;
    return [y, x]
}

function findTile(y, x) {
    return tiles[y * BOARD_SIZE + x];
}

function revealTile(pos) {
    const y = pos[0]
    const x = pos[1]
    const tile = findTile(y, x)
    if(tile.classList.contains('hidden') && (!tile.classList.contains('marked'))) {
        tilesLeft--
        if (grid[y][x] === true) {
            gameOver(pos);
            return;
        }
        tile.classList.remove("hidden", "border-up-small");
        if (grid[y][x] !== 0) {
            tile.textContent = grid[y][x];
            tile.classList.add(`color-${grid[y][x]}`);
            checkForWin()
            return;
        }
        const neighbours = findNeighbours(y,x)
        neighbours.forEach( neighbour => {
            revealTile(neighbour)
        })
        checkForWin()
    }
}

function findNeighbours(y,x) {
    neighbours = []
    for (i = -1; i < 2; i++) {
        if(grid[y + i]) {
            for (j = -1; j < 2; j++) {
                if (grid[y + i][x + j] !== undefined) {
                    if (i !== 0 || j !== 0) {
                        neighbours.push([y + i, x + j])
                    }
                }
            }
        }
    }
    return neighbours
}

function markTile(pos) {
    const y = pos[0]
    const x = pos[1]
    const tile = findTile(y,x)
    if (tile.classList.contains('hidden')) {
        if(tile.classList.contains('marked')) {
            tile.classList.remove("marked")
            minesLeft++
            displayMinesLeft();
            return
        }
        if (minesLeft > 0) {
            tile.classList.add("marked");
            minesLeft--
            displayMinesLeft();
        }
    }
}

function displayMinesLeft() {
    const numbers = document.querySelectorAll(".mines-left-display")
    const minesLeftString = minesLeft.toString().padStart(3, '0')
    numbers[0].src = `media/numbers/an${minesLeftString[0]}.svg`
    numbers[1].src = `media/numbers/an${minesLeftString[1]}.svg`;
    numbers[2].src = `media/numbers/an${minesLeftString[2]}.svg`;
}

function displayTime() {
    const numbers = document.querySelectorAll(".timer-display");
    const timerString = time.toString().padStart(3, "0");
    numbers[0].src = `media/numbers/an${timerString[0]}.svg`;
    numbers[1].src = `media/numbers/an${timerString[1]}.svg`;
    numbers[2].src = `media/numbers/an${timerString[2]}.svg`;
}

function checkForWin() {
    if (tilesLeft === 0) {
        tiles.forEach(tile => {
            if (tile.classList.contains('hidden')) {
                tile.classList.add('marked')
            }
        })
        minesLeft = 0;
        displayMinesLeft()
        clearInterval(timer)
        smiley.src = 'media/images/sunglass.png'
    }
}

function gameOver(pos) {
    tiles.forEach(tile => {
        tile.removeEventListener('click', clickTile)
        tile.removeEventListener('contextmenu', rightclickTile)
    })
    const y = pos[0]
    const x = pos[1]
    const tile = findTile(y, x)
    tile.classList.remove("hidden", "border-up-small");
    tile.classList.add('bomb')
    clearInterval(timer)
    smiley.src = 'media/images/knockout.png'
}

function startTimer() {
    timer = setInterval(() => {
        time++
        displayTime()
    }, 1000)
}

function newGame() {
    grid = []
    minesLeft = NUMBER_OF_MINES
    time = 0
    tilesLeft = BOARD_SIZE * BOARD_SIZE - NUMBER_OF_MINES
    gameRunning = false
    tiles.forEach(tile => {
        tile.remove()
    })
    tiles = []
    clearInterval(timer)
    startGame()  
}

startGame()