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
        eUACAPS: 1059,

        r: 114,
        rUA: 1082,
        rCAPS: 82,
        rUACAPS: 1050,

        backspace: 8,
        delete: 46
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
        case key.r:
        case key.rUA:
        case key.rCAPS:
        case key.rUACAPS:
            window.pressedKey = 'r'
            break
        case key.backspace:
        case key.delete:
            window.pressedKey = 'backspace'
            console.log('backspace')
            const elems = cy.$(':selected')
            elems.forEach(elem => cy.remove(elem))
            window.netIsUnsaved = true
            break
    }
}

/**
 * Get a timestamp cookie from the user's browser or set it if it doesn't exist
 * @param {string} name - Name of the cookie
 * @param {integer} days2live - Number of days before the cookie expires
 */
function getOrSetTimestampCookie(days2live = 7) {
    const name = 'timestamp'
    let timestamp = getCookie(name)
    if (!timestamp) {
        timestamp = Date.now()
        setCookie(name, timestamp, days2live)
    }

    return timestamp
}

/**
 * Set a cookie in the user's browser
 * @param {string} name - Name of the cookie
 * @param {string} value - Value of the cookie
 * @param {integer} days2live - Number of days before the cookie expires
 */
function setCookie(name, value, days2live = 7) {
    const d = new Date()
    d.setTime(d.getTime() + days2live * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/`
}

/**
 * Get a cookie from the user's browser
 * @param {string} name - Name of the cookie
 */
function getCookie(name) {
    name = `${name}=`
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(';')

    for (let i = 0; i < ca.length; i++) {
        const c = ca[i].trim()
        if (c.indexOf(name) === 0) return c.substring(name.length)
    }
    return ''
}
