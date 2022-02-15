const { roleDescriptionsItemsService } = require('./item/roleDescriptionsItems.services')
exports.roleDescriptionsService = {
    items: roleDescriptionsItemsService,
}