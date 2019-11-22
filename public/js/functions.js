'use strict'

function saveNet() {
    const net = window.cy.json().elements
    const filename = 'PetriNet'
    var blob = new Blob([JSON.stringify(net)], { type: 'text/json;charset=utf-8' })
    saveAs(blob, `${filename}.json`)
}

function loadFromFile() {
    const input = document.createElement('input')
    input.type = 'file'

    input.onchange = e => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsText(file, 'utf-8')

        reader.onload = e => {
            draw(JSON.parse(e.target.result))
            socket.send(JSON.stringify({
                type: 'recreate',
                data: e.target.result
            }))
        }
    }

    input.click()
}
