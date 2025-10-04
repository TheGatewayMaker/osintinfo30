import Layout from "@/components/layout/Layout";

export default function About() {
  return (
    <Layout>
      <section className="container mx-auto py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">About</h1>
          <p className="mt-3 text-foreground/80">
            We provide fast, privacy-first breach intelligence and Dark Web monitoring so you can detect, investigate, and respond before risks escalate.
          </p>
        </div>

        <div className="mx-auto mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Dark Web Monitoring</h2>
            <p className="mt-2 text-foreground/80">
              We continuously track marketplaces, forums, and data dumps to surface leaked credentials, emails, phone numbers, IPs, and domains tied to your organization.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Actionable Alerts</h2>
            <p className="mt-2 text-foreground/80">
              Custom alerts and integrations notify the right teams instantly with context to take action—no noisy feeds, just verified signals.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
