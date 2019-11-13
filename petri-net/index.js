'use strict'

const Net = require('./Net')
// const fs = require('fs')
const { getNetworkFromJSON, rebuildClientData } = require('./utils/netUtils')

// const network = getNetworkFromJSON(__dirname + '/../data/client-data.json')
// const net = new Net({ network, timeLimit: 5 })

// for (let i = 0; i < 8; i++) {
//     const state = net.next()
//     rebuildClientData(`${__dirname}/../data/client-data.json`, state)
//     console.dir(state)
//     console.log('\n\n')
// }

module.exports = {
    createNet: (netFileName, timeLimit) => {
        const network = getNetworkFromJSON(netFileName)
        return new Net({ network, timeLimit })
    }
}
