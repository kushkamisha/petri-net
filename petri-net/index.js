'use strict'

const Net = require('./Net')
const { getNetworkFromJSON } = require('./netUtils')

const network = getNetworkFromJSON(__dirname + '/../data.json')

const net = new Net({ network })
net.launch()
