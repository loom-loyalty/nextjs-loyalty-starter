# Loyalty storefront starter

A Next.js storefront page and shopper chat on [Loom Loyalty](https://loomloyalty.com) and the [Vercel AI SDK](https://ai-sdk.dev).

- **My rewards** (`/`): the shopper's points, tier and offers.
- **Ask the assistant** (`/assistant`): a chat that answers "How many points do I have?", "What tier am I?" and "Do I have any coupons?" from the shopper's real account, using the read-only tools in [`@loom-loyalty/ai-sdk`](https://www.npmjs.com/package/@loom-loyalty/ai-sdk).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Floom-loyalty%2Fnextjs-loyalty-starter&env=LOOM_LOYALTY_API_URL,LOOM_LOYALTY_API_KEY,LOOM_LOYALTY_DEMO_CUSTOMER_EXTERNAL_ID&envDescription=A%20read-only%20Loom%20Loyalty%20API%20key%20and%20the%20external%20id%20of%20a%20customer%20to%20show&envLink=https%3A%2F%2Fgithub.com%2Floom-loyalty%2Fnextjs-loyalty-starter%23set-up&project-name=loyalty-storefront&repository-name=loyalty-storefront)

## Set up

1. In the Loom Loyalty dashboard, open **Developers → API Keys** and create a key. Open **Manage Roles** on it and leave it only the read-only **AI Bot** role. The app only reads.
2. Create a **test customer** to show (not a real shopper: a deployed demo is public, so anyone can see this customer's points and coupon codes), and copy their **External ID**.
3. Set the environment variables:

| Variable                                 | Value                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| `LOOM_LOYALTY_API_URL`                   | `https://api.loomloyalty.com`                                                   |
| `LOOM_LOYALTY_API_KEY`                   | The key from step 1. Server only; it never reaches the browser.                 |
| `LOOM_LOYALTY_DEMO_CUSTOMER_EXTERNAL_ID` | The external id from step 2. Stands in for your signed-in shopper (see below).  |
| `AI_GATEWAY_API_KEY`                     | Local development only. On Vercel, AI Gateway signs in with the project's OIDC token; AI Gateway must be enabled for your team. |
| `AI_MODEL` (optional)                    | Any [AI Gateway](https://vercel.com/ai-gateway) model id. Defaults to `anthropic/claude-haiku-5.5`. |

The **Deploy** button asks for the first three. Until they're set, each page shows these steps instead of an error.

### Run locally

```bash
cp .env.example .env.local   # then fill it in
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Make it yours

### Sign the shopper in first

This starter shows one fixed customer so it works out of the box. **A real store must not do that on a public site.** Sign the shopper in with your own auth, then pass their id:

```ts
// src/app/api/chat/route.ts
const shopper = await getSignedInShopper(req); // your auth
const tools = toolsFor(loyalty.config, shopper.externalId);
```

Never take the customer id from the request body or the model. The tools are bound to one shopper when you create them, and the model can't change who they read.

Loom Loyalty doesn't sign shoppers in: this is a server-to-server integration, and your app decides who the shopper is.

### Limits on the public assistant

`/api/chat` allows 10 messages a minute per IP. It keeps only the text of the last 20 user and assistant messages (1,000 characters each, 6,000 in all) and drops anything else a caller sends, such as system messages or files. Each reply is at most 4 model steps of up to 400 tokens.

The per-IP count is kept in memory, so it resets on restart and isn't shared between instances. It trusts `x-forwarded-for`, which Vercel sets; on another host, a client can set that header itself. For production, use a shared store or a [Vercel Firewall](https://vercel.com/docs/vercel-firewall) rate-limit rule.

### Nothing is written

The tools only read. Nothing in this starter creates events, points or coupons, so a demo never changes a real account.

## Checks

```bash
pnpm lint
pnpm check:key   # builds with a made-up key and fails if it shows up in browser JavaScript
```

## License

Apache-2.0
