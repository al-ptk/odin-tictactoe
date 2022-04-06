'use strict';
const p = (str) => console.log(str);

function PlayerFactory (symbol, color) {
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


    function makeMove (index) {
        spots.push(index)
        for (const spot in spots) {
            if (isNeighbour(spot, index)) {
                links.push([index, spot])
            }
        }

        if (hasVictory()) {
            return 'winner!'
        }
    }

    function hasVictory () {
        tempLinks = [...links]
        while (tempLinks.length != 0) {

            // Each loop pops the last element
            // Then checks all other elements against the popped one
            // That way, no element is checked for Links twice

            currentLoopLink = tempLinks.pop()
            for (tempLink of tempLinks) {
                if (isChain(tempLink, currentLoopLink)) {
                    return true;
                }
            }
            return false;
        }
    }

    function isChain (linkA, linkB) {
        let hasFirstElement = linkA.includes(linkB[0]);
        let hasSecondElement = linkA.includes(linkB[1]);

        if (!(hasFirstElement || hasSecondElement)) {
            return false;
        } else {
            // if linkA = [5,4] and linkB = [4, 3], then
            linkA.sort(); // [4, 5]
            linkB.sort(); // [3, 4]
            if (linkA[0] > linkB[0]) { // 4 > 3 ?
                [linkA, linkB] = [linkB, linkA]; // make it [3, 4] and [4, 5]
            }
            const chain = [...linkA, linkB[1]]; // [3, 4, 5]
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
        return (chain[0] + 3) == chain[1]
            && (chain[0] + 6) == chain[2];
    }

    return {
        getColor,
        getSymbol,
        getScore,
        incrementScore,
        makeMove,
        isChain
    };
}

const p1 = PlayerFactory('X', 'green');
console.log(p1.isChain([6, 3], [3, 0]));