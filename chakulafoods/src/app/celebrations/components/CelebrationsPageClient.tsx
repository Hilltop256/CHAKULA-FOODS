"use client";

import React, { useState } from "react";
import { CalendarDays, Clock3, Users, Mail, Phone, PartyPopper, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import HomePageClient from "@/app/components/HomePageClient";

const celebrationTypes = [
  "Birthday Party",
  "Graduation Party",
  "Baby Shower",
  "Bridal Shower",
  "Other",
];

export default function CelebrationsPageClient() {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    celebration_type: "Birthday Party",
    guests: "",
    date: "",
    time: "",
    email: "",
    phone: "",
  });

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.guests || !form.date || !form.time || !form.phone.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("celebration_requests").insert({
        name: form.name.trim(),
        celebration_type: form.celebration_type,
        number_of_guests: Number(form.guests),
        date: form.date,
        time: form.time,
        email: form.email.trim() || null,
        phone: form.phone.trim(),
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Your celebration request has been received.");
      setForm({ name: "", celebration_type: "Birthday Party", guests: "", date: "", time: "", email: "", phone: "" });
    } catch (error) {
      console.error(error);
      toast.error("We couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <HomePageClient>
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-br from-[#C41230] via-[#B0102B] to-[#8F0D24] text-white">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
                <PartyPopper size={16} />
                <span className="text-sm font-semibold">Chakula Foods Celebrations</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Pland Your Celebration With Us</h1>
              <p className="mt-4 text-white/85 text-base md:text-lg max-w-2xl">
                Tell us about your event and our team will prepare a tailored quote for your celebration.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-8 md:py-12">
          {submitted ? (
            <div className="card-base p-8 md:p-12 text-center">
              <CheckCircle2 size={52} className="mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-extrabold text-foreground">Request Received</h2>
              <p className="text-muted-foreground mt-2">Thank you. We’ll review your celebration details and get back to you with a quote.</p>
              <button className="btn-primary mt-6" onClick={() => setSubmitted(false)}>Request Another Quote</button>
            </div>
          ) : (
            <div className="card-base p-5 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-extrabold text-foreground">Tell Us About Your Celebration</h2>
                <p className="text-sm text-muted-foreground mt-1">Fields marked with * are required.</p>
              </div>
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Name *</label>
                  <input className="input-field w-full" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Type of Celebration *</label>
                  <select className="input-field w-full" value={form.celebration_type} onChange={e => update("celebration_type", e.target.value)}>
                    {celebrationTypes.map(type => <option key={type}>{type}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5"><Users size={14} className="inline mr-1" />Number of Guests *</label>
                    <input type="number" min="1" className="input-field w-full" value={form.guests} onChange={e => update("guests", e.target.value)} placeholder="e.g. 50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5"><CalendarDays size={14} className="inline mr-1" />Date *</label>
                    <input type="date" min={new Date().toISOString().split("T")[0]} className="input-field w-full" value={form.date} onChange={e => update("date", e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5"><Clock3 size={14} className="inline mr-1" />Time *</label>
                  <input type="time" className="input-field w-full" value={form.time} onChange={e => update("time", e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5"><Mail size={14} className="inline mr-1" />Email <span className="font-normal text-muted-foreground">(optional)</span></label>
                    <input type="email" className="input-field w-full" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5"><Phone size={14} className="inline mr-1" />Phone *</label>
                    <input type="tel" className="input-field w-full" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="Phone number" required />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base font-bold disabled:opacity-50">
                  {submitting ? "Submitting..." : "Request Quote"}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
    </HomePageClient>
  );
}
