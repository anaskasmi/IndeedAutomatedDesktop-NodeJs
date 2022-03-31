const { create } = require("./create");
const { findOne } = require("./findOne");
const { deleteOne } = require("./deleteOne");
const { findAll } = require("./findAll");
const { update } = require("./update");
const { populate } = require("./populate");

exports.qualitiesItemsService = {
    findAll: findAll,
    findOne: findOne,
    create: create,
    update: update,
    populate: populate,
    deleteOne: deleteOne
}