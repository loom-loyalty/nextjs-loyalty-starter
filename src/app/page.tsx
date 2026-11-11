import { connection } from "next/server";
import { Suspense } from "react";

import { Setup } from "@/components/setup";
import { loyaltyConfig } from "@/lib/config";
import { isError, memberSummary } from "@/lib/member";

export default function MemberPage() {
  return (
    <Suspense fallback={<MemberSkeleton />}>
      <Member />
    </Suspense>
  );
}

async function Member() {
  await connection();
  const loyalty = loyaltyConfig();
  if ("missing" in loyalty) {
    return <Setup title="Connect Loom Loyalty" missing={loyalty.missing} />;
  }
  const { points, tier, offers } = await memberSummary(loyalty.config);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My rewards</h1>

      <Card title="Points">
        {isError(points) ? (
          <Problem message={points.error} />
        ) : points.programs.length === 0 ? (
          <p className="text-muted">No points yet. Your first purchase starts earning.</p>
        ) : (
          <ul className="space-y-3">
            {points.programs.map((p) => (
              <li key={`${p.program}-${p.currency}`}>
                <p className="text-3xl font-semibold tabular-nums">
                  {p.available.toLocaleString()} <span className="text-base">{p.currency}</span>
                </p>
                <p className="text-sm text-muted">
                  {p.program}
                  {p.pending > 0 ? ` · ${p.pending.toLocaleString()} pending` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Tier">
        {isError(tier) ? (
          <Problem message={tier.error} />
        ) : tier.tiers.length === 0 ? (
          <p className="text-muted">No tier yet.</p>
        ) : (
          <ul className="space-y-2">
            {tier.tiers.map((t) => (
              <li key={t.tier}>
                <p className="text-xl font-semibold">{t.tier}</p>
                {t.nextTier ? <p className="text-sm text-muted">Next: {t.nextTier}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Offers">
        {isError(offers) ? (
          <Problem message={offers.error} />
        ) : offers.offers.length === 0 ? (
          <p className="text-muted">No offers right now.</p>
        ) : (
          <ul className="divide-y divide-border">
            {offers.offers.map((o) => (
              <li key={`${o.name}-${o.code ?? ""}`} className="py-2 first:pt-0 last:pb-0">
                <p className="font-medium">{o.name}</p>
                <p className="text-sm text-muted">
                  {o.code ? <span className="font-mono">{o.code}</span> : null}
                  {o.code && o.validUntil ? " · " : null}
                  {o.validUntil ? `Use by ${formatDate(o.validUntil)}` : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="rounded-lg border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Problem({ message }: { message: string }) {
  return (
    <p role="alert" className="text-sm">
      {message}
    </p>
  );
}

function MemberSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading your rewards">
      <div className="h-8 w-40 rounded bg-border" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 rounded-lg border border-border bg-surface" />
      ))}
    </div>
  );
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));
