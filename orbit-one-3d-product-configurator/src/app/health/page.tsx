import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";

  const response = await fetch(`${proto}://${host}/api/health`, { cache: "no-store" }).catch(() => null);
  const data = response?.ok ? await response.json() : null;

  return (
    <main className="health-page">
      <div className="health-card">
        <p className="eyebrow">System check</p>
        <h1>Health check</h1>
        <p className="health-copy">
          This page verifies that the deployed Next.js health endpoint returns data.
        </p>
        <div className="health-status">
          <span className={`status-dot ${data ? "online" : ""}`} />
          <strong>{data ? "Operational" : "Open the API endpoint directly to verify"}</strong>
        </div>
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        {!data && <a href="/api/health">Open /api/health →</a>}
      </div>
    </main>
  );
}
