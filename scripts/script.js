'use strict';
const p = (str) => console.log(str);

function PlayerFactory (name, symbol, color, gridEdge) {
    let score = 0;
    const spots = [];
    const links = [];

    function getName (){
        return name;
    };
    function getColor () {
        return color;
    };
    function getSymbol () {
        return symbol;
    };
    function getScore () {
        return score;
    };
    function incrementScore () {
        score++;
    };
    function clearCachedMoves () {
        spots.splice(0, spots.length);
        links.splice(0, links.length);
    };
    function getCachedMoves () {
        return {spots, links};
    };

    function registerMove (index) {
        index = parseInt(index);
        for (const spot of spots) {
            if (onOppositeEdges(index, spot) 
            && isNeighbour(index, spot)
            && !links.includes([index,spot])) {
                // The code requires links to be in ascending order
                links.push([index, spot].sort((a,b) => a - b));
            }
        }
        spots.push(index);
        return hasVictory();
    };

    function onOppositeEdges (a, b) {
        // The data is save in a one-dimension array.
        // As such, the only quirks I must deal with is when
        // opposite sides has adjacent index values.
        // The code below solves that issue!
        a > b ? [a, b] = [b, a] : '';
        const aLeftEdge = (a % gridEdge === 0);
        const aRightEdge = (a % gridEdge === gridEdge - 1);
        const bLeftEdge = (b % gridEdge === 0);
        const bRightEdge = (b % gridEdge === gridEdge - 1);
        const result = !(aLeftEdge && bRightEdge || aRightEdge && bLeftEdge);
        return result;
    };

    function isNeighbour(a, b) {
        a > b ? [a, b] = [b, a] : '';
        return (a === (b - 1)) // west
            || (a === (b + 1)) // east
            || (a === (b - gridEdge)) // north
            || (a === (b + gridEdge)) // south
            || (a === (b + gridEdge + 1)) // south-east
            || (a === (b - gridEdge + 1)) // north-east
            || (a === (b + gridEdge - 1)) // south-west
            || (a === (b - gridEdge - 1)) // north-west
    };

    function hasVictory () {
        const tempLinks = [...links]
        while (tempLinks.length != 0) {

            // Each loop pops the last element
            // Then checks all other elements against the popped one
            // That way, no element is checked for more than required

            let currentLoopLink = tempLinks.pop()
            for (const tempLink of tempLinks) {
                if (isChain(tempLink, currentLoopLink)) {
                    p(`Winning Chain ${tempLink} + ${currentLoopLink}`)
                    return true;
                }
            };
        };
        return false;
    };

    function isChain (linkA, linkB) {
        let elementInCommon = linkA.includes(linkB[0]) || linkA.includes(linkB[1]);
        if (!elementInCommon) {
            return false;
        } else {
            const chain = extendChain(linkA, linkB);
            return isHorizontalLine(chain)
                || isVerticalLine(chain)
                || isBackslashLine(chain)
                || isForwardslashLine(chain);
        };
    };

    function extendChain(chainA, chainB) {
        chainA.pop();
        const result = [].push(...chainA, ...chainB);
        return result;
    };

    function isHorizontalLine(chain) {
        let result = true;
        for (let i = 0; i < chain.length - 1; i++){
            let currentNumber = chain[i];
            let nextNumber = chain[i+1];
            result = currentNumber + 1 === nextNumber;
            // Chains are ALWAYS is ascending order
        }
        return result;
    };

    function isVerticalLine(chain) {
        let result = true;
        for (let i = 0; i < chain.length - 1; i++){
            let currentNumber = chain[i] + gridEdge;
            let nextNumber = chain[i+1];
            result = currentNumber === nextNumber;
        }
        return result;
    };

    function isBackslashLine(chain) {
        let result = true;
        for (let i = 0; i < chain.length - 1; i++){
            let currentNumber = chain[i] + (gridEdge + 1);
            let nextNumber = chain[i+1];
            result = currentNumber === nextNumber;)
        }
        return result;
    };

    function isForwardslashLine(chain) {
        return (chain[0] + (gridEdge - 1) * 1 ) == chain[1]
            && (chain[0] + (gridEdge - 1) * 2 ) == chain[2];
    };

    return {
        getColor,
        getSymbol,
        getScore,
        getName,
        incrementScore,
        registerMove,
        clearCachedMoves,
        getCachedMoves,
        isNeighbour,
        onOppositeEdges
    };
};

function MatchFactory (gridEdge, players) {
    const board = new Array(gridEdge ** 2).fill('');
    let currentTurn = 0;

    const boardWidget = (function (gridEdge) {
        HTMLroot.style.setProperty('--gridEdge', gridEdge);
        const container = document.createElement('div');
        container.classList.add('board-container')
        for (let i = 0; i < gridEdge ** 2; i ++) {
            const button = document.createElement('button');
            button.id = `b${i}`;
            button.classList.add('board-cell');
            button.addEventListener ('click', playerTurn)
            container.appendChild(button);
        }
        return root.appendChild(container);
    }(gridEdge));

    function playerTurn (event) {
        if (event.target.textContent !== '') return;
        const index = event.target.id.slice(1);
        board[index] = players[currentTurn].getSymbol();
        const victory = players[currentTurn].registerMove(index)
        updateWidget();
        const didWin = checkForVictory(victory);
        if (didWin) {
            return;
        }
        if (players[1].getName() === 'Computer'){
            const aiPick = players[1].getValidInput(getEmptySpaces());
            board[aiPick] = players[currentTurn].getSymbol();
            const victory = players[currentTurn].registerMove(aiPick)
            updateWidget();
            checkForVictory(victory);
        }
    };

    function checkForVictory (victory) {
        if (victory) {
            const gameOverModal = document.createElement('p');
            root.appendChild(gameOverModal);
            gameOverModal.classList.add('modals');
            gameOverModal.textContent = `${players[currentTurn].getName()} won!`;
            const quitBtn = document.createElement('button');
            gameOverModal.appendChild(quitBtn);
            quitBtn.textContent = 'Quit';
            quitBtn.addEventListener('click', e => {
                root.removeChild(gameOverModal);
                root.removeChild(boardWidget);
                titleScreen({});
            })
            currentTurn = -1;
            return true;
        } else {
            cycleTurn();
        }
    }

    function getWidgetReference () {
        return boardWidget;
    };

    function updateWidget () {
        for (let i = 0; i < gridEdge ** 2; i++){
            const btn = document.querySelector(`#b${i}`);
            btn.textContent = board[i];
        }
    };

    function getEmptySpaces () {
        const emptySpaces = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') emptySpaces.push(i)
        }
        return emptySpaces
    };

    function getFullBoard () {
        return board;
    };

    function clearBoard () {
        for (let i = 0; i < board.length; i++) {
            board[i] = '';
        }
    };

    function cycleTurn () {
        currentTurn++;
        if (currentTurn >= players.length) {
            currentTurn = 0;
        }
    };

    return {
        clearBoard,
        getWidgetReference,
        getFullBoard,
        getEmptySpaces,
        cycleTurn
    };
};


function AiFactory (gridEdge) {
    function getValidInput (emptySpaces) {
        const randomIndex = Math.trunc(Math.random() * emptySpaces.length);
        const spot = emptySpaces[randomIndex];
        return spot;
    };

    return Object.assign(
        PlayerFactory('Computer', 'C', 'blue', gridEdge),
        {
            getValidInput
        });
};

function titleScreen (data) {
    const container = document.createElement('div');
    container.classList.add('modals');
    const newGame = document.createElement('button');
    newGame.textContent = 'Let\'s Play!';
    newGame.addEventListener('click', e => {
        root.removeChild(container);
        pickPlayerNumberModal(pickGridSizeModal, data)
    });
    container.appendChild(newGame);
    root.appendChild(container)
}

function setPlayers (singlePlayer, gridEdge) {
    const p1 = PlayerFactory('Player 1', 'X', 'blue', gridEdge)
    let p2;
    if (singlePlayer) {
        p2 = AiFactory(gridEdge);
    } else {
        p2 = PlayerFactory('Player 2', 'O', 'blue', gridEdge)
    }
    return [p1, p2];
}

function pickPlayerNumberModal (callback, data) {
    const container = document.createElement('div');
    root.appendChild(container);
    container.classList.add('modals');
    const onePlayer = document.createElement('button');
    onePlayer.textContent = '1 Player';
    onePlayer.addEventListener('click', e => {
        root.removeChild(container);
        data.singlePlayer = true;
        callback(data);
    })
    container.appendChild(onePlayer);
    const twoPlayers = document.createElement('button');
    twoPlayers.textContent = '2 Players';
    twoPlayers.addEventListener('click', e => {
        root.removeChild(container);
        data.singlePlayer = false;
        callback(data);
    })
    container.appendChild(twoPlayers)
}

function pickGridSizeModal (data) {
    const container = document.createElement('div');
    container.classList.add('modals');
    const btn3 = document.createElement('button');
    btn3.textContent = '3x3';
    btn3.addEventListener('click', e => {
        root.removeChild(container);
        data.gridSize = 3
        data.players = setPlayers(data.singlePlayer, data.gridSize)
        const newMatch = MatchFactory(data.gridSize, data.players);
    });
    container.appendChild(btn3);

    const btn5 = document.createElement('button');
    btn5.textContent = '5x5';
    btn5.addEventListener('click', e => {
        root.removeChild(container);
        data.gridSize = 5
        data.players = setPlayers(data.singlePlayer, data.gridSize)
        const newMatch = MatchFactory(data.gridSize, data.players);
    });
    container.appendChild(btn5);

    const btn7 = document.createElement('button');
    btn7.textContent = '7x7';
    btn7.addEventListener('click', e => {
        root.removeChild(container);
        data.gridSize = 7
        data.players = setPlayers(data.singlePlayer, data.gridSize)
        const newMatch = MatchFactory(data.gridSize, data.players);
    });
    container.appendChild(btn7);

    root.appendChild(container);
}

const HTMLroot = document.querySelector(':root');
const root = document.createElement('div');
root.id = 'appRoot';
const body = document.querySelector('body');
body.appendChild(root);
titleScreen({});