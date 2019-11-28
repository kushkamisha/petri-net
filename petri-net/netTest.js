'use strict'

const fs = require('fs')
const path = require('path')
const Net = require('./Net')
// const fs = require('fs')
const { getNetworkFromJSON, updClientNet } = require('./utils/net-utils')

let network = []
const filename = '1574939975560.json'
const dirName = path.join(__dirname, '..', 'data')
const serverPath = path.join(dirName, 'server', filename)
const clientPath = path.join(dirName, 'forClient', filename)

// if (fs.existsSync(serverPath)) {
//     const data = fs.readFileSync(serverPath)
//     network = JSON.parse(data)
// } else {
//     network = getNetworkFromJSON(clientPath)
//     fs.writeFileSync(serverPath, JSON.stringify(network))
// }

network = getNetworkFromJSON(clientPath)

// const network = getNetworkFromJSON(__dirname + '/../data/forClient/1574881507451.json')
console.dir(network, { depth: null })
const net = new Net({ network, timeLimit: 50 })
let state = net.next()
console.log(state)
state = net.next()
console.log(state)
state = net.next()
console.log(state)
state = net.next()
console.log(state)


// rebuildClientData(`${__dirname}/../data/client-data.json`, state)
