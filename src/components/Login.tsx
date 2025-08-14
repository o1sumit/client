import type { AppDispatch } from "../store";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Loader2, Lock, Shield, User } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "react-oidc-context";

import { login } from "../store/slices/authSlice";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { signinRedirect } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setError("");
      try {
        await dispatch(login(values)).unwrap();
      } catch (error: any) {
        console.error("Login failed:", error);
        setError(error || "Login failed. Please try again.");
      }
    },
  });

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Shield size={32} />
          </div>
          <h2 className="login-title">APP-ADMIN System</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={formik.handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input
                className={
                  formik.touched.email && formik.errors.email ? "error" : ""
                }
                id="email"
                name="email"
                placeholder="Enter your email address"
                type="text"
                value={formik.values.email}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <div className="field-error">{formik.errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input
                className={
                  formik.touched.password && formik.errors.password
                    ? "error"
                    : ""
                }
                id="password"
                name="password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="field-error">{formik.errors.password}</div>
            )}
          </div>

          <button
            className="login-button"
            disabled={formik.isSubmitting}
            type="submit"
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="spinner-icon" size={18} />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <button
            className="login-button"
            type="button"
            onClick={() => signinRedirect()}
          >
            Keycloak Login
          </button>

          <div className="login-info">
            <p className="demo-info">
              <strong>Demo Credentials:</strong>
              <br />
              Email: <code>sumeet.jha@baymain.com</code>
              <br />
              Password: <code>SuperAdmin123!</code>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
