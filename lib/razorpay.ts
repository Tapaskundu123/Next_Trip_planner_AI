import Razorpay from "razorpay";

export const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

  // If using placeholder dev keys, return null so dev mode simulator can activate
  if (!key_id || !key_secret || key_id === "rzp_test_devmode") {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};
