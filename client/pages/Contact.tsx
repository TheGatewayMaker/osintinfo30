import Layout from "@/components/layout/Layout";

export default function Contact() {
  return (
    <Layout>
      <section className="container mx-auto py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-black">Contact</h1>
        <p className="mt-2 text-foreground/70">
          We usually respond within 24 hours.
        </p>

        <form
          action="https://formspree.io/f/mnngvokw"
          method="POST"
          className="mt-8 grid gap-6 max-w-2xl mx-auto rounded-2xl border border-border bg-card/80 p-6 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                required
                className="rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                required
                className="rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="whatsapp" className="text-sm font-medium">
              WhatsApp (optional)
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              required
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-md bg-foreground text-background px-6 font-medium hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </form>
      </section>
    </Layout>
  );
}
