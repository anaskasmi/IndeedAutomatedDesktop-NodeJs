const { create } = require("./create");
const { findOne } = require("./findOne");
const { deleteOne } = require("./deleteOne");
const { findAll } = require("./findAll");
const { update } = require("./update");
const { populate } = require("./populate");

exports.incentivesItemsService = {
    findAll: findAll,
    findOne: findOne,
    populate: populate,
    create: create,
    update: update,
    deleteOne: deleteOne
}