'use strict'

const Net = require('./Net')
// const fs = require('fs')
const { getNetworkFromJSON, rebuildClientData } = require('./utils/netUtils')

const network = getNetworkFromJSON(__dirname + '/../data/client-data.json')
const net = new Net({ network })

// const state = net.launch()
// rebuildClientData(`${__dirname}/../data/client-data.json`, state)
// console.dir(state)

module.exports = net
