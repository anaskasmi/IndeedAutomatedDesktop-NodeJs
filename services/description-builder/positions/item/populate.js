const Position = require("../../../../models/Position/Position")

exports.populate = async() => {
    let positionsString = `AM Bakery Assistant
    Assistant General Manager
    Baker
    Barista
    Bartender ($15 hourly + tips)
    Busser/Food Runner
    Cake Assembler/Decorator
    Custodian/Utility Associate
    Custom Cake Sales Associate
    Director of Operations.
    Dishwasher
    Executive Chef
    Executive Sous Chef
    Floor Manager
    FOH Manager
    General manager
    Host
    Kitchen Manager
    Lead Host/Dining Room Supervisor
    Line & Prep Cooks
    Line Cook
    Morning Prep Cook
    Multi-Unit Executive Chef
    Pizza Cook
    Pizza Maker
    Prepared Foods Associate
    Restaurant Chef
    Restaurant Manager
    Sales Development Representative
    Servers
    Server 
    Service Manager
    Shift Lead
    Short Order Cook
    Sous Chef
    `
    let positionsArray = positionsString.split(`\n`);
    await Position.deleteMany({});
    positionsArray.forEach((item => Position.create({ name: item.trim() })));
}