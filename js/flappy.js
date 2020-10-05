function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Pipe(reverse = false) {
    this.element = newElement('div', 'pipe')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')

    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

function PairOfPipes(height, aperture, x) {
    this.element = newElement('div', 'pair-of-pipes')

    this.higher = new Pipe(true)
    this.bottom = new Pipe(false)

    this.element.appendChild(this.higher.element)
    this.element.appendChild(this.bottom.element)

    this.randomAperture = () => {
        const topHeight = Math.random() * (height - aperture)
        const bottomHeight = height - aperture - topHeight
        this.higher.setHeight(topHeight)
        this.bottom.setHeight(bottomHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.randomAperture()
    this.setX(x)

}

function Pipes(height, width, aperture, space, notifyPoint) {
    this.pairs = [
        new PairOfPipes(height, aperture, width),
        new PairOfPipes(height, aperture, width + space),
        new PairOfPipes(height, aperture, width + space * 2),
        new PairOfPipes(height, aperture, width + space * 3)
    ]

    const displacement = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            //when the element leaves the game area
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.randomAperture()
            }

            const middle = width / 2
            const crossMiddle = pair.getX() + displacement >= middle &&
                pair.getX() < middle
            if (crossMiddle) notifyPoint()
        })
    }
}

function Bird(gameHeight) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'images/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientWidth

        if (newY <= 0) {
            this.setY(0)
        } else if (newY > maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2)
}

function overlap(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left &&
        b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top &&
        b.top + b.height >= a.top
    return horizontal && vertical
}

function collision(bird, pipes) {
    let collision = false

    pipes.pairs.forEach(PairOfPipes => {
        if (!collision) {
            const higher = PairOfPipes.higher.element
            const bottom = PairOfPipes.bottom.element
            collision = overlap(bird.element, higher) ||
                overlap(bird.element, bottom)
        }
    })

    return collision
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.scoreUpdate = score => {
        this.element.innerHTML = score
    }
    this.scoreUpdate(0)
}

function FlappyBird() {
    let score = 0

    const gameArea = document.querySelector('[flappy]')
    const gameHeight = gameArea.clientHeight
    const gameWidth = gameArea.clientWidth

    const progress = new Progress()
    const pipes = new Pipes(gameHeight, gameWidth, 200, 400, () => progress.scoreUpdate(++score))
    const bird = new Bird(gameHeight)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    pipes.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const temp = setInterval(() => {
            pipes.animate()
            bird.animate()

            if (collision(bird, pipes)) {
                clearInterval(temp)
            }
        }, 20)
    }
}

new FlappyBird().start()