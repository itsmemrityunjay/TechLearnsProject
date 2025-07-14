const User = require("../models/userModel");
const Course = require("../models/courseModel");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Razorpay with better error handling and debugging
let razorpay;
try {
  // For testing, we'll use a proper Razorpay test key
  // IMPORTANT: The test key used here is a public test key and not sensitive
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_USRBs9xzh6MqbM';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'G0a9X0HAcUfgkFIXA3504SrT';
  
  console.log("Razorpay initialization - key_id present:", !!key_id);
  console.log("Razorpay initialization - key_secret present:", !!key_secret);
  
  razorpay = new Razorpay({
    key_id,
    key_secret,
  });
  
  // Test the Razorpay connection
  razorpay.orders.all().then(() => {
    console.log("✅ Razorpay connection test successful");
  }).catch(err => {
    console.error("❌ Razorpay connection test failed:", err.message);
  });
  
  console.log("Razorpay initialized");
} catch (error) {
  console.error("Failed to initialize Razorpay:", error);
}

// @desc    Create a Razorpay order for course payment
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    // Verify razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({ 
        message: "Payment gateway not initialized", 
        error: "Razorpay configuration missing"
      });
    }
    
    const { courseId, amount } = req.body;
    const userId = req.userId; // From auth middleware
    
    console.log("Create order request:", { courseId, amount, userId });

    if (!courseId || !amount) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        required: "courseId and amount" 
      });
    }

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Optional: Verify amount matches course price
    const expectedAmount = Math.round(course.price * 100); // Convert to paise
    if (amount !== expectedAmount) {
      return res.status(400).json({ 
        message: "Amount mismatch", 
        expected: expectedAmount,
        received: amount
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `course_${courseId}_user_${userId}_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    console.log("Creating Razorpay order with options:", options);

    // Create order with proper promise handling
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order);

    res.status(200).json(order);
  } catch (error) {
    console.error("Payment order creation error:", error);
    
    // More specific error messages
    if (error.name === 'RazorpayError') {
      return res.status(400).json({
        message: "Razorpay API error",
        error: error.message,
        code: error.code || 'unknown'
      });
    }
    
    // Database errors
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({
        message: "Database error when processing order",
        error: error.message
      });
    }
    
    // Generic error
    res.status(500).json({
      message: "Failed to create payment order",
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    // Verify razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({ 
        message: "Payment gateway not initialized", 
        error: "Razorpay configuration missing"
      });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      courseId,
    } = req.body;

    console.log("Verifying payment:", { 
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      courseId
    });

    // Verify signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'your_key_secret_here';
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    console.log("Payment verified:", payment);

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
