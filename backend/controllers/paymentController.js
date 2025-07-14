const User = require("../models/userModel");
const Course = require("../models/courseModel");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Razorpay with better error handling
let razorpay;
try {
  // For testing, we'll use a proper Razorpay test key
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_USRBs9xzh6MqbM';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'G0a9X0HAcUfgkFIXA3504SrT';
  
  console.log("Razorpay initialization - key_id present:", !!key_id);
  console.log("Razorpay initialization - key_secret present:", !!key_secret);
  
  razorpay = new Razorpay({
    key_id,
    key_secret,
  });
  
  // Don't test the connection on startup - this can cause issues
  console.log("Razorpay instance created");
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
        courseId: courseId.toString(),
        userId: userId.toString(),
      },
    };

    console.log("Creating Razorpay order with options:", options);

    // Create order with better error handling
    try {
      const order = await razorpay.orders.create(options);
      console.log("Razorpay order created:", order);
      return res.status(200).json(order);
    } catch (razorpayError) {
      console.error("Razorpay order creation failed:", razorpayError);
      return res.status(500).json({
        message: "Payment gateway error",
        error: razorpayError.message,
        code: razorpayError.code || 'unknown'
      });
    }
    
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
    return res.status(500).json({
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

    // Use the same key_secret as in initialization
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'G0a9X0HAcUfgkFIXA3504SrT';
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Get payment details from Razorpay
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      console.log("Payment verified:", payment);

      return res.status(200).json({
        message: "Payment verified successfully",
        payment: payment,
      });
    } catch (razorpayError) {
      console.error("Razorpay payment fetch failed:", razorpayError);
      return res.status(500).json({
        message: "Payment verification error",
        error: razorpayError.message
      });
    }
    
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
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
