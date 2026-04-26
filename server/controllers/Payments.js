const stripe = require("../config/stripe");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");

const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");

const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");

const CourseProgress = require("../models/CourseProgress");

// =============================
// 💳 CAPTURE PAYMENT (STRIPE)
// =============================
exports.capturePayment = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user.id;

    if (!courses || courses.length === 0) {
      return res.json({
        success: false,
        message: "Please Provide Course ID",
      });
    }

    let total_amount = 0;

    for (const course_id of courses) {
      const course = await Course.findById(course_id);

      if (!course) {
        return res.status(200).json({
          success: false,
          message: "Could not find the Course",
        });
      }

      const uid = new mongoose.Types.ObjectId(userId);

      if (course.studentsEnrolled.includes(uid)) {
        return res.status(200).json({
          success: false,
          message: "Student already enrolled",
        });
      }

      total_amount += course.price;
    }

    // ✅ Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Course Purchase",
            },
            unit_amount: total_amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/payment-success?courses=${JSON.stringify(
        courses
      )}`,
      cancel_url: `http://localhost:3000/dashboard/cart`,
      metadata: {
        userId,
        courses: JSON.stringify(courses),
      },
    });

    return res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Payment failed",
    });
  }
};

// =============================
// ✅ VERIFY PAYMENT
// =============================
exports.verifyPayment = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user.id;

    if (!courses || !userId) {
      return res.status(400).json({
        success: false,
        message: "Payment Failed",
      });
    }

    await enrollStudents(courses, userId);

    return res.status(200).json({
      success: true,
      message: "Payment Verified & Course Enrolled",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

// =============================
// 📧 EMAIL
// =============================
exports.sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    const userId = req.user.id;

    if (!paymentId || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }

    const user = await User.findById(userId);

    await mailSender(
      user.email,
      "Payment Successful",
      paymentSuccessEmail(
        `${user.firstName} ${user.lastName}`,
        amount / 100,
        paymentId
      )
    );

    return res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Email failed",
    });
  }
};

// =============================
// 🎓 ENROLL
// =============================
const enrollStudents = async (courses, userId) => {
  for (const courseId of courses) {
    const enrolledCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      throw new Error("Course not found");
    }

    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId: userId,
      completedVideos: [],
    });

    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          courses: courseId,
          courseProgress: courseProgress._id,
        },
      },
      { new: true }
    );

    await mailSender(
      enrolledStudent.email,
      `Successfully Enrolled into ${enrolledCourse.courseName}`,
      courseEnrollmentEmail(
        enrolledCourse.courseName,
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
      )
    );
  }
};