'use strict'

const Net = require('./Net')
const { getNetworkFromJSON } = require('./utils/netUtils')

module.exports = {
    createNet: (netFileName, timeLimit) => {
        const network = getNetworkFromJSON(netFileName)
        return new Net({ network, timeLimit })
    }
}
