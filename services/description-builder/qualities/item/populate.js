const Quality = require("../../../../models/Quality/Quality")

exports.populate = async() => {
    let qualitiesString = `A positive and exemplary attitude
    A positive attitude
    A positive outlook
    Ability to identify inconsistencies throughout the restaurant
    Ability to lift 50lb
    Ability to manage multiple projects at once
    Ability to strategize based on customer demographics
    Ability to successfully train and coach a team
    Ability to work quickly and efficiently
    Accountable
    An eye for the smallest of details
    An eye for the smallest of details (accuracy)
    Articulate + polished
    Articulate and polished
    Articulate, clear, + proactive communication
    Can complete tasks & follow directions
    Can influence + inspire
    Challenging activity oriented
    Challenging activity-oriented
    Challenging task-oriented
    Confidence in your knowledge of the industry
    Confident decision making
    Dedication to craft
    Dependable and responsible
    Detail focused
    Driven to exceed expectations
    Driven to perform
    Enjoys baking
    Enjoys working in the hospitality industry
    Excellent communication skills
    Excellent communication skills (able to give and receive feedback well)
    Excellent communicator
    Excellent communicator (able to give and receive feedback well)
    Excellent work ethic
    Excellent work ethic and dedication to the hospitality industry
    Extremely organized
    Flexible availability
    Flexible availability (early mornings: 4:00am or 5:00am and weekends)
    Flexible availability (can work nights and weekends)
    Good work ethic (clean + organized)
    Good work habits
    Good work habits (on time and dependable)
    Good work habits (on time and reliable)
    Good work habits (organized, punctual, reliable)
    Good work habits (prompt + dependable)
    Great attitude and able to take direction well
    Guest first mentality
    High energy + upbeat personality
    High energy and upbeat personality
    High level of communication skills
    Integrity to make the right decisions for the restaurant, staff, and guests
    Is prompt, flexible, and reliable
    Is timely + flexible
    Leads by example
    Must be a self-starter
    On-time (punctual)
    On-time and reliable
    Organized and able to move with a sense of urgency
    Organized and able to move with a sense of urgency while keeping a clean station and work area
    Organized and work clean
    Organized and works clean
    Passion for providing top-notch customer service
    Passion for providing top-notch customer service to guests
    Passion for providing top-notch hospitality to guests
    Passion for providing top-notch hospitality to guests (warm and courteous)
    Polished + articulate
    Polished and articulate
    Polished appearance
    Positive + upbeat personality
    Positive and personable demeanor
    Positive attitude
    Problem solver
    Problem-solving and relationship building skills
    Prompt + flexible
    Punctual and reliable
    Reliable and punctual
    Repetitive task-oriented
    Repetitive task-oriented oriented
    Resourceful
    Respectful of fellow employees
    Respectful of fellow employees and guests
    Responsible
    Seeker of excellence
    Self-motivated
    Self-motivated (can work independently)
    Self-motivated and interested in taking on additional roles and responsibilities
    Self-motivated and willing to learn
    Stable work history
    Stays calm under pressure
    Strong communication skills
    Strong hospitality standards
    Strong multi-tasking abilities
    Strong organizational skills and have the ability to remain calm in a fast-paced environment
    Strong understanding and appreciation of customer service
    Takes ownership of their work
    Thrives well leading a team
    Thrives well leading team
    Thrives well on a motivated team
    Thrives well on a motivated team and can also work independently
    Thrives well on a team
    Warm and friendly
    Warm, energetic, and personable demeanor
    Warm, positive, and personable demeanor
    Well organized
    Works clean + organized    
    `
    let qualitiesArray = qualitiesString.split(`\n`);
    await Quality.deleteMany({});
    qualitiesArray.forEach((item => Quality.create({ name: item.trim() })));
}