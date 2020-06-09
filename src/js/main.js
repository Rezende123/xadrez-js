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
    this.setTurn = (team, turn, rivals, isCheck) => team.forEach(part => {
        part.gameRows = this.rows
        part.turn = turn
        part.rivals = rivals
        part.isCheck = isCheck
    })
    this.isFinish = false
    this.isCheck = (team, rivals) => {
        let kingInRisk = false
        const king = team.find(part => part.__proto__.constructor.name === 'King')

        const simulateRivalTurn = rival => {
            rival.gameRows = this.rows
            rival.rivals = [king]
            rival.turn = 'test'
            rival.walking()

            const killRisk = Array.from(document.querySelectorAll('[kill-risk]'))
            const thisRivalIsRisk = killRisk.find(option => option.id == king.square.element.id)

            kingInRisk = thisRivalIsRisk || kingInRisk

            if (thisRivalIsRisk && kingInRisk) {
                rival.square.element.setAttribute('save-king', 'killer')
            }

            const clearKillRisk = (option) => option.removeAttribute('kill-risk')
            killRisk.forEach(clearKillRisk)

            rival.removeDivOptions()

            rival.gameRows = null
            rival.rivals = null
            rival.turn = null
        }
        rivals.forEach(simulateRivalTurn)
        
        const squareSaveKing = Array.from(document.querySelectorAll('[save-king]'))
        
        if (kingInRisk) {
            kingInRisk.classList.add('check')
            
            if (squareSaveKing.length == 1 &&
                squareSaveKing[0].getAttribute('save-king') == 'killer') {

                const checkKillMessage = document.getElementById('check-kill')
                checkKillMessage.classList.remove('hide')

                document.getElementById('winner').innerHTML =
                    (king.color == 'b')? 'Player 2' : 'Player 1'

                this.isFinish = true
            }
        } else {
            squareSaveKing.forEach(square => square.removeAttribute('save-king'))
            
            const squareInCheck = document.querySelector('.check')

            if (squareInCheck) {
                squareInCheck.classList.remove('check')
            }
        }

        return !!kingInRisk // Para converter o valor para booleano
    }
    this.play = async () => {
        this.blackTeam = insertParts('b', blackTimeRows)
        this.whiteTeam = insertParts('w', whiteTimeRows)
        let countTurn = 0
        const turn = (team, rivals, isCheck = false) => {
            return new Promise((res, rej) => {
                this.setTurn(team, res, rivals, isCheck)
            })
        }
        
        while(!this.isFinish) {
            const team = (countTurn % 2 == 0) ? this.blackTeam : this.whiteTeam
            const rivals = (countTurn % 2 == 0) ? this.whiteTeam : this.blackTeam
            const isCheck = this.isCheck(team, rivals)

            await turn(team, rivals, isCheck)
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