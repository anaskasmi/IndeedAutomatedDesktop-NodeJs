const { create } = require("./create");
const { deleteOne } = require("./deleteOne");
const { findAll } = require("./findAll");
const { update } = require("./update");

exports.companiesService = {
    findAll: findAll,
    create: create,
    update: update,
    deleteOne: deleteOne
}