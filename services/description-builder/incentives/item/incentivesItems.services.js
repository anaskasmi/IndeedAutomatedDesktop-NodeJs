const { create } = require("./create");
const { findOne } = require("./findOne");
const { deleteOne } = require("./deleteOne");
const { findAll } = require("./findAll");
const { update } = require("./update");

exports.incentivesItemsService = {
    findAll: findAll,
    findOne: findOne,
    create: create,
    update: update,
    deleteOne: deleteOne
}