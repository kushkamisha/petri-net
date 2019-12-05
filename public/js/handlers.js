'use strict'

function handleClicks() {
    window.cy.on('tap', 'node', cyHandler)
    window.cy.on('tap', 'edge', cyHandler)

    window.cy.on('tap', e => {
        // Check is click was on the background
        if (e.target !== window.cy) return

        if (window.pressedKey === 'q')
            cy.add([{
                group: 'nodes',
                data: {
                    // id: 'testid',
                    type: 'place'
                },
                renderedPosition: {
                    x: e.renderedPosition.x,
                    y: e.renderedPosition.y,
                },
            }])
        else if (window.pressedKey === 'w')
            cy.add([{
                group: 'nodes',
                data: {
                    // id: 'testid',
                    type: 'transition'
                },
                renderedPosition: {
                    x: e.renderedPosition.x,
                    y: e.renderedPosition.y,
                },
            }])

        console.log(cy.json().elements)
    })

    window.addEventListener('keypress', keyHandler, false)
    window.addEventListener('keyup', () => window.pressedKey = undefined)
}

function cyHandler(event) {
    // const type = event.target === window.cy ?
    //     'background' :
    //     event.target.data('type')
    // console.log({ type })
    const type = event.target.data('type')

    switch (type) {
        case 'place':
            break
        case 'transition':
            const id = event.target.id()
            transitionHandler(id)
            break
        default:
            // arc
            break
    }
}

function keyHandler(e) {
    console.log(e.keyCode)
    const keyCode = e.keyCode
    const key = {
        q: 113,
        qUA: 1081,
        qCAPS: 81,
        qUACAPS: 1049,
        w: 119,
        wUA: 1094,
        wCAPS: 87,
        wUACAPS: 1062
    }
    
    switch(keyCode) {
        case key.q:
        case key.qUA:
        case key.qCAPS:
        case key.qUACAPS:
            window.pressedKey = 'q'
            break
        case key.w:
        case key.wUA:
        case key.wCAPS:
        case key.wUACAPS:
            window.pressedKey = 'w'
            break
    }
}

function transitionHandler(id) {
    let delay = prompt('Enter a time delay for the transition', 1)
    if (delay == null) return;
    while (isNaN(parseInt(delay)))
        delay = prompt(
            'The delay must be an integer above zero. Please, try again',
            1)
    delay = parseInt(delay)

    const net = window.cy.json().elements
    const transition = net.nodes.filter(x => x.data.id === id)[0]
    transition.data.delay = delay

    // update an image of the net
    draw(net)

    // update the file on server
    const timestamp = getCookie('timestamp')
    const data = JSON.stringify(net)
    socket.send(JSON.stringify({
        type: 'recreate',
        timestamp,
        data
    }))
}