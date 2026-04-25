"use client";

import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function DevRolePanel() {
  const { role, setRole } = useAuth();
  const router = useRouter();

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === "visitor") {
      router.push("/");
    } else if (newRole === "subscriber") {
      router.push("/dashboard");
    } else if (newRole === "admin") {
      router.push("/admin");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-surface/90 px-4 py-2 shadow-lg backdrop-blur-md border border-border">
      <span className="text-xs font-semibold text-muted mr-2 uppercase tracking-wider">Dev Role</span>
      {(["visitor", "subscriber", "admin"] as Role[]).map((r) => (
        <button
          key={r}
          onClick={() => handleRoleChange(r)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            role === r
              ? "bg-accent text-bg font-medium"
              : "bg-transparent text-text hover:bg-white/5"
          }`}
        >
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </button>
      ))}
    </div>
  );
}
