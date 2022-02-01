const { create } = require("./create");
const { findOne } = require("./findOne");
const { deleteOne } = require("./deleteOne");
const { findAll } = require("./findAll");
const { update } = require("./update");
const { addItem } = require("./addItem");
const { removeItem } = require("./removeItem");

exports.applyMethodsSetsService = {
    findAll: findAll,
    findOne: findOne,
    create: create,
    update: update,
    addItem: addItem,
    removeItem: removeItem,
    deleteOne: deleteOne
}