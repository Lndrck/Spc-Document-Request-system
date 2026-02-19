import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [message, setMessage] = useState("");
  const [nextEnabled, setNextEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const res = await axios.post("http://localhost:5000/api/verify-email", { token });
        if (res.data.success) {
          setMessage(res.data.message); // ✅ "Your email has been verified successfully!"
          setNextEnabled(true); // Enable Next: Summary button
        }
      } catch (error) {
        console.error("❌ Email verification error:", error);
        setMessage(error.response?.data?.message || "Verification failed");
      }
    };

    verify();
  }, []);

  return (
    <div style={{ padding: 30, textAlign: 'center' }}>
      <h2>Email Verification</h2>
      <p>{message}</p>
      <button
        disabled={!nextEnabled}
        onClick={() => navigate("/summary")}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          backgroundColor: nextEnabled ? '#16a34a' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: nextEnabled ? 'pointer' : 'not-allowed'
        }}
      >
        Next: Summary
      </button>
    </div>
  );
};

export default VerifyEmail;