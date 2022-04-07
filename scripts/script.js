'use strict';
const p = (str) => console.log(str);

function PlayerFactory (symbol, color, gridEdge) {
    let score = 0;
    const spots = [];
    const links = [];

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
        for (const spot of spots) {
            if (!onOppositeEdges(spot, index) && isNeighbour(spot, index)) {
                links.push([index, spot])
            }
        }
        spots.push(index);

        if (hasVictory()) {
            console.log('winner!');
        }
    }

    function onOppositeEdges (a, b) {
        const aLeftEdge = (a % gridEdge === 0);
        const aRightEdge = (a % gridEdge === gridEdge - 1);
        const bLeftEdge = (b % gridEdge === 0);
        const bRightEdge = (b % gridEdge === gridEdge - 1);
        return aLeftEdge && bRightEdge || aRightEdge && bLeftEdge;
    }

    function isNeighbour(a, b) {
        return (a === (b - 1)) // west
            || (a === (b + 1)) // east
            || (a === (b - gridEdge)) // north
            || (a === (b + gridEdge)) // south
            || (a === (b + gridEdge + 1)) // south-east
            || (a === (b - gridEdge + 1)) // north-east
            || (a === (b + gridEdge - 1)) // south-west
            || (a === (b - gridEdge - 1)) // north-west
    }

    function hasVictory () {
        const tempLinks = [...links]
        while (tempLinks.length != 0) {

            // Each loop pops the last element
            // Then checks all other elements against the popped one
            // That way, no element is checked for Links twice

            let currentLoopLink = tempLinks.pop()
            for (const tempLink of tempLinks) {
                if (isChain(tempLink, currentLoopLink)) {
                    return true;
                }
            }
        }
        return false;
    }

    function isChain (linkA, linkB) {
        let elementInCommon = linkA.includes(linkB[0]) || linkA.includes(linkB[1]);

        if (!elementInCommon) {
            p('no neighbours')
            return false;

        } else {

            linkA.sort();
            linkB.sort();
            if (linkA[0] > linkB[0]) {
                [linkA, linkB] = [linkB, linkA];
            }
            
            const chain = [
                linkA[0],
                linkA[1] > linkB[0] ? linkA[0] : linkB[0],
                linkB[1]
            ];
            // p(linkA + ' ' + linkB);
            // p(chain);
            return isHorizontalLine(chain)
                || isVerticalLine(chain)
                || isBackslashLine(chain)
                || isForwardslashLine(chain);
        }
    }

    function isHorizontalLine(chain) {
        return (chain[0] + 1) === chain[1]
            && (chain[0] + 2) === chain[2]
    }

    function isVerticalLine(chain) {
        return (chain[0] + gridEdge) == chain[1]
            && (chain[0] + gridEdge *2 ) == chain[2];
    }

    function isBackslashLine(chain) {
        return (chain[0] + (gridEdge + 1) * 1 ) == chain[1]
            && (chain[0] + (gridEdge + 1) * 2 ) == chain[2];
    }

    function isForwardslashLine(chain) {
        return (chain[0] + (gridEdge - 1) * 1 ) == chain[1]
            && (chain[0] + (gridEdge - 1) * 2 ) == chain[2];
    }

    function getValidInput (board) {

    }

    return {
        getColor,
        getSymbol,
        getScore,
        incrementScore,
        registerMove,
        clearCachedMoves,
        getCachedMoves,
        getValidInput
    };
}

function MatchFactory (gridEdge, players) {
    const board = new Array(gridEdge ** 2).fill('');

    const boardWidget = (function (gridEdge) {
        HTMLroot.style.setProperty('--gridEdge', gridEdge);
        const container = document.createElement('div');
        container.classList.add('board-container')
        for (let i = 0; i < gridEdge ** 2; i ++) {
            const button = document.createElement('button');
            button.id = `b${i}`;
            button.classList.add('board-cell');
            button.addEventListener ('click', e => {
                board[e.target.id.slice(1)] = 'X';
                const aiPick = players[1].getValidInput(getEmptySpaces());
                board[aiPick] = 'O';
                updateWidget();
            })
            container.appendChild(button);
        }
        return root.appendChild(container);
    }(gridEdge));

    function getWidgetReference () {
        return boardWidget;
    };

    function updateWidget () {
        for (let i = 0; i < gridEdge ** 2; i++){
            const btn = document.querySelector(`#b${i}`);
            btn.textContent = board[i];
        }
    }

    function getEmptySpaces () {
        const emptySpaces = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') emptySpaces.push(i)
        }
        return emptySpaces
    }

    function getFullBoard () {
        return board;
    }

    function clearBoard () {
        for (let i = 0; i < board.length; i++) {
            board[i] = '';
        }
    }

    return {
        clearBoard,
        getWidgetReference,
        getFullBoard,
        getEmptySpaces
    };
};

//  New game?
//      Number of human players
//      Get symbol, color and name for each human player
//      Grid size
//      Generate grid
//      Start gameLoop
//      If gameOver
//          If Rematch
//              updateScore
//              clear board
//          Else
//              title screen

function gameLoop (players,board) {
    let gameOver = false;
    while (!gameOver) {
        for (const player of players) {
            player.getValidInput(board.getEmptySpaces());
            gameOver = player.hasVictory();
            if (gameOver) {
                player.incrementScore();
                board.clearBoard();
            }
        }
    }
}

function AiFactory () {
    function getValidInput (emptySpaces) {
        const randomIndex = Math.trunc(Math.random() * emptySpaces.length);
        const spot = emptySpaces[randomIndex];
        return spot;
    }

    return {
        getValidInput
    }
}

const HTMLroot = document.querySelector(':root');
const root = document.createElement('div');
root.id = 'appRoot';
const body = document.querySelector('body');
body.appendChild(root);

const gridSize = 3;
const players = [
    PlayerFactory('X', 'green', gridSize),
    AiFactory()
]
const match = MatchFactory(gridSize, players);