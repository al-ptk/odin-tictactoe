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
    function clearCache () {
        spots.splice(0, spots.length);
        links.splice(0, links.length);
    };
    function getCache () {
        return {spots, links};
    }

    function makeMove (index) {
        for (const spot of spots) {
            if (isNeighbour(spot, index) && !onOppositeEdges(spot, index)) {
                p([index, spot]);
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

    return {
        getColor,
        getSymbol,
        getScore,
        incrementScore,
        makeMove,
        clearCache,
        getCache
    };
}

function MatchFactory (gridEdge) {
    const board = new Array(gridEdge ** 2).fill('');
    board[4] = 'X';

    return {
        board
    }
};

const match = MatchFactory(3);
const p1 = PlayerFactory('X', 'green', 3);
p1.makeMove(0);
p1.makeMove(6);
p1.makeMove(3);