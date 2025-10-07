import Layout from "@/components/layout/Layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="container mx-auto max-w-4xl py-12">
        <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-foreground/60">Last updated: October 2025</p>

        <div className="mt-8 grid gap-8">
          <section>
            <h2 className="text-xl font-bold">Overview</h2>
            <p className="mt-2 text-foreground/80">
              Osint Info helps you check whether specific data (for example email, phone, username, IP or domain) appears in publicly available breach datasets. We design for privacy: your search queries are processed just-in-time to fetch results and are not stored to build profiles about you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Information We Collect</h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-foreground/80">
              <li>
                Account information: when you sign in, we receive basic profile data from the selected provider (e.g. email and UID). We use this to manage access and your search balance.
              </li>
              <li>
                Usage and balances: we store counts of free, purchased and used searches and a unique purchase ID to credit your account.
              </li>
              <li>
                Operational logs: minimal server logs (timestamps, status codes, performance metrics) are kept to operate the service and prevent abuse. These logs are not linked to the contents of your queries.
              </li>
              <li>
                Payments: purchases are coordinated via Telegram or email; we do not collect or store card details on our servers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">Search Queries</h2>
            <p className="mt-2 text-foreground/80">
              Queries you type are used to request results from our data sources and to render a response to you. We do not permanently store raw queries or sell them. We may record an anonymized event that a search occurred (for example “a query succeeded/failed”) to protect the service and to apply rate-limits and credits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Cookies and Local Storage</h2>
            <p className="mt-2 text-foreground/80">
              We use cookies or similar local storage primarily for authentication and session security. You can control cookies in your browser settings, but the service may not function correctly without them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">How We Use Information</h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-foreground/80">
              <li>Authenticate users and secure the service.</li>
              <li>Provide, maintain and improve search features and performance.</li>
              <li>Enforce rate-limits and apply search credits.</li>
              <li>Communicate essential updates about your account or purchases.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">Data Sharing</h2>
            <p className="mt-2 text-foreground/80">
              We do not sell your personal information. We may share minimal data with service providers as needed to run the app (for example authentication, hosting, analytics strictly for reliability, or messaging). These providers act on our instructions and are bound by appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Data Retention</h2>
            <p className="mt-2 text-foreground/80">
              Account and balance data are retained while your account remains active. Operational logs are kept for a limited time for security and troubleshooting and are then deleted or aggregated. We do not keep raw query contents beyond what is strictly necessary to fulfill your request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Your Rights</h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-foreground/80">
              <li>Access, update or delete your account data.</li>
              <li>Request a copy of the data we maintain about you.</li>
              <li>Object to certain processing or withdraw consent where applicable.</li>
            </ul>
            <p className="mt-2 text-foreground/80">
              To exercise rights, contact us using the details below. We will verify your request to protect your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Security</h2>
            <p className="mt-2 text-foreground/80">
              We implement industry-standard measures including encrypted transport (HTTPS), role-based access and continuous hardening. No online service can be 100% secure, but we work to protect your data and our infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Children’s Privacy</h2>
            <p className="mt-2 text-foreground/80">
              The service is not directed to children under 13 and we do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Changes to This Policy</h2>
            <p className="mt-2 text-foreground/80">
              We may update this Privacy Policy to reflect changes to the service or law. We will post the updated date above. Continued use of the service after an update constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Contact</h2>
            <p className="mt-2 text-foreground/80">
              For privacy questions or requests, contact us at <a className="underline" href="mailto:lattes-tarns-0f@icloud.com">lattes-tarns-0f@icloud.com</a> or on Telegram at <a className="underline" href="https://t.me/Osint_Info_supportbot" target="_blank" rel="noreferrer noopener">@Osint_Info_supportbot</a>.
            </p>
          </section>
        </div>
      </section>
    </Layout>
  );
}
