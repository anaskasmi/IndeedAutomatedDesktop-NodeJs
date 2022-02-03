const { compensationsItemsService } = require('./item/compensationsItems.services')
const { compensationsSetsService } = require('./set/compensationsSets.services')
exports.compensationsService = {
    items: compensationsItemsService,
    sets: compensationsSetsService,
}