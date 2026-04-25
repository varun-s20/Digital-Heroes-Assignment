"use client";

import { useState, useEffect } from "react";
import { CharityCard } from "@/components/charity/CharityCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Charity {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  image_url: string | null;
  total_raised: number;
  subscriber_count: number;
  status: string;
}

const ALL_CATEGORIES = "All";

export default function CharitiesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [categories, setCategories] = useState<string[]>([ALL_CATEGORIES]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("charities")
      .select("id, name, slug, category, description, image_url, total_raised, subscriber_count, status")
      .eq("status", "active")
      .order("name")
      .then(({ data }) => {
        if (!data) return;
        setCharities(data);
        const uniqueCategories = [
          ALL_CATEGORIES,
          ...Array.from(new Set(data.map((c: Charity) => c.category))).sort(),
        ];
        setCategories(uniqueCategories);
      });
  }, []);

  const filtered = charities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === ALL_CATEGORIES || c.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-h1 font-fraunces mb-4">Supported Charities</h1>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            Discover the incredible organizations our community supports. Every
            swing you take helps them make a difference.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <Input
              placeholder="Search charities..."
              className="pl-10 h-12 bg-surface"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-accent text-bg"
                    : "bg-surface text-muted hover:text-text border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filtered.map((charity) => (
            <motion.div
              key={charity.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <CharityCard charity={charity} />
            </motion.div>
          ))}
          {filtered.length === 0 && charities.length > 0 && (
            <div className="col-span-full py-20 text-center text-muted">
              No charities found matching your criteria.
            </div>
          )}
          {charities.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted">
              Loading charities...
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
