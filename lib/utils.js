'use strict'

const fs = require('fs')
const path = require('path')
const getNet = require('./net')
const config = require('../data/config')
const { updClientNet } = require('../petri-net/utils/net-utils')


const getPetriNetForClient = filename => {
    const rawdata = fs.readFileSync(filename)
    return JSON.parse(rawdata)
}

const changeAndSend = (filename, data, conn) => {
    const [state, time] = data

    updClientNet(filename, state)
    const fileData = getPetriNetForClient(filename)

    conn.send(JSON.stringify({
        type: 'net-next',
        data: fileData,
        time
    }))
}

const processMsgFromClient = (msg, conn) => {
    msg = JSON.parse(msg)

    const netDirName = path.join(__dirname, '..', 'data')
    let netFileName = path.join(netDirName, 'forClient', config.filename)
    let net = getNet()
    let state = {}
    let time = 0
    const timestamp = msg.timestamp

    switch (msg.type) {
        case 'net-data':
            if (timestamp) {
                const clientPath = path.join(netDirName, 'client', `${timestamp}.json`)
                const serverPath = path.join(netDirName, 'forClient', `${timestamp}.json`)
                fs.copyFileSync(clientPath, serverPath)
                netFileName = path.join(netDirName, 'forClient', `${timestamp}.json`)
            }
            const clientNetwork = fs.readFileSync(netFileName, 'utf8')
            conn.send(JSON.stringify({
                type: 'net-data',
                data: clientNetwork
            }))
            net = getNet(netFileName, true)
            break
        case 'next':
            if (timestamp)
                netFileName = path.join(netDirName, 'forClient', `${timestamp}.json`)
            const nextData = net.next();
            [state, time] = nextData
            // changeAndSend(netFileName, nextData, conn)
            conn.send(JSON.stringify({ type: 'net-next', state, time }))
            break
        case 'launch':
            if (timestamp)
                netFileName = path.join(netDirName, 'forClient', `${timestamp}.json`);
            [state, time] = net.launch()
            // changeAndSend(netFileName, state, conn)
            conn.send(JSON.stringify({ type: 'net-next', state, time }))
            break
        case 'iterations':
            iterations = msg.data ? msg.data : iterations
            console.log({ iterations })
            break
        case 'recreate':
            const filename = `${timestamp}.json`
            const data = msg.data
            const clientPath = path.join(netDirName, 'client', filename)
            const serverPath = path.join(netDirName, 'forClient', filename)

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
