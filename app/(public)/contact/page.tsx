"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-fraunces font-bold mb-8 text-center">Contact Us</h1>
        <p className="text-muted text-center mb-12">
          Have questions or need help? We're here for you. Reach out to the BirdieFund support team.
        </p>
        
        <div className="bg-surface border border-border p-8 rounded-2xl">
          {submitted ? (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-text mb-2">Email Sent!</h2>
              <p className="text-muted text-lg">We will contact you shortly.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-accent hover:underline font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text focus:border-accent outline-none transition-colors" 
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text focus:border-accent outline-none transition-colors" 
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea 
                  required
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text min-h-[150px] focus:border-accent outline-none transition-colors" 
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-accent text-bg font-bold py-3 rounded-lg hover:bg-accent/90 transition-all hover:scale-[1.01] active:scale-95 shadow-lg shadow-accent/20"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
