'use strict'

function askNetData() {
    const timestamp = getCookie('timestamp')
    socket.send(JSON.stringify({ type: 'net-data', ...timestamp && { timestamp } }))
}

function netExecute() {
    const timestamp = getCookie('timestamp')
    socket.send(JSON.stringify({ type: 'launch', ...timestamp && {timestamp} }))
}

function netNext() {
    const timestamp = getCookie('timestamp')
    socket.send(JSON.stringify({ type: 'next', ...timestamp && { timestamp } }))
}

function saveNetLocally() {
    const net = window.cy.json().elements
    const filename = 'PetriNet'
    var blob = new Blob([JSON.stringify(net)], { type: 'text/json;charset=utf-8' })
    saveAs(blob, `${filename}.json`)
}

function loadFromFile() {
    const input = document.getElementById('upload-net')
    input.addEventListener('change', e => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsText(file, 'utf-8')

        reader.onload = e => {
            // Draw a new net
            draw(JSON.parse(e.target.result))

            // Save the file to the server & set a cookie
            const timestamp = Date.now()
            socket.send(JSON.stringify({
                type: 'recreate',
                timestamp,
                data: e.target.result
            }))
            setCookie('timestamp', timestamp, 7)
        }
    })

    input.click()
}

function processEvent({ data }) {
    const msg = JSON.parse(data)
    const time = document.getElementById('time')
    let net = {}
    
    switch(msg.type) {
        case 'net-data':
            net = JSON.parse(msg.data)
            draw(net)
            break
        case 'net-next':
            const state = msg.state
            net = updateNet(state)
            draw(net)
            time.innerText = msg.time
            break
    }
}

function updateNetOnServer() {
    const timestamp = getCookie('timestamp')
    const net = window.cy.json().elements
    const data = JSON.stringify(net)

    socket.send(JSON.stringify({
        type: 'recreate',
        timestamp,
        data
    }))
}

function updateNet(state) {
    const net = window.cy.json().elements
    for (const node of net.nodes) {
        const id = node.data.id
        // If this is a place id
        if (state[id] !== undefined) {
            if (state[id] === 0) delete node.data.markers
            else node.data.markers = state[id]
        }
    }
    return net
}

/**
 * Set a cookie in the user's browser
 * @param {string} name - Name of the cookie
 * @param {string} value - Value of the cookie
 * @param {integer} days2live - Number of days before the cookie expires
 */
function setCookie(name, value, days2live) {
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
