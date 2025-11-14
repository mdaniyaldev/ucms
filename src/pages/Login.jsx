import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Lock, Globe } from "lucide-react";

const schema = z.object({
  uniqueId: z.string().min(3, "Enter your University ID"),
  password: z.string().min(6, "Minimum 6 characters required"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState("student");
  const [activeTab, setActiveTab] = useState("login");
  const [language, setLanguage] = useState("en");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { uniqueId: "", password: "" },
  });

  useEffect(() => {
    if (loading) return;
    if (user?.role === "admin") navigate("/admin", { replace: true });
    else if (user) navigate("/dashboard", { replace: true });
  }, [loading, user, navigate]);

  const text = {
    en: {
      title: "University Complaint Management System",
      subtitle: "Login to submit and track your complaints",
      login: "Login",
      signup: "Sign Up",
      universityId: "University ID",
      password: "Password",
      selectRole: "Select Your Role",
      student: "Student",
      faculty: "Faculty/Staff",
      coordinator: "Department Coordinator",
      admin: "Admin/Management",
      loginButton: "Login",
      signupButton: "Create Account",
      forgotPassword: "Forgot password?",
      idPlaceholder: "e.g. John-123",
      passwordPlaceholder: "Enter your password",
    },
    ur: {
      title: "یونیورسٹی شکایات کا نظام",
      subtitle: "اپنی شکایات جمع کرانے اور ٹریک کرنے کے لیے لاگ ان کریں",
      login: "لاگ ان",
      signup: "سائن اپ",
      universityId: "یونیورسٹی آئی ڈی",
      password: "پاس ورڈ",
      selectRole: "اپنا کردار منتخب کریں",
      student: "طالب علم",
      faculty: "فیکلٹی/عملہ",
      coordinator: "محکمہ کوآرڈینیٹر",
      admin: "ایڈمن/انتظامیہ",
      loginButton: "لاگ ان کریں",
      signupButton: "اکاؤنٹ بنائیں",
      forgotPassword: "پاس ورڈ بھول گئے؟",
      idPlaceholder: "مثلاً FA22-123",
      passwordPlaceholder: "اپنا پاس ورڈ درج کریں",
    },
  };

  const handleLanguageToggle = () =>
    setLanguage((prev) => (prev === "en" ? "ur" : "en"));

  async function onSubmit(values) {
    try {
      const profile = await login({
        uniqueId: values.uniqueId.trim(),
        password: values.password,
      });

      if (profile?.role === "admin") navigate("/admin", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.message?.toLowerCase()?.includes("invalid login credentials")
          ? "Invalid University ID or password"
          : err?.message || "Login failed. Try again.";
      setError("password", { type: "server", message: msg });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 relative">
      {/* Language Toggle */}
      <button
        onClick={handleLanguageToggle}
        className="absolute top-4 right-4 flex items-center gap-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:bg-gray-100 transition"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span>{language === "en" ? "اردو" : "English"}</span>
      </button>

      {/* Card */}
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {text[language].title}
          </h1>
          <p className="text-gray-500 text-sm">{text[language].subtitle}</p>
        </div>

        {/* Tabs */}
        {/* <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-lg overflow-hidden w-full">
            <button
              onClick={() => setActiveTab("login")}
              className={`w-1/2 py-2 font-medium text-sm transition ${
                activeTab === "login"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {text[language].login}
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`w-1/2 py-2 font-medium text-sm transition ${
                activeTab === "signup"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {text[language].signup}
            </button>
          </div>
        </div> */}

        {activeTab === "login" ? (
          // LOGIN TAB
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* University ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text[language].universityId}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={text[language].idPlaceholder}
                  className="w-full pl-10 rounded-lg border border-gray-300 bg-gray-50 py-2.5 px-3 text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none"
                  {...register("uniqueId")}
                  autoComplete="username"
                />
              </div>
              {errors.uniqueId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.uniqueId.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text[language].password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  placeholder={text[language].passwordPlaceholder}
                  className="w-full pl-10 rounded-lg border border-gray-300 bg-gray-50 py-2.5 px-3 text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none"
                  {...register("password")}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {text[language].selectRole}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["student", "faculty", "coordinator", "admin"].map((role) => (
                  <label
                    key={role}
                    className={`flex items-center justify-center border rounded-lg py-2 text-sm font-medium cursor-pointer transition ${
                      selectedRole === role
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={() => setSelectedRole(role)}
                      className="hidden"
                    />
                    {text[language][role]}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-60"
            >
              {isSubmitting
                ? language === "en"
                  ? "Signing in..."
                  : "لاگ ان ہو رہا ہے..."
                : text[language].loginButton}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="text-blue-600 text-sm hover:underline"
              >
                {text[language].forgotPassword}
              </button>
            </div>
          </form>
        ) : (
          // SIGNUP TAB
          <div className="text-center text-gray-500 text-sm">
            Sign-up feature coming soon!
          </div>
        )}
      </div>
    </div>
  );
}