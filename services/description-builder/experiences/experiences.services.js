const { experiencesItemsService } = require('./item/experiencesItems.services')
const { experiencesSetsService } = require('./set/experiencesSets.services')
exports.experiencesService = {
    items: experiencesItemsService,
    sets: experiencesSetsService,
}