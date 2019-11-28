'use strict'

const Net = require('./Net')
const { getNetworkFromJSON } = require('./utils/net-utils')

module.exports = {
    createNet: (netFileName, timeLimit) => {
        const network = getNetworkFromJSON(netFileName)
        return new Net({ network, timeLimit })
    },

    makeMove: filename => {
        let network = []
        const dirName = path.join(__dirname, '..', 'data')
        const serverPath = path.join(dirName, 'server', filename)
        const clientPath = path.join(dirName, 'forClient', filename)

        if (fs.existsSync(serverPath)) {
            const data = fs.readFileSync(serverPath)
            network = JSON.parse(data)
        } else {
            network = getNetworkFromJSON(clientPath)
            fs.writeFileSync(serverPath, JSON.stringify(network))
        }

        const net = new Net({ network, timeLimit: 5 })
        return net.next()
    }
}
