function createPartImage (imgName) {
    const img = document.createElement('img')
    img.src = `assets/${imgName}.png`
    img.classList.add('img-part')

    return img
}

function createDivOption() {
    const div = document.createElement('div')
    div.classList.add('walk-option')
    div.classList.add('cursor')
    div.setAttribute('play-option', '')
    return div
}

function removeDivOptions() {
    const options = Array.from(document.querySelectorAll('[play-option]'))
    options.forEach(option => option.remove())
}

// Peças, a função pai que todas as outras funções vão herdar
function Part(square, imgName) {
    this.img = createPartImage(imgName)
    this.imgName = imgName

    this.setSquare = (_square) => {
        _square.element.classList.add('cursor')
        _square.element.appendChild(this.img)
        
        this.square = _square
    }
    this.setSquare(square)
}

// Torre
function Tower(square, color = 'b') {
    Part.call(this, square, `${color}_torre`) // Herança
}

// Cavalo
function Horse(square, color = 'b') {
    Part.call(this, square, `${color}_cavalo`) // Herança
}

// Bispo
function Bishp(square, color = 'b') {
    Part.call(this, square, `${color}_bispo`) // Herança
}

// Rei
function King(square, color = 'b') {
    Part.call(this, square, `${color}_rei`) // Herança
}

// Rainha
function Queen(square, color = 'b') {
    Part.call(this, square, `${color}_rainha`) // Herança
}

// Peão
function Pawn(square, color = 'b') {
    Part.call(this, square, `${color}_peao`) // Herança
    
    this.isFirstStep = true
    this.color = color

    this.square.element.onclick = () => {
        let column = this.square.column
        let row = this.square.row
        
        removeDivOptions()
        
        const markOptions = (steps) => {
            for (let index = 1; index <= steps; index++) {
                const direction = (color == 'b')? 1 : -1
                const idOption = this.square.idFormatter(column, row + (direction * index))
                const option = document.getElementById(idOption)

                option.appendChild( createDivOption() )
            }
        }

        if (this.isFirstStep) {
            markOptions(2)
        } else {
            markOptions(1)
        }
    }
}
