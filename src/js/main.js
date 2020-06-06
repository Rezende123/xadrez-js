// import { ChessRow, ChessSquare } from './models/ChessArea'

const buildBoard = () => {
    const buildSquares = (row) => {
        let squares = []
        for (let column = 0; column < 8; column++) {
            const squareId = `r${row}c${column}`
            squares.push(new ChessSquare(squareId))
        }

        return squares
    }
    const buildRows = () => {
        for (let row = 0; row < 8; row++) {
            const squares = buildSquares(row) 
            const chessRow = new ChessRow(squares)
            
            board.appendChild(chessRow)
        }
    }
    const board = document.querySelector('[board]')
    
    buildRows()
}

buildBoard()