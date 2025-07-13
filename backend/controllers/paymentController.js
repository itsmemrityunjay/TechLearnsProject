const User = require("../models/userModel");
const Course = require("../models/courseModel");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const dotenv = require("dotenv")
dotenv.config()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order for course payment
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { courseId, amount } = req.body;
    const userId = req.userId; // From auth middleware

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Create Razorpay order
    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `course_${courseId}_user_${userId}`,
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    console.error("Payment order creation error:", error);
    res.status(500).json({
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      courseId,
    } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Payment is valid, save payment details to database
    // You could create a Payment model and save details there

    // Get payment details from Razorpay (optional)
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    res.status(200).json({
      message: "Payment verified successfully",
      payment: payment,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

// @desc    Get payment history for user
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;

    // Here you would query your database for payment records
    // Example: const payments = await Payment.find({ userId });

    // For now, return a placeholder
    res.json({
      message: "Payment history endpoint",
      userId,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
};
