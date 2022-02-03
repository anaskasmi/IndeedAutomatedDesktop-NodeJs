const { positionsItemsService } = require('./item/positionsItems.services')
const { positionsSetsService } = require('./set/positionsSets.services')
exports.positionsService = {
    items: positionsItemsService,
    sets: positionsSetsService,
}