import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-100 dark:bg-gray-900">
      {/* Left Side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors duration-200">
                <MessageSquare className="w-6 h-6 text-blue-500 dark:text-blue-100" />
              </div>
              <h1 className="text-2xl font-bold mt-2 text-text-color dark:text-text-dark-primary">Create Account</h1>
              <p className="text-text-secondary-color dark:text-text-dark-secondary">Get started with your free account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-color dark:text-text-dark-primary">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <User className="w-5 h-5 text-text-secondary-color dark:text-text-dark-secondary" />
                </span>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-dark rounded-lg bg-background-secondary dark:bg-background-dark-secondary text-text-color dark:text-text-dark-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-100 transition-colors duration-200"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-color dark:text-text-dark-primary">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="w-5 h-5 text-text-secondary-color dark:text-text-dark-secondary" />
                </span>
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-dark rounded-lg bg-background-secondary dark:bg-background-dark-secondary text-text-color dark:text-text-dark-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-100 transition-colors duration-200"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-color dark:text-text-dark-primary">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="w-5 h-5 text-text-secondary-color dark:text-text-dark-secondary" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-dark rounded-lg bg-background-secondary dark:bg-background-dark-secondary text-text-color dark:text-text-dark-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-100 transition-colors duration-200"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary-color dark:text-text-dark-secondary hover:text-blue-500 dark:hover:text-blue-100 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-lg bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 text-white font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center text-sm text-text-secondary-color dark:text-text-dark-secondary">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 dark:text-blue-100 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignUpPage;