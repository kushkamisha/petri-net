'use strict'

module.exports = class Net {
    constructor({ network, timeLimit }) {
        this.network = network
        this.timeLimit = timeLimit ? timeLimit : 1
    }

    launch() {
        while(this.timeLimit > 0) {
            const validTransIds = this.getOnlyValidMoves()
            console.dir(this.network, { depth: null })

            this.makeMove(validTransIds)
            console.dir(this.network, { depth: null })

            this.timeLimit--
        }
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

    makeMove() {
        for (const item of this.network) {
            if (!validTransIds.includes(item.trans.id)) continue

            for (const elem of item.elems) {
                if (elem.arc.direction === 'in')
                    elem.place.markers -= elem.arc.weight
                if (elem.arc.direction === 'out')
                    elem.place.markers += elem.arc.weight
            }
        }
    }
}
