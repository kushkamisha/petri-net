'use strict'

const { checkForConflicts, resolveConflicts } = require('./utils/conflicts')
const { getRandomWithProbability, minTransIds } = require('./utils/net-utils')

module.exports = class Net {
    constructor({ network, timeLimit, time, netState, consumerIds, exitTimes, areMarkersConsumed }) {
        this.network = network ? network : []
        this.timeLimit = timeLimit ? timeLimit : 1
        
        this.time = time ? time : 0 // time of the network
        this.netState = netState ? netState : {} // object(place id <-> number of markers)
        this.consumerIds = consumerIds ? consumerIds : [] // Ids of trans that consumed markers on the step
        this.exitTimes = exitTimes ? exitTimes : [] // { transId, exitTime } - exit time of markers from transition
        this.areMarkersConsumed = areMarkersConsumed ? areMarkersConsumed : false

        if (!netState) this.getNetState()
    }

    getNetState() {
        for (const transition of this.network)
            for (const elem of transition.elems)
                this.netState[elem.place.id] = elem.place.markers
        // console.dir(this.netState, { depth: null })
    }

    getNetProps() {
        return {
            timeLimit: this.timeLimit,
            time: this.time,
            netState: this.netState,
            consumerIds: this.consumerIds,
            exitTimes: this.exitTimes,
            areMarkersConsumed: this.areMarkersConsumed
        }
    }

    launch() {
        while(this.time < this.timeLimit)
            this.makeMove()

        return [this.netState, this.time]
    }
    
    next() {
        if (this.time < this.timeLimit)
            this.makeMove()

        return this.getNetProps()
    }

    // @return ids of transitions that can be executed now
    getOnlyValidMoves() {
        const validTransIds = []
        for (const transition of this.network) {
            const inArcsForTrans = transition.elems.filter(
                elem => elem.arc.direction === 'in')
            console.dir({ inArcsForTrans }, { depth: null })
            const validMovesForTrans = inArcsForTrans.filter(
                elem => elem.place.markers >= elem.arc.weight)

            if ((validMovesForTrans.length === inArcsForTrans.length))
                validTransIds.push(transition.trans.id)
        }
        
        return validTransIds
    }

    consume() {
        console.log('\n Net state before Consume:')
        console.log(this.netState)

        let validTransIds = []
        do {
            validTransIds = this.getOnlyValidMoves()
            console.log('Valid trans ids', validTransIds)

            // Resolve conflicts if there are any
            const conflicts = checkForConflicts(validTransIds, this.network)
            let noConflicts = true
            for (const tr in conflicts)
                if (conflicts[tr].length) noConflicts = false

            console.log(`No conflicts: ${noConflicts}`)
            console.log(`before: ${validTransIds}`)
            console.log(conflicts)

            // Pre remove all conflict transitions from validTransIds
            for (const key in conflicts)
                validTransIds = validTransIds.filter(x => x !== key)

            if (!noConflicts) {
                const resolved = resolveConflicts(conflicts, this.network)
                validTransIds = [...validTransIds, ...resolved]
            }
            
            // let validTransIds = this.getOnlyValidMoves()

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

            validTransIds = this.getOnlyValidMoves()

        } while (validTransIds.length)
        console.log('\n Net state after Consume:')
        console.log(this.netState)
    }

    produce() {
        console.log(`\n\nNet State before Produce:`)
        console.log(this.netState)

        const [ transIds, currTime] = minTransIds(this.exitTimes)
        this.time = currTime
        console.log(`Time: ${this.time}`)
        console.log('\nTransitions to execute')
        console.log(transIds)

        // Execute all transitions with the smallest exit time
        for (const item of this.network) {
            for (const transId of transIds) {
                if (item.trans.id !== transId) continue

                // Remove duplicating consumer ids
                this.consumerIds = this.consumerIds.filter(x => x !== item.trans.id)

                for (const elem of item.elems) {
                    if (elem.arc.direction === 'out') {
                        elem.place.markers += elem.arc.weight
                        this.netState[elem.place.id] = elem.place.markers
                    }
                }
            }
        }

        console.log(`\n\nNet State after Produce:`)
        console.log(this.netState)

        // Remove an executed transition from exitTimes list
        for (const transId of transIds)
            this.exitTimes = this.exitTimes.filter(elem => elem.transId !== transId)
    }

    makeMove() {
        this.areMarkersConsumed ? this.produce() : this.consume()
        this.areMarkersConsumed = !this.areMarkersConsumed
    }
}
