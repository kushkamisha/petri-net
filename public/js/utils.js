'use strict'


function isArc(trg) { return trg.isEdge() }

function isPlace(trg) { return trg.data('type') === 'place' }

function isTransition(trg) { return trg.data('type') === 'transition' }

function isBackground(trg) { return trg === window.cy }

function isArcValid(src, trg) {
    return isTransition(src) && isPlace(trg) || isPlace(src) && isTransition(trg)
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
        wUACAPS: 1062,

        e: 101,
        eUA: 1091,
        eCAPS: 69,
        eUACAPS: 1059
    }

    switch (keyCode) {
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
        case key.e:
        case key.eUA:
        case key.eCAPS:
        case key.eUACAPS:
            window.pressedKey = 'e'
            window.eh.enable()
            window.eh.enableDrawMode()
            break
    }
}
