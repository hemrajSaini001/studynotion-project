// // Import the required modules
// const express = require("express")
// const router = express.Router()

// const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controllers/Payments")
// const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")
// router.post("/capturePayment", auth, isStudent, capturePayment)
// router.post("/verifyPayment",auth, isStudent, verifyPayment)
// router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);

// module.exports = router


// ==============================
// 📦 IMPORTS
// ==============================
const express = require("express");
const router = express.Router();

// ✅ IMPORTANT: correct path
const paymentsController = require("../controllers/Payments");

// middlewares
const { auth, isStudent } = require("../middlewares/auth");

// ==============================
// 🚀 ROUTES
// ==============================

// 💳 Capture Payment
router.post(
  "/capturePayment",
  auth,
  isStudent,
  paymentsController.capturePayment
);

// ✅ Verify Payment
router.post(
  "/verifyPayment",
  auth,
  isStudent,
  paymentsController.verifyPayment
);

// 📧 Send Payment Email
router.post(
  "/sendPaymentSuccessEmail",
  auth,
  isStudent,
  paymentsController.sendPaymentSuccessEmail
);

// ==============================
// 📤 EXPORT
// ==============================
module.exports = router;