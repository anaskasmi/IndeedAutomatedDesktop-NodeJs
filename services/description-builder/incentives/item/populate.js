const Incentive = require("../../../../models/Incentive/Incentive")

exports.populate = async() => {
    let incentivesString = `20% employee discount
    401K (after 90 days of employment | with safe harbor matching (100% on the first 3%)
    Being part of a small team that is growing and loved in the Raleigh community
    Career planning and development
    Clean work environment
    Commuter benefits
    Company dining discounts
    Company dining perks
    Company referral program
    Dental, vision, & life insurance
    Discounts
    Easily accessible by public transportation
    Employee discounts
    Employee referral program
    Excellent culture
    Flexible schedule
    Free food and employee discount
    Free parking
    Free telemedicine and telecounseling resources
    Free unlimited 24/7/365 Telehealth (general and mental) for all employees and their household
    Growth and advancement
    Hiring bonus after 2 mo of employment
    Loyalty, support, and commitment from owners
    Moving expenses
    Other discounts
    Paid sick days
    Paid sick time (double rate for part-time employees)
    Parking and cell phone credit paid monthly
    Positive work culture
    Potential for growth
    Remote work
    Short and long term disability (critical illness and accident)
    Staff meal
    Team events
    Team oriented
    Transportation stipend
    Tuition reimbursement
    Wellness program
    Work-life balance    
    `
    let incentivesArray = incentivesString.split(`\n`);
    await Incentive.deleteMany({});
    incentivesArray.forEach((item => Incentive.create({ name: item.trim() })));
}