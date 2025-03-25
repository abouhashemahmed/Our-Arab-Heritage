import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Head from "next/head";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setStatus("loading");

    try {
      const result = await register(email, password, "SELLER");

      if (result.success) {
        setStatus("success");
        setMessage("✅ Registration successful! Redirecting...");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setStatus("error");
        setMessage(`❌ ${result.error || "Something went wrong"}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("❌ Server error. Please try again.");
    }
  };

  return (
    <>
      <Head>
        <title>Register | Our Arab Heritage</title>
      </Head>

      <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg mt-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Create an Account</h1>

        {message && (
          <p
            className={`mb-4 text-center ${
              status === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className={`w-full py-2 px-4 rounded-md text-white ${
              status === "loading" ? "bg-green-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {status === "loading" ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 underline hover:text-blue-600">
            Login here
          </Link>
        </p>
      </div>
    </>
  );
}

