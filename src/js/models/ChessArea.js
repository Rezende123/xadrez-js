function ChessSquare(column, row) {
    this.row = row
    this.column = column
    
    this.getId = () => id
    this.idFormatter = (column, row) => `r${row}c${column}`
    
    const id = this.idFormatter(column, row)   
    const div = document.createElement('div')
    div.setAttribute('chess-square','')
    div.setAttribute('id', id)
    
    this.element = div
}

function ChessRow(squares) {
    const div = document.createElement('div')
    div.setAttribute('chess-row','')

    if (squares && squares.length) {
        squares
            .map(square => square.element)
            .forEach(square => {
                div.appendChild(square)
            });
    }

    this.element = div
}