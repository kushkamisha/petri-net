'use strict'

// const { checkForConflicts, resolveConflicts } = require('./utils/conflicts')
const { getRandomWithProbability, minTransId } = require('./utils/net-utils')

module.exports = class Net {
    constructor({ network, timeLimit }) {
        this.network = network
        this.timeLimit = timeLimit ? timeLimit : 1
        
        this.time = 0 // time of the network
        this.netState = {} // object(place id <-> number of markers)
        this.consumerIds = [] // Ids of trans that consumed markers on the step
        this.exitTimes = [] // { transId, exitTime } - exit time of markers from transition
        this.areMarkersConsumed = false

        this.getNetState()
    }

    getNetState() {
        for (const transition of this.network)
            for (const elem of transition.elems)
                this.netState[elem.place.id] = elem.place.markers
        // console.dir(this.netState, { depth: null })
    }

    launch() {
        while(this.time < this.timeLimit)
            this.makeMove()

        return [this.netState, this.time]
    }
    
    next() {
        if (this.time < this.timeLimit)
            this.makeMove()

        return [this.netState, this.time]
    }

    // @return ids of transitions that can be executed now
    getOnlyValidMoves() {
        const validTransIds = []
        for (const transition of this.network) {
            const inArcsForTrans = transition.elems.filter(
                elem => elem.arc.direction === 'in')
            const validMovesForTrans = inArcsForTrans.filter(
                elem => elem.place.markers >= elem.arc.weight)

            if ((validMovesForTrans.length === inArcsForTrans.length))
                validTransIds.push(transition.trans.id)
        }
        
        return validTransIds
    }

    consume() {
        let validTransIds = this.getOnlyValidMoves()

        // Choose randomly which transition from available should be executed
        const id = getRandomWithProbability(validTransIds.length)
        const transId2Execute = validTransIds[id]
        console.log({ transId2Execute })

        // Consume markers
        for (const item of this.network) {
            if (item.trans.id !== transId2Execute) continue

            let isConsumed = false
            for (const elem of item.elems) {
                if (elem.arc.direction === 'in') {
                    elem.place.markers -= elem.arc.weight
                    this.netState[elem.place.id] = elem.place.markers
                    isConsumed = true
                }
            }

            if (isConsumed) {
                this.consumerIds.push(item.trans.id)
                this.exitTimes.push({
                    transId: item.trans.id,
                    exitTime: this.time + item.trans.delay
                })
            }
        }
        console.log(this.exitTimes)
    }

    produce() {
        console.log(this.exitTimes)
        const [ transId, currTime] = minTransId(this.exitTimes)
        this.time = currTime

        for (const item of this.network) {
            if (item.trans.id !== transId) continue

            // Remove duplicating consumer ids
            // this.consumerIds = this.consumerIds.filter(x => x !== item.trans.id)

            for (const elem of item.elems) {
                if (elem.arc.direction === 'out') {
                    elem.place.markers += elem.arc.weight
                    this.netState[elem.place.id] = elem.place.markers
                }
            }
        }

        // Remove an executed transition from exitTimes list
        this.exitTimes = this.exitTimes.filter(elem => elem.transId !== transId)
    }

    makeMove() {
        this.areMarkersConsumed ? this.produce() : this.consume()
        this.areMarkersConsumed = !this.areMarkersConsumed
    }
}
