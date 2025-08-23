"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { getIntake, runIntake } from "../../../lib/api";
import { useState } from "react";

export default function IntakePage() {
  const params = useParams();
  const id = params?.id as string;
  const { data, mutate, isLoading } = useSWR(id ? ["intake", id] : null, () => getIntake(id), { refreshInterval: 1500 });
  const [running, setRunning] = useState(false);
  const verifying = running || (data && !data.eligibility);

  async function onRun() {
    setRunning(true);
    try {
      await runIntake(id);
      await mutate();
    } finally {
      setRunning(false);
    }
  }

  return (
    <main style={{ maxWidth: 920, margin: "24px auto", padding: 16 }}>
      <h2>Intake #{id}</h2>
      <button onClick={onRun} disabled={running} style={{ marginBottom: 12 }}>
        {running ? "Verifying insurance…" : "Run end-to-end"}
      </button>
      {isLoading ? (
        <div>Loading...</div>
      ) : verifying ? (
        <div style={{ padding: 8, background: "#fff8e1", marginBottom: 12 }}>Verifying insurance… this may take ~6 seconds.</div>
      ) : (
        <pre style={{ whiteSpace: "pre-wrap", background: "#f6f6f6", padding: 12 }}>
{JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}


