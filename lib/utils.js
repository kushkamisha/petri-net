'use strict'

const fs = require('fs')
const getNet = require('./net')
const config = require('./config')
const { rebuildClientData } = require('../petri-net/utils/netUtils')

let netFile = `${__dirname}/../data/client-data.json`

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
    msg = JSON.parse(msg)

    const netDirName = `${__dirname}/../data`
    const netFileName = `${netDirName}/client-data.json`
    let net = getNet()
    let state = {}

    switch (msg.type) {
        case 'net-data':
            const clientNetwork = fs.readFileSync(netFileName, 'utf-8')
            conn.send(clientNetwork)
            break
        case 'next':
            console.log('next')
            state = net.next()
            changeAndSend(netFileName, state, conn)
            break
        case 'launch':
            state = net.launch()
            changeAndSend(netFileName, state, conn)
            break
        case 'iterations':
            iterations = msg.data ? msg.data : iterations
            console.log({ iterations })
            break
        case 'recreate':
            const filename = msg.data.filename
            const data = msg.data.data
            const path = `${netDirName}/${filename}`

            fs.writeFileSync(path, data, { flag: 'w' })
            netFile = path
            net = getNet(path, true)
            break
        default:
            console.log(`Websocket msg: ${msg}`)
    }
}

module.exports = {
    processMsgFromClient,
}
