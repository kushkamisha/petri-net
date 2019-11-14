'use strict'

module.exports = class Net {
    constructor({ network, timeLimit }) {
        this.network = network
        this.netState = {} // object(place id <-> number of markers)
        this.timeLimit = timeLimit ? timeLimit : 1
        this.areMarkersConsumed = false
        this.consumerIds = [] // Ids of trans that consumed markers on the step

        this.getNetState()
    }

    getNetState() {
        for (const transition of this.network) {
            for (const elem of transition.elems) {
                this.netState[elem.place.id] = elem.place.markers
            }
        }
        // console.dir(this.netState, { depth: null })
    }

    launch() {
        while(this.timeLimit > 0) {
            const validTransIds = this.getOnlyValidMoves()
            this.makeMove(validTransIds)
            if (!this.areMarkersConsumed) this.timeLimit--
        }

        return this.netState
    }
    
    next() {
        if (this.timeLimit > 0) {
            const validTransIds = this.getOnlyValidMoves()
            this.makeMove(validTransIds)
            if (!this.areMarkersConsumed) this.timeLimit--
        }

        return this.netState
    }

    // @return ids of transitions that can be executed now
    getOnlyValidMoves() {
        const validTransIds = []
        for (const transition of this.network) {
            const inArcsForTrans = transition.elems.filter(
                elem => elem.arc.direction === 'in')
            const validMovesForTrans = inArcsForTrans.filter(
                elem => elem.place.markers >= elem.arc.weight)
            if (validMovesForTrans.length === inArcsForTrans.length)
                validTransIds.push(transition.trans.id)
        }
        
        return validTransIds
    }

    consume(validTransIds) {
        for (const item of this.network) {
            if (!validTransIds.includes(item.trans.id)) continue
            this.consumerIds.push(item.trans.id)

            for (const elem of item.elems) {
                if (elem.arc.direction === 'in') {
                    elem.place.markers -= elem.arc.weight
                    this.netState[elem.place.id] = elem.place.markers
                }
            }
        }
    }

    produce(validTransIds) {
        for (const item of this.network) {
            if (!validTransIds.includes(item.trans.id) &&
                !this.consumerIds.includes(item.trans.id)) continue

            for (const elem of item.elems) {
                if (elem.arc.direction === 'out') {
                    elem.place.markers += elem.arc.weight
                    this.netState[elem.place.id] = elem.place.markers
                }
            }
        }
    }

    makeMove(validTransIds) {
        if (this.areMarkersConsumed) {
            this.produce(validTransIds)
            this.areMarkersConsumed = false
        } else {
            this.consume(validTransIds)
            this.areMarkersConsumed = true
        }
    }
}
