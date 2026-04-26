// const Razorpay = require("razorpay");


// exports.instance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY,
//     key_secret: process.env.RAZORPAY_SECRET,
// });



const Stripe = require("stripe")

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

module.exports = stripe