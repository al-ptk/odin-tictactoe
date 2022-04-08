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
            if (isValidLink(index, spot)) {
                links.push([index, spot])
            }
        }
        spots.push(index);
        return hasVictory();
    }

    function isValidLink(index, spot) {
        // p(`spot ${spot} and ${index}`);
        // p(`Not on opposite edges ${onOppositeEdges(index, spot)}`);
        // p(`Is neighbour ${isNeighbour(index, spot)}`);
        // p(`Link not included ${!links.includes([index,spot])}`)
        // p('')
        return onOppositeEdges(index, spot) 
            && isNeighbour(index, spot)
            && !links.includes([index,spot]);
    }

    function onOppositeEdges (a, b) {
        a > b ? [a, b] = [b, a] : '';
        const aLeftEdge = (a % gridEdge === 0);
        const aRightEdge = (a % gridEdge === gridEdge - 1);
        const bLeftEdge = (b % gridEdge === 0);
        const bRightEdge = (b % gridEdge === gridEdge - 1);
        const result = !(aLeftEdge && bRightEdge || aRightEdge && bLeftEdge);
        // p(`${a} and ${b} NOT on opposite sides ${!result}`);
        return result;
    }

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
    }

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
            }
        }
        return false;
    }

    function isChain (linkA, linkB) {
        let elementInCommon = linkA.includes(linkB[0]) || linkA.includes(linkB[1]);

        if (!elementInCommon) {
            return false;
        } else {
            const chain = extractChain(linkA, linkB);
            return isHorizontalLine(chain)
                || isVerticalLine(chain)
                || isBackslashLine(chain)
                || isForwardslashLine(chain);
        }
    }

    function extractChain(linkA, linkB) {
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
        return chain;
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
}

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

    function playerTurn (e) {
        if (e.target.textContent !== '') return;
        p(players[currentTurn].getName());
        const index = e.target.id.slice(1);
        board[index] = players[currentTurn].getSymbol();
        const victory = players[currentTurn].registerMove(index)
        updateWidget();
        if (victory) {
            p(`${players[currentTurn].getName()} won`);
        }
        cycleTurn();
    }

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

    function cycleTurn () {
        currentTurn++;
        if (currentTurn >= players.length) {
            currentTurn = 0;
        }
    }

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
    }

    return Object.assign(
        PlayerFactory('Computer', 'C', 'blue', gridEdge),
        {
            getValidInput
        });
}

const HTMLroot = document.querySelector(':root');
const root = document.createElement('div');
root.id = 'appRoot';
const body = document.querySelector('body');
body.appendChild(root);

const gridSize = 3;
const players = [
    PlayerFactory('Player1', 'K', 'green', gridSize),
    // AiFactory(gridSize)
    PlayerFactory('Player2', 'J', 'red', gridSize)
];
const match = MatchFactory(gridSize, players);