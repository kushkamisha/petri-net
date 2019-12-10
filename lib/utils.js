'use strict'

const fs = require('fs')
const path = require('path')
const getNet = require('./net')
const config = require('../data/config')

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
            console.log('\n\n\n\n\nNET DATA!!!!!!!!!!!!')
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
        case 'net-next':
            if (timestamp)
                netFileName = path.join(netDirName, 'forClient', `${timestamp}.json`)
            const nextData = net.next();
            [state, time] = nextData
            conn.send(JSON.stringify({ type: 'net-next', state, time }))
            break
        case 'net-launch':
            if (timestamp)
                netFileName = path.join(netDirName, 'forClient', `${timestamp}.json`);
            [state, time] = net.launch()
            conn.send(JSON.stringify({ type: 'net-next', state, time }))
            break
        case 'iterations':
            iterations = msg.data ? msg.data : iterations
            console.log({ iterations })
            break
        case 'net-create':
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
