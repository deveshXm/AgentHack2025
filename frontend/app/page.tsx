"use client";
import { useState } from "react";
import { uploadIntake } from "../lib/api";
import { useRouter } from "next/navigation";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const { intakeId } = await uploadIntake(file);
      router.push(`/intake/${intakeId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>PT Prior-Auth (Demo)</h1>
      <form onSubmit={onSubmit}>
        <input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="submit" disabled={!file || loading} style={{ marginLeft: 8 }}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </main>
  );
}


