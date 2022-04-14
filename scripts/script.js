'use strict';
const p = (str) => console.log(str);

function PlayerFactory (name, symbol, color, gridEdge, chainLen) {
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
    function setCachedMoves(spotsArray, linkArray) {
        spots.push(...spotsArray)
        links.push(...linkArray);
    }

    function registerMove (index) {
        index = parseInt(index);
        for (const spot of spots) {
            if (onOppositeEdges(index, spot) 
            && isNeighbour(index, spot)
            && !links.includes([index,spot])) {

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
        if (links.length < chainLen - 1) return false;
        const tempLinks = [...links];
        let currentLink;
        while (tempLinks.length > 0){
            currentLink = tempLinks.pop();
            for (let i = 0; i < tempLinks.length; i++) {
                const tempLink = tempLinks[i];
                if (isConnected(currentLink, tempLink)){
                    const currentChain = extendChain (currentLink, tempLink);
                    if (isValidChain(currentChain)){
                        if (chainLen > currentChain.length){
                            for (const nextLink of tempLinks){
                                if (nextLink === tempLink) {
                                    continue;
                                }
                                if (isConnected(currentChain, nextLink)){
                                    const newerChain = extendChain(currentChain,nextLink);
                                    if (isValidChain(newerChain)
                                        && newerChain.length === chainLen){
                                        return true
                                    }
                                }
                            }
                        } else {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    function isConnected (chainA, chainB) {
        let result = false;
        for (const element of chainA){
            result |= chainB.includes(element);
        }
        return result;
    }

    function extendChain (extended, extensor) {
        let result = [...extended];
        for (let element of extensor){
            if (!extended.includes(element)){
                result.push(element)
            }
        }
        return result.sort((a,b) => a - b);
    }

    function isValidChain (chain) {
        return isHorizontalLine(chain)
            || isVerticalLine(chain)
            || isBackslashLine(chain)
            || isForwardslashLine(chain);
    }

    function isHorizontalLine(chain) {
        if (chainLen === 3
            && !(chain[0] % gridEdge === 0)) {
                return false;
        }
        let result = true;
        for (let i = 0; i < chain.length - 1; i++){
            let currentNumber = chain[i];
            let nextNumber = chain[i+1];
            result &= currentNumber + 1 === nextNumber;
        }
        return result;
    };

    function isVerticalLine(chain) {
        let result = true;
        for (let i = 0; i < chain.length - 1; i++){
            let currentNumber = chain[i] + gridEdge;
            let nextNumber = chain[i+1];
            result &= currentNumber === nextNumber;
        }
        return result;
    };

    function isBackslashLine(chain) {
        let result = true;
        for (let i = 0; i < chain.length - 1; i++){
            let currentNumber = chain[i] + (gridEdge + 1);
            let nextNumber = chain[i+1];
            result &= currentNumber === nextNumber;
        }
        return result;
    };

    function isForwardslashLine(chain) {
        if (chainLen === 3
            && (chain[0] === 0
            ||  chain[chainLen-1] === 8)){
                return false;                
            }
        let result = true;
        for (let i = 0; i < chain.length - 1; i++){
            let currentNumber = chain[i] + (gridEdge - 1);
            let nextNumber = chain[i+1];
            result &= currentNumber === nextNumber;
        }
        return result;
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
        onOppositeEdges,
        hasVictory,
        setCachedMoves,
        extendChain,
        isConnected,
        isValidChain
    };
};

function MatchFactory (gridEdge, players) {
    const board = new Array(gridEdge ** 2).fill('');
    let currentTurn = 0;

    const boardWidget = (function (gridEdge) {
        HTMLroot.style.setProperty('--gridEdge', gridEdge);
        const container = document.createElement('div');
        container.classList.add('board-screen');
        const boardContainer = document.createElement('div')
        boardContainer.classList.add('board-container')
        container.appendChild(boardContainer);
        for (let i = 0; i < gridEdge ** 2; i ++) {
            const button = document.createElement('button');
            button.id = `b${i}`;
            button.classList.add('board-cell');
            button.addEventListener ('click', playerTurn)
            boardContainer.appendChild(button);
        }
        const clearButton = document.createElement('button');
        clearButton.classList.add('clearButton');
        clearButton.textContent = 'Reset Game';
        clearButton.style.fontSize = '22px'
        container.appendChild(clearButton)
        clearButton.addEventListener('click', e => {
           clearBoard();
           for (const player of players){
               player.clearCachedMoves();
           }
           updateWidget();
        })

        const quitButton = document.createElement('button');
        quitButton.classList.add('quitButton');
        quitButton.textContent = 'Quit Game';
        quitButton.style.fontSize = '22px'
        container.appendChild(quitButton)
        quitButton.addEventListener('click', e => {
            root.removeChild(container);
            titleScreen({});
        })

        return root.appendChild(container);        
    }(gridEdge));

    function playerTurn (event) {
        if (event.target.textContent !== '') return;
        const index = event.target.id.slice(1);
        board[index] = currentTurn; 
        const victory = players[currentTurn].registerMove(index)
        updateWidget();
        p(board);
        const didWin = checkForVictory(victory);
        if (didWin) {
            return;
        }
        if (players[1].getName() === 'Computer'){
            const aiPick = players[1].getValidInput(getEmptySpaces());
            board[aiPick] = currentTurn;
            const victory = players[currentTurn].registerMove(aiPick)
            updateWidget();
            checkForVictory(victory);
        }
        if (getEmptySpaces().length <= 0){
            const gameOverModal = document.createElement('p');
            root.appendChild(gameOverModal);
            gameOverModal.classList.add('modals');
            gameOverModal.textContent = `Tie!`;
            const quitBtn = document.createElement('button');
            gameOverModal.appendChild(quitBtn);
            quitBtn.textContent = 'Quit';
            quitBtn.addEventListener('click', e => {
                root.removeChild(gameOverModal);
                root.removeChild(boardWidget);
                titleScreen({});
            })
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

            if (board[i] === '') {
                btn.textContent = '';
            }
            if (board[i] === 0) {
                p(players);
                btn.textContent = players[0].getSymbol();
                btn.style.color = players[0].getColor();
            }
            if (board[i] === 1) {
                btn.textContent = players[1].getSymbol();
                btn.style.color = players[1].getColor();
            }
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


function AiFactory (gridEdge, chainLen) {
    function getValidInput (emptySpaces) {
        const randomIndex = Math.trunc(Math.random() * emptySpaces.length);
        const spot = emptySpaces[randomIndex];
        return spot;
    };

    return Object.assign(
        PlayerFactory('Computer', 'C', 'green', gridEdge, chainLen),
        {
            getValidInput
        });
};

function makeHeading (parent, text, CSSclass) {
    const heading = document.createElement('span');
    heading.classList.add(CSSclass);
    heading.textContent = text;
    return parent.appendChild(heading);
}

function titleScreen (data) {
    const container = document.createElement('div');
    container.classList.add('titlescreen');

    const _super = makeHeading (container, 'SUPER', 'super-text');
    const tic = makeHeading (container, 'TIC', 'tic-text');
    const tac = makeHeading (container, 'TAC', 'tac-text');
    const toe = makeHeading (container, 'TOE', 'toe-text');

    const newGame = document.createElement('button');
    newGame.textContent = 'Let\'s Play!';
    newGame.classList.add('newGameButton');
    newGame.addEventListener('click', e => {
        root.removeChild(container);
        pickPlayerNumberModal(pickSymbolAndColor, 'Player 1', data);
    });
    container.appendChild(newGame);
    root.appendChild(container)
}

function setPlayers (data) {
    const {gridSize, chainLen, singlePlayer, playerOne, playerTwo} = data;
    const p1 = PlayerFactory(
            'Player 1', 
            playerOne.symbol, 
            playerOne.color, 
            gridSize, 
            chainLen);
            
    let p2;
    if (singlePlayer) {
        p2 = AiFactory(gridSize, chainLen);
    } else {
        p(playerOne);
        p(playerTwo);
        p2 = PlayerFactory(
            'Player 2', 
            playerTwo.symbol, 
            playerTwo.color,
            gridSize,
            chainLen);
    }
    return [p1, p2];
}

function pickPlayerNumberModal (callback, title, data) {
    const container = document.createElement('div');
    root.appendChild(container);
    container.classList.add('playerNumberSelect');

    const back = backButton(titleScreen, pickPlayerNumberModal, {});
    container.appendChild(back);

    const onePlayer = document.createElement('button');
    onePlayer.textContent = '1 Player';
    onePlayer.classList.add('onePlayerSelect');
    onePlayer.addEventListener('click', e => {
        root.removeChild(container);
        data.singlePlayer = true;
        callback(pickGridSizeModal, title, data);
    })
    container.appendChild(onePlayer);

    const twoPlayers = document.createElement('button');
    twoPlayers.textContent = '2 Players';
    twoPlayers.classList.add('twoPlayersSelect');
    twoPlayers.addEventListener('click', e => {
        root.removeChild(container);
        data.singlePlayer = false;
        callback(pickGridSizeModal, title, data);
    })
    container.appendChild(twoPlayers)
}


function createRadioButton (name, value) {
    const rdo = document.createElement('input');
    rdo.setAttribute('type', 'radio');
    rdo.value = value;
    rdo.id = value;
    rdo.name = name;
    return rdo;
}

function createRadioLabel (item) {
    const lbl = document.createElement('label');
    lbl.setAttribute('for', item);
    lbl.textContent = item;
    lbl.style.fontSize = '18px';
    return lbl;
}

function createRadioField(id, legendText, items) {
    const field = document.createElement('fieldset');
    field.id = id;
    const legend = document.createElement('legend');
    legend.textContent = legendText;
    legend.style.fontSize = '20px';
    for (const item of items) {
        const radio = createRadioButton(`${id}Child`, item);
        const label = createRadioLabel(item);
        label.appendChild(radio);
        field.appendChild(label);
    }
    field.appendChild(legend);
    function getDOM () {
        return field;
    }
    function getPickedValue () {
        for (const item of field.childNodes){
            if (item.checked) {
                return item.value;
            }
        }
    }
    return {
        getDOM,
        getPickedValue
    }
}

function pickSymbolAndColor (callback, title, data) {
    const container = document.createElement('div');
    container.classList.add('symbol-n-color');
    root.appendChild(container);

    const headTitle = document.createElement('h3');
    headTitle.textContent = title;
    container.appendChild(headTitle)

    const colors = ['blue', 'red', 'green', 'yellow'];
    const colorField = createRadioField('colorPicker', 'Pick a Color:', colors);
    container.appendChild(colorField.getDOM());

    const symbols = ['X', 'O', '🤣', '😍', '🤔']
    const symbolField = createRadioField('symbolPicker', 'Pick a Symbol:', symbols)
    container.appendChild(symbolField.getDOM());

    const backBtn = backButton(pickPlayerNumberModal, pickSymbolAndColor, data);
    container.appendChild(backBtn);

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.style.fontSize = '24px';
    confirmButton.addEventListener('click', e => {
        if (data.singlePlayer){            
            container.parentElement.removeChild(container);
            data.playerOne = {
                'symbol' : symbolField.getPickedValue(),
                'color': colorField.getPickedValue()
            };
            callback(data);
        } else {
            if (!data.playerOne){
                container.parentElement.removeChild(container);
                data.playerOne = {
                    'symbol' : symbolField.getPickedValue(),
                    'color': colorField.getPickedValue()
                };
                pickSymbolAndColor(callback, 'Player 2', data);
            } else {
                container.parentElement.removeChild(container);
                data.playerTwo = {
                    'symbol' : symbolField.getPickedValue(),
                    'color': colorField.getPickedValue()
                };
                callback(data);
            }
        }
    });
    container.appendChild(confirmButton);
}

function backButton (previousModal, currentModal, data) {
    const backButton = document.createElement('button');
    backButton.textContent = '←';
    backButton.classList.add('backButton');
    backButton.addEventListener('click', e => {
        previousModal(currentModal, data)
        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    })
    return backButton;
}

function gridSizeButton (edgeSize, chainLen, parent, data) {
    const btn = document.createElement('button');
    btn.textContent = `${edgeSize}x${edgeSize}`;
    btn.addEventListener('click', e => {
        parent.parentNode.removeChild(parent);
        data.gridSize = edgeSize;
        data.chainLen = chainLen;
        data.players = setPlayers(data)
        const newMatch = MatchFactory(data.gridSize, data.players);
    });
    return parent.appendChild(btn);
}

function pickGridSizeModal (data) {
    const container = document.createElement('div');
    container.classList.add('modals');

    const backBtn = backButton(pickPlayerNumberModal, pickGridSizeModal, data);
    container.appendChild(backBtn);

    const btn3 = gridSizeButton(3, 3, container, data);
    const btn5 = gridSizeButton(5, 4, container, data);
    const btn7 = gridSizeButton(7, 4, container, data);

    root.appendChild(container);
}

const HTMLroot = document.querySelector(':root');
const root = document.createElement('div');
root.id = 'appRoot';
const body = document.querySelector('body');
body.appendChild(root);
titleScreen({});
// pickPlayerNumberModal();
// pickSymbolAndColor(()=>{},'Player 1', {});