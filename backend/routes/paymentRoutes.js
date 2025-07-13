const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// All payment routes are protected
router.use(protect);

// Create payment order
router.post("/create-order", createOrder);

// Verify payment
router.post("/verify", verifyPayment);

// Get payment history
router.get("/history", getPaymentHistory);

module.exports = router;
