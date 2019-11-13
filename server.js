'use strict'

const fs = require('fs')
const WebSocketServer = require('ws').Server
const express = require('express')
const { createNet } = require('./petri-net')
const { rebuildClientData } = require('./petri-net/utils/netUtils')

const app = express()
const port = 3000

const getPetriNetForClient = filename => {
    const rawdata = fs.readFileSync(filename)
    return JSON.parse(rawdata)
}

const changeAndSend = (filename, state, connection) => {
    console.log({ state })
    rebuildClientData(filename, state)
    const data = getPetriNetForClient(filename)

    connection.send(JSON.stringify(data))
}

app.use(express.static('public'))

app.listen(port, () => console.log(`Listening on a port ${port}`))

/**************
 * Web socket *
 *************/
const socket = new WebSocketServer({ port: 16804 })

socket.on('connection', connection => {

    const netFileName = `${__dirname}/data/client-data.json`
    const net = createNet(netFileName, 5)

    connection.on('close', () => console.warn('Websocket is disconnected'))

    connection.on('message', msg => {

        let state = {}

        switch(msg) {
            case 'net-data':
                const clientNetwork = fs.readFileSync(netFileName, 'utf-8')
                connection.send(clientNetwork)
                break
            case 'next':
                state = net.next()
                changeAndSend(netFileName, state, connection)
                break
            case 'launch':
                state = net.launch()
                changeAndSend(netFileName, state, connection)
                break
            default:
                console.log(`Websocket msg: ${msg}`)
        }
    })
})
