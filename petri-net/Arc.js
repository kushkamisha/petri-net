'use strict'

module.exports = class Arc {
    constructor({ id, direction, weight }) {
        this.id = id
        this.direction = direction
        this.weight = weight ? weight : 1
    }
}
