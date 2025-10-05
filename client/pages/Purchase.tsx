import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export default function Purchase() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const initialSearches = useMemo(() => params.get("searches") || "", [params]);
  const accountEmail = user?.email || "";

  return (
    <Layout>
      <section className="container mx-auto py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-black">Purchase</h1>
        <p className="mt-2 text-foreground/70">
          Complete your purchase request below.
        </p>

        <form
          action="https://formspree.io/f/movkllyk"
          method="POST"
          className="mt-8 grid gap-6 max-w-2xl mx-auto rounded-2xl border border-border bg-card/80 p-6 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/10 backdrop-blur"
        >
          <input type="hidden" name="formType" value="purchase" />
          <div className="grid gap-2">
            <label htmlFor="searches" className="text-sm font-medium">
              Number of Searches
            </label>
            <input
              id="searches"
              name="searches"
              inputMode="numeric"
              pattern="[0-9]*"
              defaultValue={initialSearches}
              required
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="accountEmail" className="text-sm font-medium">
              Your Account Email address
            </label>
            <input
              id="accountEmail"
              name="accountEmail"
              type="email"
              defaultValue={accountEmail}
              required
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="contactEmail" className="text-sm font-medium">
              Your contact Email address (leave if same)
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              placeholder="Optional if same as account email"
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="paymentMethod" className="text-sm font-medium">
              Select Payment Method
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              className="rounded-md border border-input bg-background px-3 py-2"
              defaultValue=""
            >
              <option value="" disabled>
                Select a method
              </option>
              <option>Crypto (LTC)</option>
              <option>Crypto (BTC)</option>
              <option>Crypto (XRP)</option>
              <option>Crypto (USDT)</option>
              <option>Paypal</option>
              <option>Bank Transaction</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="note" className="text-sm font-medium">
              Note (Optional)
            </label>
            <textarea
              id="note"
              name="note"
              rows={5}
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-md bg-foreground text-background px-6 font-medium transition-transform hover:scale-[1.02]"
          >
            Submit Purchase Request
          </button>
        </form>
      </section>
    </Layout>
  );
}
