import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints;


// =============================
// 💳 BUY COURSE (STRIPE)
// =============================
export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
  const toastId = toast.loading("Redirecting to payment...");
  dispatch(setPaymentLoading(true));

  try {
    // 🔥 Call backend to create Stripe session
    const response = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      { courses },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("STRIPE RESPONSE:", response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    // ✅ Redirect to Stripe Checkout
    window.location.href = response.data.url;

  } catch (error) {
    console.log("PAYMENT ERROR:", error);
    toast.error("Could not make Payment");
  }

  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}


// =============================
// ⚠️ VERIFY PAYMENT (CALL FROM SUCCESS PAGE)
// =============================
export async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment....");
  dispatch(setPaymentLoading(true));

  try {
    const response = await apiConnector(
      "POST",
      COURSE_VERIFY_API,
      bodyData,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Payment Successful 🎉");
    dispatch(resetCart());
    navigate("/dashboard/enrolled-courses");

  } catch (error) {
    console.log("PAYMENT VERIFY ERROR....", error);
    toast.error("Could not verify Payment");
  }

  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}


// =============================
// 📧 SEND PAYMENT SUCCESS EMAIL
// =============================
export async function sendPaymentSuccessEmail(data, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );
  } catch (error) {
    console.log("EMAIL ERROR:", error);
  }
}