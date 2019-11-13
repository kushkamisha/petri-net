'use strict'

const fs = require('fs')
const { createNet } = require('../petri-net')
const { rebuildClientData } = require('../petri-net/utils/netUtils')

const netFileName = `${__dirname}/../data/client-data.json`
const net = createNet(netFileName, 5)

const getPetriNetForClient = filename => {
    const rawdata = fs.readFileSync(filename)
    return JSON.parse(rawdata)
}

const changeAndSend = (filename, state, conn) => {
    console.log({ state })

    rebuildClientData(filename, state)
    const data = getPetriNetForClient(filename)

    conn.send(JSON.stringify(data))
}

const processMsgFromClient = (msg, conn) => {

    let state = {}

    switch (msg) {
        case 'net-data':
            const clientNetwork = fs.readFileSync(netFileName, 'utf-8')
            conn.send(clientNetwork)
            break
        case 'next':
            state = net.next()
            changeAndSend(netFileName, state, conn)
            break
        case 'launch':
            state = net.launch()
            changeAndSend(netFileName, state, conn)
            break
        default:
            console.log(`Websocket msg: ${msg}`)
    }
}

module.exports = {
    processMsgFromClient,
}
