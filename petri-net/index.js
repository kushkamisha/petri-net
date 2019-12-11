'use strict'

const fs = require('fs')
const Net = require('./Net')
const { getNetworkFromJSON } = require('./utils/net-utils')

const createNet = (netFileName, toFile, { timeLimit, time, netState, consumerIds, exitTimes, areMarkersConsumed }) => {
    // Get a network from client-format file, or from server-format file
    let network = fs.existsSync(toFile) && netState ?
        JSON.parse(fs.readFileSync(toFile, 'utf8')) :
        getNetworkFromJSON(netFileName)

    // Apply markers to the net and remove markers in other places
    console.log({ netState })
    if (netState) {
        for (const transition of network) {
            for (const elem of transition.elems) {
                for (const id in netState) {
                    if (id === elem.place.id)
                        elem.place.markers = netState[id]
                }
            }
        }
    }

    // Save updated network in a server format
    fs.writeFileSync(toFile, JSON.stringify(network))
    
    return new Net({ network, timeLimit, time, netState, consumerIds, exitTimes, areMarkersConsumed })
}

module.exports = {
    createNet
}
