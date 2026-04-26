import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyPayment } from "../services/operations/studentFeaturesAPI";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const courses = JSON.parse(query.get("courses"));

    if (!courses) return;

    verifyPayment({ courses }, token, navigate, dispatch);
  }, []);

  return (
    <div className="text-white text-center mt-20">
      <h1>Payment Processing...</h1>
    </div>
  );
}