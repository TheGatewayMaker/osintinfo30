export function Footer() {
  return (
    <footer className="border-t border-border mt-12">
      <div className="container mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/70 text-center">
        <div className="flex items-center gap-2 font-semibold">
          <img
            src="https://i.ibb.co/KjddQYWn/osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak.png"
            alt="Osint Info logo"
            className="h-5 w-5 rounded-lg"
          />
          <span>Osint Info</span>
        </div>
        <p className="text-center">
          © {new Date().getFullYear()} Osint Info. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a className="hover:text-foreground" href="/privacy">
            Privacy
          </a>
          <a className="hover:text-foreground" href="/terms">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
