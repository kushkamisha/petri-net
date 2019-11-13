'use strict'

const fs = require('fs')
const WebSocketServer = require('ws').Server
const express = require('express')
// const petriNet = require('./petri-net')
const Net = require('./petri-net/Net')
const { getNetworkFromJSON, rebuildClientData } = require('./petri-net/utils/netUtils')

const app = express()
const port = 3000

const getPetriNetForClient = filename => {
    const rawdata = fs.readFileSync(filename)
    return JSON.parse(rawdata)
}

app.use(express.static('public'))

app.get('/petri-data', (req, res) => {
    const data = getPetriNetForClient(__dirname + '/data/client-data.json')
    res.send(data)
})

app.listen(port, () => console.log(`Listening on a port ${port}`))

/**************
 * Web socket *
 *************/
const socket = new WebSocketServer({ port: 16804 })

socket.on('connection', connection => {

    connection.on('close', () => console.warn('Websocket is disconnected'))

    connection.on('message', msg => {
        if (msg === 'move') {
            const network = getNetworkFromJSON(`${__dirname}/data/client-data.json`)
            const net = new Net({ network })

            const state = net.launch()
            console.log({ state })
            rebuildClientData(`${__dirname}/data/client-data.json`, state)
            const data = getPetriNetForClient(`${__dirname}/data/client-data.json`)

            console.dir(data, { depth: null })
            connection.send(JSON.stringify(data))
        } else {
            console.log(`Websocket msg: ${msg}`)
        }
    })
})
