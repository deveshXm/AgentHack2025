const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8000";

export async function uploadIntake(file: File): Promise<{ intakeId: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/api/intake`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("upload failed");
  return res.json();
}

export async function runIntake(id: string): Promise<{ runId: string }> {
  const res = await fetch(`${BASE}/api/intake/${id}/run`, { method: "POST" });
  if (!res.ok) throw new Error("run failed");
  return res.json();
}

export async function getIntake(id: string): Promise<any> {
  const res = await fetch(`${BASE}/api/intake/${id}`);
  if (!res.ok) throw new Error("get failed");
  return res.json();
}


