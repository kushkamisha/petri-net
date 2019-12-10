'use strict'

const fs = require('fs')
const Net = require('./Net')
const { getNetworkFromJSON } = require('./utils/net-utils')

// let net = undefined

const getNet = (fromFile, recreate = false, toFile, timelimit=50) => {
    let net = undefined
    if (typeof net === 'undefined' || recreate) {
        net = createNet(fromFile, toFile, timelimit)
        console.log('the net is undefined')
    } else {
        console.log('the net is defined')
    }

    return net
}

const createNet = (netFileName, toFile, { timeLimit, time, netState, consumerIds, exitTimes, areMarkersConsumed }) => {
    let network
    // if (!fs.existsSync(toFile)) {
    //     network = getNetworkFromJSON(netFileName)
    //     fs.writeFileSync(toFile, JSON.stringify(network))
    // } else {
    //     network = JSON.parse(fs.readFileSync(toFile, 'utf8'))
    // }
    // console.dir({ network }, { depth: null })
    network = getNetworkFromJSON(netFileName)
    
    console.log(network)
    for (const transition of network) {
        for (const elem of transition.elems) {
            for (const key in netState) {
                if (key === elem.place.id)
                    elem.place.markers = netState[key]
            }
        }
    }

    console.dir({ network }, { depth: null })
    
    return new Net({ network, timeLimit, time, netState, consumerIds, exitTimes, areMarkersConsumed })
}

module.exports = {
    getNet,
    createNet
}
