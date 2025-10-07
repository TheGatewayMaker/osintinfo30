import Layout from "@/components/layout/Layout";

export default function About() {
  const features = [
    {
      title: "Real-Time Dark Web Monitoring",
      desc:
        "Track leaks across Tor, I2P, paste sites, and breach sources in near real time to spot risks early.",
    },
    {
      title: "Weekly New Database Updates",
      desc:
        "Fresh breach databases and dumps ingested weekly with normalization and de-duplication for clean search.",
    },
    {
      title: "Monitoring Marketplaces and Forums",
      desc:
        "Coverage across top marketplaces, carding shops, and underground forums for mentions of your assets.",
    },
    {
      title: "Monitoring Telegram Logs Marketplace",
      desc:
        "Continuously scan Telegram channels, groups, and log marketplaces for compromised data and chatter.",
    },
    {
      title: "Credential Exposure Detection",
      desc:
        "Identify exposed emails, phone numbers, usernames, IPs, and tokens tied to your company and domains.",
    },
    {
      title: "Actionable Alerts & Reporting",
      desc:
        "Custom alerts, weekly digests, and exportable reports keep security, fraud, and compliance teams aligned.",
    },
  ] as const;
  return (
    <Layout>
      <section className="container mx-auto py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            About
          </h1>
          <p className="mt-3 text-foreground/80">
            We provide fast, privacy-first breach intelligence and Dark Web
            monitoring so you can detect, investigate, and respond before risks
            escalate.
          </p>
        </div>

        <div className="mx-auto mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-foreground/80">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
