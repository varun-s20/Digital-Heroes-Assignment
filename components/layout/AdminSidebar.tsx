"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Trophy, HeartHandshake, Award, FileText, LogOut, ShieldAlert } from "lucide-react";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Draws", href: "/admin/draws", icon: Trophy },
  { name: "Charities", href: "/admin/charities", icon: HeartHandshake },
  { name: "Winners", href: "/admin/winners", icon: Award },
  { name: "Reports", href: "/admin/reports", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-[#050608] md:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-accent-warm" />
          <span className="font-fraunces text-xl font-bold italic tracking-tight">Admin Portal</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-warm/15 text-accent-warm border border-accent-warm/20"
                  : "text-muted hover:bg-white/5 hover:text-text"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition-colors">
          <LogOut className="h-4 w-4" />
          Exit Admin
        </button>
      </div>
    </aside>
  );
}
