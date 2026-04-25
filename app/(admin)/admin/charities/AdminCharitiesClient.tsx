"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { addCharity, updateCharity, deleteCharity } from "@/app/actions/charities";
import { useRouter } from "next/navigation";

interface Charity {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  image_url: string | null;
  total_raised: number;
  is_active: boolean;
}

interface Props {
  charities: Charity[];
}

const emptyForm = {
  name: "",
  slug: "",
  category: "other",
  description: "",
  image_url: "",
  is_active: true,
};

export default function AdminCharitiesClient({ charities }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name") {
      setForm((prev) => ({
        ...prev,
        name: value,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      }));
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const openEdit = (charity: Charity) => {
    setEditingId(charity.id);
    setForm({
      name: charity.name,
      slug: charity.slug,
      category: charity.category,
      description: charity.description ?? "",
      image_url: charity.image_url ?? "",
      is_active: charity.is_active,
    });
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.category) {
      setError("Name and category are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      let result;
      if (editingId) {
        result = await updateCharity(editingId, form);
      } else {
        result = await addCharity(form);
      }
      if (!result.success) {
        setError(result.error ?? "Operation failed.");
        return;
      }
      setSuccess(editingId ? "Charity updated." : "Charity added.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deleteCharity(id);
      if (!result.success) {
        setError(result.error ?? "Delete failed.");
        setConfirmDeleteId(null);
        return;
      }
      setSuccess("Charity deleted.");
      setConfirmDeleteId(null);
      router.refresh();
    });
  };

  const columns = [
    {
      header: "Charity",
      cell: (c: Charity) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded overflow-hidden bg-surface border border-border shrink-0">
            {c.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                No img
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{c.name}</div>
            <div className="text-xs text-muted">/{c.slug}</div>
          </div>
        </div>
      ),
    },
    { header: "Category", accessorKey: "category" as keyof Charity },
    {
      header: "Total Raised",
      cell: (c: Charity) => (
        <span className="font-mono text-accent-warm">
          £{Number(c.total_raised).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (c: Charity) => (
        <Badge variant={c.is_active ? "success" : "secondary"}>
          {c.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (c: Charity) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted hover:text-text"
            onClick={() => openEdit(c)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {confirmDeleteId === c.id ? (
            <div className="flex gap-1">
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs"
                disabled={isPending}
                onClick={() => handleDelete(c.id)}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/10"
              onClick={() => setConfirmDeleteId(c.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-fraunces font-bold mb-1">
            Charities Directory
          </h1>
          <p className="text-muted">
            Manage charity profiles and view contribution stats.
          </p>
        </div>
        <Button
          className="bg-accent-warm text-black hover:bg-accent-warm/90 shadow-[0_0_15px_rgba(245,166,35,0.2)]"
          onClick={openAdd}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Charity
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-lg bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-fraunces">
              {editingId ? "Edit Charity" : "Add New Charity"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-name">Name *</Label>
              <Input
                id="c-name"
                value={form.name}
                onChange={(e) => handleField("name", e.target.value)}
                placeholder="Cancer Research Partners"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-slug">Slug (auto-generated)</Label>
              <Input
                id="c-slug"
                value={form.slug}
                onChange={(e) => handleField("slug", e.target.value)}
                placeholder="cancer-research-partners"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-cat">Category *</Label>
              <select
                id="c-cat"
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text"
                value={form.category}
                onChange={(e) => handleField("category", e.target.value)}
              >
                <option value="environment">Environment</option>
                <option value="health">Health</option>
                <option value="community">Community</option>
                <option value="sport">Sport</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-img">Image URL</Label>
              <Input
                id="c-img"
                value={form.image_url}
                onChange={(e) => handleField("image_url", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="c-desc">Description</Label>
              <textarea
                id="c-desc"
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => handleField("description", e.target.value)}
                placeholder="A short description of this charity..."
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="c-active"
                checked={form.is_active}
                onChange={(e) => handleField("is_active", e.target.checked)}
                className="h-4 w-4 rounded border-border bg-bg text-accent focus:ring-accent"
              />
              <Label htmlFor="c-active">Active (Visible on platform)</Label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingId ? "Update Charity" : "Add Charity"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <DataTable
        data={charities}
        columns={columns}
        keyExtractor={(c) => c.id}
      />
    </div>
  );
}
