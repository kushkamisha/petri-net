'use strict'

const fs = require('fs')
const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

app.get('/petri-data', (req, res) => {
    const rawdata = fs.readFileSync(__dirname + '/data.json')
    const data = JSON.parse(rawdata)
    res.send(data)
})

app.listen(port, () => console.log(`Listening on a port ${port}`))
