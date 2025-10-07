import Layout from "@/components/layout/Layout";

const RECENT_BREACHES = [
  {
    name: "NordCom Telecom",
    scope: "Telecom • EU",
    type: "Customer Database",
    size: "3.7M records",
    description:
      "Email, phone, hashed passwords, partial billing data exposed in recent dump.",
  },
  {
    name: "SkyCourier",
    scope: "Logistics • US",
    type: "User Accounts",
    size: "1.2M records",
    description:
      "Usernames, emails, delivery addresses and order metadata were leaked.",
  },
  {
    name: "PayXchange",
    scope: "Fintech • Global",
    type: "Auth Table",
    size: "680K records",
    description:
      "Credential combos and API keys surfaced from third‑party integrator breach.",
  },
  {
    name: "EduPortal",
    scope: "Education • UK",
    type: "Student Directory",
    size: "950K records",
    description:
      "Names, emails and enrollment info disclosed via misconfigured backup.",
  },
  {
    name: "CityCare",
    scope: "Healthcare • AU",
    type: "Patient Contacts",
    size: "420K records",
    description:
      "Contact details and appointment notes scraped from vendor portal.",
  },
  {
    name: "Shopora",
    scope: "Retail • CA",
    type: "Marketing DB",
    size: "2.3M records",
    description:
      "Email lists and campaign metrics leaked from email automation provider.",
  },
];

export default function Databases() {
  return (
    <Layout>
      <section className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-3xl font-black">Databases</h1>
          <p className="mt-2 text-foreground/80">
            Recently breached sources and exposed datasets.
          </p>
          <p className="mt-2 text-sm text-foreground/70 max-w-3xl mx-auto">
            Explore a snapshot of notable, recently discussed breaches. Data
            shown here is illustrative to protect sources.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RECENT_BREACHES.map((item) => (
            <article
              key={item.name}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-background/90 p-5 shadow-lg shadow-brand-500/10 transition-all duration-200 ease-[cubic-bezier(.2,.8,.2,1)] will-change-transform motion-safe:transform-gpu hover:-translate-y-1 hover:shadow-brand-500/20"
            >
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_300px_at_50%_-120px,theme(colors.cyan.500/0.14),transparent_60%)]" />
              <header className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                  {item.name}
                </h3>
                <span style={{display: 'block', backgroundColor: 'rgba(144, 19, 254, 0.23)', borderRadius: '9999px', boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(80, 37, 187, 0.4) 0px 0px 0px 1px, rgba(0, 0, 0, 0) 0px 0px 0px 0px', color: 'rgba(255, 255, 255, 1)', fontSize: '10.4px', fontWeight: 600, letterSpacing: '0.26px', lineHeight: '15.6px', textDecoration: 'rgb(15, 12, 39)', textTransform: 'uppercase', padding: '4px 12px'}}>
                  {item.size}
                </span>
              </header>
              <p className="mt-1 text-sm text-foreground/70">{item.scope}</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/60 bg-background/80 p-3 text-sm font-semibold text-foreground">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/50">
                    Database Type
                  </span>
                  <span className="mt-1 block">{item.type}</span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 p-3 text-sm font-semibold text-foreground">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-foreground/50">
                    Size
                  </span>
                  <span className="mt-1 block">{item.size}</span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                {item.description}
              </p>

              <div className="mt-5 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-transform duration-500 group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
