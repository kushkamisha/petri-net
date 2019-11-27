'use strict'

const fs = require('fs')
const path = require('path')
const getNet = require('./net')
const config = require('../data/config')
const { rebuildClientData } = require('../petri-net/utils/netUtils')


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

    const netDirName = path.join(__dirname, '..', 'data')
    let netFileName = path.join(netDirName, 'server', config.filename)
    let net = getNet()
    let state = {}
    const timestamp = msg.timestamp

    switch (msg.type) {
        case 'net-data':
            if (timestamp) {
                const clientPath = path.join(netDirName, 'client', `${timestamp}.json`)
                const serverPath = path.join(netDirName, 'server', `${timestamp}.json`)
                fs.copyFileSync(clientPath, serverPath)
                netFileName = path.join(netDirName, 'server', `${timestamp}.json`)
            }
            netFileName = path.join(netDirName, 'server', `${timestamp}.json`)
            const clientNetwork = fs.readFileSync(netFileName, 'utf8')
            conn.send(clientNetwork)
            net = getNet(netFileName, true)
            break
        case 'next':
            if (timestamp)
                netFileName = path.join(netDirName, 'server', `${timestamp}.json`)
            state = net.next()
            changeAndSend(netFileName, state, conn)
            break
        case 'launch':
            if (timestamp)
                netFileName = path.join(netDirName, 'server', `${timestamp}.json`)
            state = net.launch()
            changeAndSend(netFileName, state, conn)
            break
        case 'iterations':
            iterations = msg.data ? msg.data : iterations
            console.log({ iterations })
            break
        case 'recreate':
            const filename = `${timestamp}.json`
            const data = msg.data
            const clientPath = path.join(netDirName, 'client', filename)
            const serverPath = path.join(netDirName, 'server', filename)

            fs.writeFileSync(clientPath, data, { flag: 'w' })
            fs.writeFileSync(serverPath, data, { flag: 'w' })

            net = getNet(serverPath, true)
            break
        default:
            console.log(`Websocket msg: ${msg}`)
    }
}

module.exports = {
    processMsgFromClient,
}
