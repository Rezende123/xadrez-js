function createPartImage (imgName) {
    const img = document.createElement('img')
    img.src = `assets/${imgName}.png`
    img.classList.add('img-part')

    return img
}

// Peças, a função pai que todas as outras funções vão herdar
function Part(square, color = 'b') {
    this.img = createPartImage(`${color}_torre`)

    this.setSquare = (_square) => {
        _square.classList.add('cursor')
        _square.appendChild(this.img)
        
        this.square = _square
    }
    this.setSquare(square)
}

// Torre
function Tower(square, color = 'b') {
    Part.call(this, square, color) // Herança
}
