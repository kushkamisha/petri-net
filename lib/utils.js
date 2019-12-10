'use strict'

const fs = require('fs')
const path = require('path')
// const { getNet } = require('../petri-net')
const { createNet } = require('../petri-net')
const config = require('../data/config')

const processMsgFromClient = (msg, conn) => {
    msg = JSON.parse(msg)

    const netDirName = path.join(__dirname, '..', 'data')
    let netFileName = path.join(netDirName, 'client', config.filename)
    let netServerFileName = path.join(netDirName, 'server', config.filename)
    // let net = getNet(netFileName, false, netServerFileName)
    let net = []
    let state = {}
    let props = {}
    let time = 0
    const timestamp = msg.timestamp

    switch (msg.type) {
        case 'net-data':
            console.log('net-data')
            if (timestamp) {
                // const clientPath = path.join(netDirName, 'client', `${timestamp}.json`)
                // const serverPath = path.join(netDirName, 'forClient', `${timestamp}.json`)
                // fs.copyFileSync(clientPath, serverPath)
                netFileName = path.join(netDirName, 'client', `${timestamp}.json`)
                netServerFileName = path.join(netDirName, 'server', `${timestamp}.json`)
            }
            const clientNetwork = fs.readFileSync(netFileName, 'utf8')
            // net = getNet(netFileName, true, netServerFileName)
            props = {
                timeLimit: 50,
                // time: msg.time,
                // netState: msg.netState,
                // consumerIds: msg.consumerIds,
                // exitTimes: msg.exitTimes,
                // areMarkersConsumed: msg.areMarkersConsumed
            }
            net = createNet(netFileName, netServerFileName, props)
            
            conn.send(JSON.stringify({
                type: 'net-data',
                data: {
                    network: clientNetwork,
                    props: net.getNetProps()
                }
            }))
            break
        case 'net-next':
            console.log('net-next')
            if (timestamp) {
                netFileName = path.join(netDirName, 'client', `${timestamp}.json`)
                netServerFileName = path.join(netDirName, 'server', `${timestamp}.json`)
            }

            console.log('\n\n\n\n\n\n')
            console.log(msg.props)
            net = createNet(netFileName, netServerFileName, msg.props)
            // console.dir({ net }, { depth: null })
            const nextData = net.next();
            console.log({ nextData })
            // console.log({ state })
            fs.writeFileSync(netServerFileName, JSON.stringify(net.network))

            conn.send(JSON.stringify({ type: 'net-next', props: nextData }))
            break
        case 'net-launch':
            // if (timestamp) {
            //     netFileName = path.join(netDirName, 'client', `${timestamp}.json`)
            //     netServerFileName = path.join(netDirName, 'server', `${timestamp}.json`)
            // }
            // [state, time] = net.launch()
            // conn.send(JSON.stringify({ type: 'net-next', state, time }))
            break
        case 'iterations':
            iterations = msg.data ? msg.data : iterations
            console.log({ iterations })
            break
        case 'net-create':
            console.log('net-create')
            const filename = `${timestamp}.json`
            const data = msg.data
            const clientPath = path.join(netDirName, 'client', filename)
            const serverPath = path.join(netDirName, 'server', filename)

            fs.writeFileSync(clientPath, data, { flag: 'w' })
            if (fs.existsSync(serverPath)) {
                fs.unlinkSync(serverPath)
            }

            props = {
                timeLimit: 50,
                // time: msg.time,
                // netState: msg.netState,
                // consumerIds: msg.consumerIds,
                // exitTimes: msg.exitTimes,
                // areMarkersConsumed: msg.areMarkersConsumed
            }
            net = createNet(netFileName, netServerFileName, props)
            break
        default:
            console.log(`Websocket msg: ${msg}`)
    }
}

module.exports = {
    processMsgFromClient,
}
