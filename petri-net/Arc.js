'use strict'

module.exports = class Arc {
    constructor({ direction, weight }) {
        this.direction = direction
        this.weight = weight ? weight : 1
    }
}
