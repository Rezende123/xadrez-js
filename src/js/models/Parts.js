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

// Peças, a função pai que todas as outras funções vão herdar
function Part(square, imgName) {
    this.img = createPartImage(imgName)
    this.imgName = imgName

    this.turn = null
    this.gameRows = null
    this.rivals = null
    this.isCheck = false
    
    this.isRival = (elementId) => 
        this.rivals
        .find(rival => rival.square && rival.square.element.id == elementId)
    
    this.walkOptions = (option) => {
        if (!this.isCheck ||
            (
                this.isCheck &&
                option.getAttribute('save-king') != null &&
                this.__proto__.constructor.name != 'King'
            ) || 
            (
                this.isCheck &&
                option.getAttribute('save-king') == null &&
                this.__proto__.constructor.name == 'King'
            )
        ) {
            const markOption = createDivOption(this.move)
            
            option.appendChild( markOption )
        }
    }
    this.killOptions = (option, markedWalkOptions) => {
        if (
            option && option.element && this.isRival(option.element.id) &&
            (!this.isCheck || (this.isCheck && option.element.getAttribute('save-king') == 'killer'))
        ) {

            if (this.turn == 'test' && markedWalkOptions) { // Ocorre apenas na busca do rei
                markedWalkOptions.forEach(marked => marked.setAttribute('save-king', 'kill-steps'))
            }

            const markOption = createDivOption(this.killRival, true)
            option.element.appendChild( markOption )
            option.element.setAttribute('kill-risk', '')
        }
    }
    this.removeDivOptions = () => {
        const options = Array.from(document.querySelectorAll('[play-option]'))
        options.forEach(option => option.remove())
    }
    this.clearSquare = () => {
        this.square.element.removeAttribute('kill-risk')
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
        this.removeDivOptions()
        
        const [column, row] = this.square.decodeId(element.id)
        const chessSquare = new ChessSquare(column, row, element)

        this.clearSquare()
        this.setSquare(chessSquare)
        this.square.element.onclick = this.walking

        this.isFirstStep = false

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

        this.removeDivOptions()

        const markOptions = () => {
            const horizontal = () => {
                const scanner = (direction) => {
                    let index = column + (1 * direction)
                    let option = this.gameRows[row][index]
                    let markedWalkOptions = []

                    while(option && option.element && !option.element.children.length) {
                        this.walkOptions(option.element)
                        markedWalkOptions.push(option.element)

                        index += (1 * direction)
                        option = this.gameRows[row][index]
                    }
                    this.killOptions(option, markedWalkOptions)
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
                        let markedWalkOptions = []
    
                        while(option && option.element && !option.element.children.length) {
                            this.walkOptions(option.element)
                            markedWalkOptions.push(option.element)

                            index += (1 * direction)
                            if (this.gameRows[index]) {
                                option = this.gameRows[index][column]
                            } else {
                                option = null
                            }
                        }
                        this.killOptions(option, markedWalkOptions)
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

        this.removeDivOptions()

        const markOptions = () => {
            const vertical = () => {
                const scanner = (orientation, side) => {
                    if (this.gameRows[row + side] &&
                        this.gameRows[row + side][column + orientation]) {
                        const option = this.gameRows[row + side][column + orientation]

                        if (!option.element.children.length) {
                            const element = option.element
                            this.walkOptions(element)
                        } else {
                            this.killOptions(option)
                        }
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
                        this.gameRows[row + orientation][column + side]) {
                        const option = this.gameRows[row + orientation][column + side]

                        if (!option.element.children.length) {
                            const element = option.element
                            this.walkOptions(element)
                        } else {
                            this.killOptions(option)
                        }
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
    
        this.removeDivOptions()

        const markOptions = () => {
            const diagonal = (direction, sense) => {
                let indexRow = row + (1 * sense)
                let indexColumn = column + (1 * direction)
                const isValidSquare = () =>
                    this.gameRows[indexRow] && this.gameRows[indexRow][indexColumn]

                if (isValidSquare()) {
                    let option = this.gameRows[indexRow][indexColumn]
                    let markedWalkOptions = []

                    while(option && option.element && !option.element.children.length) {
                        this.walkOptions(option.element)
                        markedWalkOptions.push(option.element)

                        indexRow += (1 * sense)
                        indexColumn += (1 * direction)
                        
                        if (isValidSquare()) {
                            option = this.gameRows[indexRow][indexColumn]
                        } else {
                            option = null
                        }
                    }

                    this.killOptions(option, markedWalkOptions)
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
    
        this.removeDivOptions()

        const markOptions = () => {
            const horizontal = () => {
                const scanner = (orientation) => {
                    if (this.gameRows[row][column + orientation]) {
                        const option = this.gameRows[row][column + orientation]

                        if (!option.element.children.length) {
                            const element = option.element
                            this.walkOptions(element)
                        } else {
                            this.killOptions(option)
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
                        const option = this.gameRows[row + orientation][column]

                        if (!option.element.children.length) {
                            const element = option.element
                            this.walkOptions(element)
                        } else {
                            this.killOptions(option)
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
                    const option = this.gameRows[indexRow][indexColumn]

                    if (!option.element.children.length) {
                        const element = option.element
                        this.walkOptions(element)
                    } else {
                        this.killOptions(option)
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
    
        this.removeDivOptions()

        const markOptions = () => {
            const diagonal = (direction, sense) => {
                let indexRow = row + (1 * sense)
                let indexColumn = column + (1 * direction)
                const isValidSquare = () =>
                    this.gameRows[indexRow] && this.gameRows[indexRow][indexColumn]

                if (isValidSquare()) {
                    let option = this.gameRows[indexRow][indexColumn]
                    let markedWalkOptions = []

                    while(option && option.element && !option.element.children.length) {
                        this.walkOptions(option.element)
                        markedWalkOptions.push(option.element)

                        indexRow += (1 * sense)
                        indexColumn += (1 * direction)
                        
                        if (isValidSquare()) {
                            option = this.gameRows[indexRow][indexColumn]
                        } else {
                            option = null
                        }
                    }
                    this.killOptions(option, markedWalkOptions)
                }
            }
            const horizontal = () => {
                const scanner = (direction) => {
                    let index = column + (1 * direction)
                    let option = this.gameRows[row][index]
                    let markedWalkOptions = []

                    while(option && option.element && !option.element.children.length) {
                        this.walkOptions(option.element)
                        markedWalkOptions.push(option.element)

                        index += (1 * direction)
                        option = this.gameRows[row][index]
                    }
                    this.killOptions(option, markedWalkOptions)
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
                        let markedWalkOptions = []
    
                        while(option && option.element && !option.element.children.length) {
                            this.walkOptions(option.element)
                            markedWalkOptions.push(option.element)
    
                            index += (1 * direction)
                            if (this.gameRows[index]) {
                                option = this.gameRows[index][column]
                            } else {
                                option = null
                            }
                        }
                        this.killOptions(option, markedWalkOptions)
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
        
        this.removeDivOptions()
        
        const markOptions = (steps) => {
            const selectKillOptions = (sense) => {
                if (this.gameRows[newRow] &&
                    this.gameRows[newRow][column + sense] &&
                    this.gameRows[newRow][column + sense].element.children.length
                    ) {
                    const option = this.gameRows[newRow][column + sense]
    
                    this.killOptions(option)
                }
            }

            let newRow = 0
            for (let index = 1; index <= steps; index++) {
                const direction = (color == 'b')? 1 : -1
                newRow = row  + (direction * index) 

                if (this.gameRows[newRow] && this.gameRows[newRow][column]) {
                    const option = this.gameRows[newRow][column].element
    
                    if (!option.children.length) {
                        this.walkOptions(option)
                    }
                }

                selectKillOptions(1)
                selectKillOptions(-1)
            }
        }

        if (this.isFirstStep) {
            markOptions(2)
        } else {
            markOptions(1)
        }
    }
    this.square.element.onclick = this.walking
}
