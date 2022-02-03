const { applyMethodsItemsService } = require('./item/applyMethodsItems.services')
const { applyMethodsSetsService } = require('./set/applyMethodsSets.services')
exports.applyMethodsService = {
    items: applyMethodsItemsService,
    sets: applyMethodsSetsService,
}