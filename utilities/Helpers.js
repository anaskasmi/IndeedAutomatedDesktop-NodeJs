const BrowserService = require("../services/BrowserService");

let Helpers = {};
Helpers.clearInput = async() => {
    await BrowserService.page.keyboard.down('Control');
    await BrowserService.page.keyboard.press('KeyA');
    await BrowserService.page.keyboard.up('Control');
    await BrowserService.page.keyboard.press('Backspace');
};

module.exports = Helpers;