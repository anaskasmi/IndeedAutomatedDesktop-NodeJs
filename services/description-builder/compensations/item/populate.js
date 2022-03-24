const Compensation = require("../../../../models/Compensation/Compensation")

exports.populate = async() => {
    let compensationsString = `$110-135K salary (experienced based)
    $12-15 hourly + tips ($1200-1400 bi-weekly average)
    $12-15 hourly + tips (paid bi-weekly | tips received in paycheck)
    $14 hourly + tips
    $15 hourly + tips
    $15 hourly (direct deposit every 2 weeks)
    $15-18 hourly (based on experience/performance | paid weekly)
    $16 - $20 Hourly | paid weekly
    $16 hourly (based on experience)
    $16-$19 hourly based on experience | paid bi-weekly
    $18 - $20 hourly (based on experience)
    $18 - 22 hourly (based on experience)
    $18 hourly ($1500 bi-weekly average)
    $18-24 hourly + overtime (based on experience | paid weekly)
    $19-$21 hourly based on experience | paid bi-weekly
    $20 hourly (paid weekly)
    $22 hourly (tips included)
    $25 hourly
    $250 signing bonus after 30 days
    $45-50K salary based on experience | paid bi-weekly
    $45k base | per year salaried | $75K OTE (on-target earnings)
    $48-55K salary based on experience (paid bi-monthly | direct deposit)
    $50-60K based on experience
    $52K-58K
    $55-70K (compensation commensurate with experience)
    $55K salary (paid bi-weekly)
    $55K-65K salary (based on experience)
    $65K salary based on experience
    $7.50 hourly + tips
    $70-75K salary based on experience
    $8.65 hourly + tips | paid weekly
    $850 - $1000 weekly (based on experience)
    $9-10 hourly + tips ($420-460 weekly) based on experience (paid weekly) Annual bonus pay
    ($1000-1500 weekly based on experience and PTO)
    ($12.50-15 hourly)
    ($13-16 hourly)
    ($14 hourly | paid weekly)
    ($14-$16 hourly + tips)
    ($15 to $18 hourly based on experience)
    ($15-$16 hourly + tips)
    ($15-18 hourly | paid weekly)
    ($15-20 hourly | paid weekly)
    ($17-$20 hourly based on experience)
    ($17-18 hourly + tips)
    ($18-20 hourly + tips)
    ($2.83 hr + tips for dinner | $7hr for lunch and brunch + tips)
    ($21-$25 hourly)
    ($3 hourly + good tips | paid weekly)
    ($6 hr + tips)
    ($7 hourly + tips)
    ($900-$1300 weekly based on experience and PTO)
    ($hr + tips | tips average $175 nightly)
    (hourly + tips)
    2 week paid vacation/
    2k bonus potential( based on food cost and gross revenue
    401K
    401K (after 30 days)
    65-75K salary (experienced based)
    Annual bonus pay 
    Bonus pay
    Bonus pay (based on gross revenue and seasonal peak periods)
    Bonus pay | paid bi-weekly
    Bonus structure based on 6-month review 
    Cash tips paid next day
    Health care contribution
    IRA match 3% of salary/ 
    Medical
    Medical benefits
    Medical benefits (including dental and vision)
    Medical benefits after 90 days
    Medical benefits possible @ 28hours
    Paid bi-weekly
    Paid sick days
    Paid time off
    Pay increases based on 6-month review
    Profit-sharing
    PTO
    Salaried (based on experience)
    Salary based on experience
    Signing bonus
    Starting at $15 hourly + overtime (paid weekly)
    Tips received in paycheck
    Up to $50K (based on experience)
    Weekly bonus pay
    Yearly bonus
    Yearly bonus pay (performance-based)    
    `
    let compensationsArray = compensationsString.split(`\n`);
    await Compensation.deleteMany({});
    compensationsArray.forEach((item => Compensation.create({ name: item.trim() })));
}