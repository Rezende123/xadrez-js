const buildBoard = () => {
    const buildSquares = (row) => {
        let squares = []
        for (let column = 0; column < 8; column++) {
            squares.push(new ChessSquare(column, row))
        }

        return squares
    }
    const buildRows = () => {
        const rows = []
        for (let row = 0; row < 8; row++) {
            const squares = buildSquares(row) 
            const chessRow = new ChessRow(squares)
            
            rows.push(squares)
            board.appendChild(chessRow.element)
        }

        return rows
    }
    const board = document.querySelector('[board]')
    
    return buildRows()
}

function Game(chessRows) {
    this.rows = chessRows
    const blackTimeRows = chessRows.slice(0, 2)
    const whiteTimeRows = chessRows.slice(6)

    const insertParts = (color, rows) => {
        const team = []
        const addToTeam = (part) => {
            team.push(part)
        }
        rows.forEach((squares, index) => {
            if (color === 'b' && index === 0 || color === 'w' && index === 1) {
                addToTeam( new Tower(squares[0], color) )
                addToTeam( new Horse(squares[1], color) )
                addToTeam( new Bishp(squares[2], color) )
                addToTeam( new King(squares[3], color) )
                addToTeam( new Queen(squares[4], color) )
                addToTeam( new Bishp(squares[5], color) )
                addToTeam( new Horse(squares[6], color) )
                addToTeam( new Tower(squares[7], color) )
            } else
            if (color === 'b' && index === 1 || color === 'w' && index === 0) {
                squares.forEach(square => addToTeam( new Pawn(square, color) ))
            }
        });

        return team
    }

    this.blackTeam = insertParts('b', blackTimeRows)
    this.whiteTeam = insertParts('w', whiteTimeRows)
}

const chessRows = buildBoard()
const game = new Game(chessRows)