function ChessSquare(squareId) {
    const div = document.createElement('div')
    div.setAttribute('chess-square','')
    div.setAttribute('id', squareId)

    this.element = div
    this.getId = () => div.getAttribute('id')
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