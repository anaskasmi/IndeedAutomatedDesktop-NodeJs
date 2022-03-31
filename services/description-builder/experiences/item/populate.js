const Experience = require("../../../../models/Experience/Experience")

exports.populate = async() => {
    let experiencesString = `1 year of cooking experience in a similar role in an upscale casual bar/restaurant
    1 year of in a similar role in an upscale fast-casual restaurant
    1 year of previous experience in a similar role as a Host/Manager in an upscale casual bar/restaurant
    1 year of previous food industry experience
    1 year of previous BOH experience in a similar role in a high volume and upscale fast-casual restaurant
    1 year of previous restaurant experience in a similar role in a high volume and upscale casual restaurant
    1.5 to 2 years of previous experience in a similar role in a quick-serve restaurant
    100 Covers Per Night
    1-2 years of previous kitchen experience in an upscale casual restaurant
    1-2 years previous experience is required in a similar role working in a restaurant that focuses on a commitment to food and beverage knowledge and high expectations of hospitality
    1-2 years previous experience is required working in a restaurant that focuses on a commitment to food and beverage knowledge and high expectations of hospitality
    1-2 years previous professional cake and pastry production/sales experience
    1-2 years previous professional kitchen experience in a high volume casual restaurant
    1-2 years previous professional kitchen experience in an upscale casual restaurant
    1-2 years previously working in a professional kitchen that includes baking, cake, and pastry experience
    1-2 years previous experience in an upscale casual bakery or restaurant
    1-2 years previous restaurant experience in a similar role in a high volume and upscale casual restaurant
    1-3 years of experience in a similar role in a high volume and upscale casual restaurant
    1-3 years of previous BOH or FOH management experience working in a restaurant
    1-3 years of previous restaurant management experience
    2 years experience in a fast-paced, scratch kitchen
    2 years experience in a similar role in a casual restaurant
    2 years experience in a similar role in an upscale casual restaurant
    2 years of kitchen management experience in an upscale casual restaurant
    2 years of previous Director of Operations experience in high volume fine-casual restaurants
    2 years of previous experience in a similar role in a quick-serve restaurant
    2 years of previous experience in a similar role in an upscale casual restaurant
    2 years of previous FOH experience in a similar role in a high volume and upscale fast-casual restaurant
    2 years previous FOH experience in a similar role in a high volume and upscale fast-casual restaurant
    2-3 years of previous kitchen experience as a cook in an upscale casual restaurant
    2-3 years of previous kitchen experience in an upscale casual restaurant
    2-4 years of previous professional kitchen experience in a high volume casual restaurant
    3 years previous Executive Sous Chef/Kitchen Manager experience in a high volume upscale casual restaurant
    3-4 years previous experience in an upscale casual restaurant that includes BOH management
    3-5 years of previous experience in a management role in a restaurant that focuses on a commitment to food and beverage knowledge and high expectations of hospitality
    3-5 years of previous kitchen experience in an upscale casual restaurant
    3-5 years of similar experience in a high volume fine-casual restaurant
    6mo to 1-year previous experience in a similar role in a high volume + fast-casual cafe or restaurant
    Ability to lift up to 50 pounds frequently in a day and push/pull heavy equipment
    Ability to manage 5 people
    Ability to operate commercial baking equipment
    Answering phones
    Bachelor’s degree
    Basic computer and tablet skills
    Basic computer skills
    Basic knife skills
    Cooking and prep experience
    Customer service (reading guests + table touching)
    Daily cash handling
    Dough making
    Enforcing policies and procedures
    Establishing portioning sizes
    Excellent communication skills
    Extensive food and beverage knowledge
    Extensive food and beverage knowledge that includes Italian wine and spirit knowledge
    Familiarity with Asian cuisine helpful
    Familiarity with POS systems
    Familiarity with POS systems/adaptability to new technologies
    Following recipes
    Food and beverage knowledge
    Food and Beverage safety knowledge
    Food and Beverage safety knowledge (RAMP and ServSafe certification preferred)
    Food cost controls
    Food handling
    Food knowledge and interest is a plus
    Food prep
    Food safety knowledge
    Food safety knowledge (certification preferred)
    Food safety knowledge (must have or be willing to obtain Serve Safe certification)
    Food safety knowledge preferred
    Fresh dough handling
    Fundamental baking skills
    Good knife handling skills
    Good knife skills
    Inputting invoices in a timely manner
    Knife handling
    Maintaining consistent service standards
    Maintaining sanitation standards
    Managing >20 employees
    Managing 10-15 people
    Managing 15-20 people
    Managing 20+ employees
    Managing 5 to 10 people
    Managing 5-10 people
    Managing between 15-20 people
    Managing BOH staff
    Managing greater than 20 people
    Managing less than 5 people
    Menu consistency
    Menu development
    Menu item pricing
    Minimum 3-5 years of previous Grill, Sauté, and Line Cook experience in a high volume and upscale casual restaurant
    Minimum of one-two years of previous experience in a similar role in a high volume + upscale casual restaurant (scratch kitchen experience preferred)
    Minimum of one-two years of previous restaurant experience in a scratch kitchen preferred
    Must be able to lift 50 pounds and to stand your feet up to 4 hours without a break
    Must be able to take direction and learn in a fast-paced environment
    Networking + marketing (staying current with local trends and happenings)
    No previous experience required
    One year of previous experience in a similar role in a high volume + fast-casual restaurant (scratch kitchen experience preferred)
    Ordering & receiving
    Ordering & receiving, inventory
    Ordering & receiving, inventory (supplies and equipment)
    Ordering, purchasing, receiving, and inventory
    Ordering, receiving, & inventory
    Ordering, receiving, and inventory
    Organizing
    Overseeing BOH operations (food orders, prep, cooking, plating, temperature)
    P & L management (maintaining food costs, maximizing profitability)
    P & L management (maintaining food/labor costs, maximizing profitability)
    P & L management (meeting financial objectives and maximizing profitability)
    P & L management (meeting financial objectives, maintaining beverage costs, maximizing profitability)
    Par levels
    Payroll
    Point of sale systems + computer skills
    Prep lists
    Previous experience baking bread is preferred, but not required
    Previous experience in a high volume fine casual or upscale casual restaurant is preferred
    Previous experience is not required. Will train!
    Previous experience is working in a restaurant that focuses on a commitment to food and beverage knowledge and high expectations of hospitality are preferred
    Previous experience preferred, but not required
    Previous experience working a pizza oven that holds up to 8 pizzas at once
    Previous production baking and/or commercial kitchen experience
    Previous supervisory experience
    Processing payroll
    Receiving
    Receiving products from vendors
    Sauteeing
    Scheduling
    Solid fundamental culinary skills
    Staff education, training, and motivation
    Staff management of 15-20 people
    Staff motivation + training (team building and retention)
    Staff scheduling
    Staff scheduling (monitor daily to ensure appropriate staffing levels to maintain customer service levels)
    Staff training
    Staff training & motivation
    Staff training and motivation
    Stamina to stand and move about the bakery for 8+ hour shifts
    Station set up
    Strong 2+ years of professional cooking with fresh ingredients in a fast-paced kitchen
    Strong understanding and appreciation of customer service
    Sunday availability
    Upselling
    Vegetable Cookery
    Weekly and monthly cost reports
    Working in a fast-paced environment in the hospitality industry        
    `
    let experiencesArray = experiencesString.split(`\n`);
    await Experience.deleteMany({});
    experiencesArray.forEach((item => Experience.create({ name: item.trim() })));
}