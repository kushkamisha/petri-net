'use strict'

function askNetData() {
    const timestamp = getCookie('timestamp')
    socket.send(JSON.stringify({ type: 'net-data', ...timestamp && { timestamp } }))
}

function netExecute() {
    const timestamp = getCookie('timestamp')
    socket.send(JSON.stringify({ type: 'net-launch', ...timestamp && {timestamp} }))
}

function netNext() {
    if (window.netIsUnsaved) saveInWeb()
    const timestamp = getCookie('timestamp')
    console.log('net-next sent to server props:')
    console.log(window.props)
    socket.send(JSON.stringify({
        type: 'net-next',
        ...timestamp && { timestamp },
        props: window.props
    }))
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
            let timestamp = getOrSetTimestampCookie()
            socket.send(JSON.stringify({
                type: 'net-create',
                timestamp,
                data: e.target.result
            }))
            setCookie('timestamp', timestamp)
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
            net = JSON.parse(msg.data.network)
            window.props = msg.data.props
            console.log('net-data response props:')
            console.log(window.props)
            draw(net)
            break
        case 'net-next':
            const state = msg.props.netState
            window.props = msg.props
            console.log('net-next received from server props:')
            console.log(window.props)
            net = updateNet(state)
            draw(net)
            time.innerText = msg.time
            break
    }
}

function saveInWeb() {
    let timestamp = getOrSetTimestampCookie()
    const net = window.cy.json().elements
    const data = JSON.stringify(net)

    socket.send(JSON.stringify({
        type: 'net-create',
        timestamp,
        data
    }))
    window.netIsUnsaved = false
}

function updateNet(state) {
    const net = window.cy.json().elements
    if (!net.nodes) return
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

