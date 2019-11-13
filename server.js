'use strict'

require('./lib/websocket')
const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

app.listen(port, () => console.log(`Listening on a port ${port}`))
