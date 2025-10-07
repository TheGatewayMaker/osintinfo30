import Layout from "@/components/layout/Layout";

export default function Terms() {
  return (
    <Layout>
      <section className="container mx-auto max-w-4xl py-12">
        <h1 className="text-3xl font-black tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Last updated: October 2025
        </p>

        <div className="mt-8 grid gap-8">
          <section>
            <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
            <p className="mt-2 text-foreground/80">
              By accessing or using Osint Info, you agree to these Terms of
              Service. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Service Description</h2>
            <p className="mt-2 text-foreground/80">
              Osint Info lets you check whether identifiers like emails, phone
              numbers, usernames, IPs or domains appear in publicly available
              breach datasets. Results are provided for informational and
              security purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. Accounts and Security</h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-foreground/80">
              <li>
                You must provide accurate account information and keep your
                credentials secure.
              </li>
              <li>You are responsible for activity under your account.</li>
              <li>
                We may suspend or terminate accounts to protect the service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Acceptable Use</h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-foreground/80">
              <li>
                Use results only for lawful, authorized security and compliance
                purposes.
              </li>
              <li>
                Do not attempt to re-identify individuals from aggregated data
                or misuse exposed credentials.
              </li>
              <li>
                Do not scrape, reverse engineer, or overload the service or its
                providers.
              </li>
              <li>
                No use for harassment, discrimination, or surveillance that
                violates rights or law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              5. Credits, Billing and Refunds
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-foreground/80">
              <li>
                Searches are deducted from your balance when results are
                successfully returned.
              </li>
              <li>
                Purchases (e.g., via Telegram or email) credit searches to your
                account’s unique ID once confirmed.
              </li>
              <li>
                Except where required by law, purchases are non‑refundable after
                crediting your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Intellectual Property</h2>
            <p className="mt-2 text-foreground/80">
              The service, branding, and UI are owned by Osint Info or its
              licensors. You may not use our trademarks or copy substantial
              parts of the service without permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Disclaimers</h2>
            <p className="mt-2 text-foreground/80">
              The service is provided “as is” without warranties of any kind.
              Data sources may be incomplete, outdated, or inaccurate. You rely
              on results at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">8. Limitation of Liability</h2>
            <p className="mt-2 text-foreground/80">
              To the maximum extent permitted by law, Osint Info and its
              operators will not be liable for any indirect, incidental,
              special, consequential or punitive damages, or any loss of
              profits, data, or goodwill.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">9. Termination</h2>
            <p className="mt-2 text-foreground/80">
              We may suspend or terminate your access if you violate these Terms
              or if necessary to protect the service. You may stop using the
              service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">10. Changes</h2>
            <p className="mt-2 text-foreground/80">
              We may update these Terms from time to time. We will update the
              date above when changes take effect. Continued use constitutes
              acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">11. Contact</h2>
            <p className="mt-2 text-foreground/80">
              For questions about these Terms, contact{" "}
              <a className="underline" href="mailto:lattes-tarns-0f@icloud.com">
                lattes-tarns-0f@icloud.com
              </a>{" "}
              or Telegram{" "}
              <a
                className="underline"
                href="https://t.me/Osint_Info_supportbot"
                target="_blank"
                rel="noreferrer noopener"
              >
                @Osint_Info_supportbot
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </Layout>
  );
}
