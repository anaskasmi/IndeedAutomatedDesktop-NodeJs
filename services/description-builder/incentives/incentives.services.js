const { incentivesItemsService } = require('./item/incentivesItems.services')
const { incentivesSetsService } = require('./set/incentivesSets.services')
exports.incentivesService = {
    items: incentivesItemsService,
    sets: incentivesSetsService,
}