/** Shown instead of the app when settings are missing, so a fresh deploy explains itself. */
export function Setup({ missing, title }: { missing: string[]; title: string }) {
  return (
    <section aria-labelledby="setup-title" className="rounded-lg border border-border bg-surface p-6">
      <h1 id="setup-title" className="text-xl font-semibold">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted">Set these environment variables, then reload:</p>
      <ul className="mt-3 list-disc pl-5 font-mono text-sm">
        {missing.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">
        <li>
          In the Loom Loyalty dashboard, open <strong>Developers → API Keys</strong>, create a key
          and give it only the read-only <strong>AI Bot</strong> role.
        </li>
        <li>
          Set <code>LOOM_LOYALTY_API_URL</code> (for example <code>https://api.loomloyalty.com</code>)
          and <code>LOOM_LOYALTY_API_KEY</code>.
        </li>
        <li>
          Set <code>LOOM_LOYALTY_DEMO_CUSTOMER_EXTERNAL_ID</code> to a customer&apos;s external id.
          A real app uses its signed-in shopper instead.
        </li>
        <li>
          For the assistant: deploy on Vercel (AI Gateway signs in with OIDC), or set{" "}
          <code>AI_GATEWAY_API_KEY</code> locally.
        </li>
      </ol>
      <p className="mt-4 text-sm text-muted">
        Locally, copy <code>.env.example</code> to <code>.env.local</code>. On Vercel, add them under
        Project → Settings → Environment Variables and redeploy.
      </p>
    </section>
  );
}
