const { qualitiesItemsService } = require('./item/qualitiesItems.services')
const { qualitiesSetsService } = require('./set/qualitiesSets.services')
exports.qualitiesService = {
    items: qualitiesItemsService,
    sets: qualitiesSetsService,
}