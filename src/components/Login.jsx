import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import spcLogo from "../assets/spclogoo.png";
import backgroundImage from "../assets/spc.png";

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("staff"); // "staff" or "admin"
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('admin')) {
      setUserType('admin');
    } else {
      setUserType('staff');
    }
  }, [location.pathname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    // Simulate a successful login
    const mockToken = "fake-token-for-testing";

    if (userType === "admin") {
      localStorage.setItem("adminToken", mockToken);
      localStorage.setItem("userType", "admin");
      if (setIsAuthenticated) setIsAuthenticated({ admin: true, staff: false });
      navigate("/admin");
    } else {
      localStorage.setItem("staffToken", mockToken);
      localStorage.setItem("userType", "staff");
      if (setIsAuthenticated) setIsAuthenticated({ admin: false, staff: true });
      navigate("/staff");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl shadow-lg rounded-lg overflow-hidden">
        {/* Left Side */}
        <div
          className="w-1/2 bg-cover bg-center p-8 text-white flex flex-col justify-between"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div>
            <img src={spcLogo} alt="Logo" className="h-24 w-24" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">
              Online Document Request System
            </h1>
            <p className="mt-2">
              Quick, easy and secure: San Pablo Colleges Online Document Request
              System
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-1/2 bg-white p-8">
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-sm">
              <div className="flex border-b">
                <button
                  onClick={() => setUserType("staff")}
                  className={`w-1/2 py-2 text-center ${
                    userType === "staff"
                      ? "border-b-2 border-green-500 text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  Staff
                </button>
                <button
                  onClick={() => setUserType("admin")}
                  className={`w-1/2 py-2 text-center ${
                    userType === "admin"
                      ? "border-b-2 border-green-500 text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            LOG IN YOUR ACCOUNT
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Effortlessly request documents online
          </p>

          {errors.form && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-semibold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? "border-red-500" : "focus:ring-green-500"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 font-semibold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? "border-red-500" : "focus:ring-green-500"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            For document request assistance, click{" "}
            <a href="#" className="text-green-500">
              here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;