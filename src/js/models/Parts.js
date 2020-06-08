function createPartImage (imgName) {
    const img = document.createElement('img')
    img.src = `assets/${imgName}.png`
    img.classList.add('img-part')

    return img
}

function createDivOption(callback, isKill) {
    const div = document.createElement('div')
    div.classList.add('walk-option')

    if (isKill) {
        div.classList.add('kill-option')
    }

    div.classList.add('cursor')
    div.setAttribute('play-option', '')

    div.onclick = (e) => callback(e.target.parentNode)

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

    this.turn = null
    this.gameRows = null
    this.rivals = null
    
    this.isRival = (elementId) => 
        this.rivals
        .find(rival => rival.square && rival.square.element.id == elementId)
    this.clearSquare = () => {
        this.square.element.classList.remove('cursor');
        this.square.element.innerHTML = ''
        this.square.element.onclick = null
    }
    this.setSquare = (_square) => {
        _square.element.classList.add('cursor')
        _square.element.appendChild(this.img)
        
        this.square = _square
    }
    this.move = (element) => {
        removeDivOptions()
        
        const [column, row] = this.square.decodeId(element.id)
        const chessSquare = new ChessSquare(column, row, element)

        this.clearSquare()
        this.setSquare(chessSquare)
        this.square.element.onclick = this.walking

        this.turn(this.square)
    }
    this.killRival = (element) => {
        const rival = this.rivals.find(rival => rival.square && rival.square.element.id == element.id)
        const deadZoneId = (this.color == 'b') ? '#player2' : '#player1'
        const deadZone = document.querySelector(deadZoneId)

        rival.square = null
        deadZone.appendChild(rival.img)

        this.move(element)
    }
    this.setSquare(square)
}

// Torre
function Tower(square, color = 'b') {
    Part.call(this, square, `${color}_torre`) // Herança

    this.color = color

    this.walking = () => {
        if (!this.turn) return

        const column = this.square.column
        const row = this.square.row

        removeDivOptions()

        const markOptions = () => {
            const mark = (option) => {
                const markOption = createDivOption(this.move)
                
                option.appendChild( markOption )
            }
            const horizontal = () => {
                const scanner = (direction) => {
                    let index = column + (1 * direction)
                    let option = this.gameRows[row][index]

                    while(option && option.element && !option.element.children.length) {
                        mark(option.element)

                        index += (1 * direction)
                        option = this.gameRows[row][index]
                    } 
                }
                // Left
                scanner(-1)
                // Right
                scanner(1) 
            }
            const vertical = () => {
                const scanner = (direction) => {
                    let index = row + (1 * direction)
                    if (this.gameRows[index]) {
                        let option = this.gameRows[index][column]
    
                        while(option && option.element && !option.element.children.length) {
                            mark(option.element)
    
                            index += (1 * direction)
                            if (this.gameRows[index]) {
                                option = this.gameRows[index][column]
                            } else {
                                option = null
                            }
                        } 
                    }
                }
                // Left
                scanner(-1)
                // Right
                scanner(1) 
            }

            horizontal()
            vertical()
        }
        
        markOptions()
    }

    this.square.element.onclick = this.walking
}

// Cavalo
function Horse(square, color = 'b') {
    Part.call(this, square, `${color}_cavalo`) // Herança

    this.color = color

    this.walking = () => {
        if (!this.turn) return

        const column = this.square.column
        const row = this.square.row

        removeDivOptions()

        const markOptions = () => {
            const mark = (option) => {
                const markOption = createDivOption(this.move)
                
                option.appendChild( markOption )
            }
            const vertical = () => {
                const scanner = (orientation, side) => {
                    if (this.gameRows[row + side] &&
                        this.gameRows[row + side][column + orientation] &&
                        !this.gameRows[row + side][column + orientation].element.children.length) {
                        const element = this.gameRows[row + side][column + orientation].element
                        mark(element)
                    }
                }
                scanner(2, 1)
                scanner(2, -1)
                scanner(-2, 1)
                scanner(-2, -1)
            }
            const horizontal = () => {
                const scanner = (orientation, side) => {
                    if (this.gameRows[row + orientation] &&
                        this.gameRows[row + orientation][column + side] &&
                        !this.gameRows[row + orientation][column + side].element.children.length) {
                        const element = this.gameRows[row + orientation][column + side].element
                        mark(element)
                    }
                }
                scanner(2, 1)
                scanner(2, -1)
                scanner(-2, 1)
                scanner(-2, -1)
            }

            vertical()
            horizontal()
        }

        markOptions()
    }

    this.square.element.onclick = this.walking
}

// Bispo
function Bishp(square, color = 'b') {
    Part.call(this, square, `${color}_bispo`) // Herança

    this.color = color

    this.walking = () => {
        if (!this.turn) return
    
        const column = this.square.column
        const row = this.square.row
    
        removeDivOptions()

        const markOptions = () => {
            const mark = (option) => {
                const markOption = createDivOption(this.move)
                
                option.appendChild( markOption )
            }
            const killOptions = (option) => {
                if (option && this.isRival(option.id)) {
                    const markOption = createDivOption(this.killRival, true)
                    option.appendChild( markOption )
                }
            }
            const diagonal = (direction, sense) => {
                let indexRow = row + (1 * sense)
                let indexColumn = column + (1 * direction)
                const isValidSquare = () => this.gameRows[indexRow] && this.gameRows[indexRow][indexColumn]

                if (isValidSquare()) {
                    let option = this.gameRows[indexRow][indexColumn]

                    while(option && option.element && !option.element.children.length) {
                        mark(option.element)

                        indexRow += (1 * sense)
                        indexColumn += (1 * direction)
                        
                        if (isValidSquare()) {
                            option = this.gameRows[indexRow][indexColumn]
                        }
                    }

                    killOptions(option.element)
                }
            }

            // Superior
            diagonal(1, -1)
            diagonal(1, 1)
            // Inferior
            diagonal(-1, -1)
            diagonal(-1, 1)
        }
        markOptions()
    }

    this.square.element.onclick = this.walking
}

// Rei
function King(square, color = 'b') {
    Part.call(this, square, `${color}_rei`) // Herança

    this.color = color

    this.walking = () => {
        if (!this.turn) return
    
        const column = this.square.column
        const row = this.square.row
    
        removeDivOptions()

        const markOptions = () => {
            const mark = (option) => {
                const markOption = createDivOption(this.move)
                
                option.appendChild( markOption )
            }
            const killOptions = (option) => {
                if (option && this.isRival(option.id)) {
                    const markOption = createDivOption(this.killRival, true)
                    option.appendChild( markOption )
                }
            }
            const horizontal = () => {
                const scanner = (orientation) => {
                    if (this.gameRows[row][column + orientation]) {
                        if (!this.gameRows[row][column + orientation].element.children.length) {
                            const element = this.gameRows[row][column + orientation].element
                            mark(element)
                        } else {
                            killOptions(this.gameRows[row][column + orientation].element)
                        }
                    }
                }
                scanner(1)
                scanner(-1)
            }
            const vertical = () => {
                const scanner = (orientation) => {
                    if (this.gameRows[row + orientation] &&
                        this.gameRows[row + orientation][column]) {
                        if (!this.gameRows[row + orientation][column].element.children.length) {
                            const element = this.gameRows[row + orientation][column].element
                            mark(element)
                        } else {
                            killOptions(this.gameRows[row + orientation][column].element)
                        }
                    }
                }
                scanner(1)
                scanner(-1)
            }
            const diagonal = (direction, sense) => {
                let indexRow = row + (1 * sense)
                let indexColumn = column + (1 * direction)

                if (this.gameRows[indexRow] &&
                    this.gameRows[indexRow][indexColumn]) {
                    if (!this.gameRows[indexRow][indexColumn].element.children.length) {
                        const element = this.gameRows[indexRow][indexColumn].element
                        mark(element)
                    } else {
                        killOptions(this.gameRows[indexRow][indexColumn].element)
                    }
                }
            }

            vertical()
            horizontal()

            // Superior
            diagonal(1, -1)
            diagonal(1, 1)
            // Inferior
            diagonal(-1, -1)
            diagonal(-1, 1)
        }

        markOptions()
    }

    this.square.element.onclick = this.walking
}

// Rainha
function Queen(square, color = 'b') {
    Part.call(this, square, `${color}_rainha`) // Herança

    this.color = color

    this.walking = () => {
        if (!this.turn) return
    
        const column = this.square.column
        const row = this.square.row
    
        removeDivOptions()

        const markOptions = () => {
            const mark = (option) => {
                const markOption = createDivOption(this.move)
                
                option.appendChild( markOption )
            }
            const killOptions = (option) => {
                if (option && this.isRival(option.id)) {
                    const markOption = createDivOption(this.killRival, true)
                    option.appendChild( markOption )
                }
            }
            const diagonal = (direction, sense) => {
                let indexRow = row + (1 * sense)
                let indexColumn = column + (1 * direction)
                const isValidSquare = () => this.gameRows[indexRow] && this.gameRows[indexRow][indexColumn]

                if (isValidSquare()) {
                    let option = this.gameRows[indexRow][indexColumn]

                    while(option && option.element && !option.element.children.length) {
                        mark(option.element)

                        indexRow += (1 * sense)
                        indexColumn += (1 * direction)
                        
                        if (isValidSquare()) {
                            option = this.gameRows[indexRow][indexColumn]
                        }
                    }
                    killOptions(option.element)
                }
            }
            const horizontal = () => {
                const scanner = (direction) => {
                    let index = column + (1 * direction)
                    let option = this.gameRows[row][index]

                    while(option && option.element && !option.element.children.length) {
                        mark(option.element)

                        index += (1 * direction)
                        option = this.gameRows[row][index]
                    }
                    killOptions(option.element)
                }
                // Left
                scanner(-1)
                // Right
                scanner(1) 
            }
            const vertical = () => {
                const scanner = (direction) => {
                    let index = row + (1 * direction)
                    if (this.gameRows[index]) {
                        let option = this.gameRows[index][column]
    
                        while(option && option.element && !option.element.children.length) {
                            mark(option.element)
    
                            index += (1 * direction)
                            if (this.gameRows[index]) {
                                option = this.gameRows[index][column]
                            } else {
                                option = null
                            }
                        }
                        killOptions(option.element)
                    }
                }
                // Left
                scanner(-1)
                // Right
                scanner(1) 
            }

            horizontal()
            vertical()

            // Superior
            diagonal(1, -1)
            diagonal(1, 1)
            // Inferior
            diagonal(-1, -1)
            diagonal(-1, 1)
        }
        markOptions()
    }

    this.square.element.onclick = this.walking
}

// Peão
function Pawn(square, color = 'b') {
    Part.call(this, square, `${color}_peao`) // Herança
    
    this.isFirstStep = true
    this.color = color

    this.walking = () => {
        if (!this.turn) return

        const column = this.square.column
        const row = this.square.row
        
        removeDivOptions()
        
        const markOptions = (steps) => {
            const killOptions = (sense) => {
                if (this.gameRows[newRow] &&
                    this.gameRows[newRow][column + sense] &&
                    this.gameRows[newRow][column + sense].element.children.length
                    ) {
                    const option = this.gameRows[newRow][column + sense].element
    
                    if (this.isRival(option.id)) {
                        const markOption = createDivOption(this.killRival, true)
                        option.appendChild( markOption )
                    }
                }
            }

            let newRow = 0
            for (let index = 1; index <= steps; index++) {
                const direction = (color == 'b')? 1 : -1
                newRow = row  + (direction * index) 

                if (this.gameRows[newRow] && this.gameRows[newRow][column]) {
                    const option = this.gameRows[newRow][column].element
    
                    if (!option.children.length) {
                        const markOption = createDivOption(this.move)
                        option.appendChild( markOption )
                    }
                }
            }
            killOptions(1)
            killOptions(-1)
        }

        if (this.isFirstStep) {
            markOptions(2)
            this.isFirstStep = false
        } else {
            markOptions(1)
        }
    }
    this.square.element.onclick = this.walking
}
