'use strict'

const Net = require('./Net')
// const fs = require('fs')
const { getNetworkFromJSON, rebuildClientData } = require('./utils/netUtils')

const network = getNetworkFromJSON(__dirname + '/../data/client-data.json')
console.dir(network, { depth: null })
const net = new Net({ network, timeLimit: 1 })
const state = net.launch()
console.log(state)
// rebuildClientData(`${__dirname}/../data/client-data.json`, state)
