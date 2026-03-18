"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      router.push("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">🍔 Chakula Foods</h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-3 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone (MTN/Airtel)</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full p-3 border rounded-lg" placeholder="0771234567" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full p-3 border rounded-lg" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition disabled:opacity-50">
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-500">
          Already have an account? <Link href="/login" className="text-orange-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
