const { create } = require("./create");
const { findOne } = require("./findOne");
const { deleteOne } = require("./deleteOne");
const { findAll } = require("./findAll");
const { update } = require("./update");
const { populate } = require("./populate");

exports.compensationsItemsService = {
    populate: populate,
    findAll: findAll,
    findOne: findOne,
    create: create,
    update: update,
    deleteOne: deleteOne
}