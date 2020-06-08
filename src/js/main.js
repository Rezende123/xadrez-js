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
    this.setTurn = (team, turn, rivals) => team.forEach(part => {
        part.gameRows = this.rows
        part.turn = turn
        part.rivals = rivals
    })
    this.play = async () => {
        this.blackTeam = insertParts('b', blackTimeRows)
        this.whiteTeam = insertParts('w', whiteTimeRows)
        let countTurn = 0
        const turn = (team, rivals) => {
            return new Promise((res, rej) => {
                this.setTurn(team, res, rivals)
            })
        }

        while(true) {
            const team = (countTurn % 2 == 0) ? this.blackTeam : this.whiteTeam
            const rivals = (countTurn % 2 == 0) ? this.whiteTeam : this.blackTeam
            
            await turn(team, rivals)
            this.setTurn(team, null)

            const removeDeads = (_rivals) => {
                let index = _rivals.findIndex(rival => !rival.square);
                if (index > -1) {
                    _rivals.splice(index, 1);
                }
            }

            removeDeads(rivals)
            
            countTurn++
        }

    }
}

const chessRows = buildBoard()
const game = new Game(chessRows)
game.play()//.then(res => console.log(res))