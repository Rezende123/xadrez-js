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
        let threatRivalsInRisk = false
        let canSaveKing = false
        const threatRivals = []
        const king = team.find(part => part.__proto__.constructor.name === 'King')
        const partIsInRisk = (part) => 
            Array.from(document.querySelectorAll('[kill-risk]'))
            .find(option => option.id == part.square.element.id)

        const clearSimulate = (_team) => {
            const clearKillRisk = (option) => option.removeAttribute('kill-risk')
            document.querySelectorAll('[kill-risk]').forEach(clearKillRisk)

            _team.removeDivOptions()

            _team.gameRows = null
            _team.rivals = null
            _team.turn = null
        }

        const simulateRivalTurn = rival => {
            rival.gameRows = this.rows
            rival.rivals = [king]
            rival.turn = 'test'
            rival.walking()

            const thisRivalIsRisk = partIsInRisk(king)

            kingInRisk = thisRivalIsRisk || kingInRisk

            if (thisRivalIsRisk && kingInRisk) {
                rival.square.element.setAttribute('save-king', 'killer')
                threatRivals.push(rival)
            }

            clearSimulate(rival)
        }
        rivals.forEach(simulateRivalTurn)

        const simulateTurn = _team => {
            _team.gameRows = this.rows
            _team.rivals = threatRivals
            _team.turn = 'test'
            _team.walking()

            threatRivals.forEach(r => threatRivalsInRisk = partIsInRisk(r) || threatRivalsInRisk)

            if (kingInRisk) {
                const verifyCanSaveKing = () => 
                    Array.from(document.querySelectorAll('.walk-option'))
                    .find(option =>
                        option.parentNode.getAttribute('save-king') != null &&
                        _team.__proto__.constructor.name != 'King'
                    )
                
                canSaveKing = verifyCanSaveKing() || canSaveKing
            }
            
            clearSimulate(_team)
        }
        team.forEach(simulateTurn)
        
        if (kingInRisk) {
            kingInRisk.classList.add('check')
            
            if (!canSaveKing && !threatRivalsInRisk) {

                const checkmateMessage = document.getElementById('check-kill')
                checkmateMessage.classList.remove('hide')

                document.getElementById('winner').innerHTML =
                    (king.color == 'b')? 'Player 2' : 'Player 1'

                this.isFinish = true
            }
        } else {
            const squareSaveKing = Array.from(document.querySelectorAll('[save-king]'))
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