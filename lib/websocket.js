'use strict'

const WebSocketServer = require('ws').Server
const { processMsgFromClient } = require('./utils')

const socket = new WebSocketServer({ port: 16804 })

socket.on('connection', conn => {
    conn.on('close', () => console.warn('Websocket is disconnected'))
    conn.on('message', msg => processMsgFromClient(msg, conn))
})
