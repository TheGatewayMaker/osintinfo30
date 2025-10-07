import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { computeRemaining } from "@/lib/user";
import { LogIn } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

const baseNavItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/databases", label: "Databases" },
  { to: "/contact", label: "Contact" },
  { to: "/shop", label: "Shop" },
];

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navItems = baseNavItems;
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-3 font-black text-2xl">
          <img
            src="https://i.ibb.co/27yVz2jK/osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak.png"
            alt="Osint Leak logo"
            className="h-10 w-10 rounded-lg"
          />
          <span className="hidden sm:inline leading-none">Osint Info</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative text-sm font-semibold tracking-tight transition-all ${isActive ? "text-foreground" : "text-foreground/70"} hover:text-foreground after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-amber-400/70 after:transition-transform hover:after:scale-x-100`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="inline-flex">
            <ThemeToggle />
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {/* Remaining searches pill with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative inline-flex overflow-hidden items-center rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100 shadow-[0_12px_22px_-18px_rgba(15,23,42,0.72)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-amber-300/40 dark:bg-amber-500/15"
                    title="Searches remaining"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,215,99,0.32),transparent_70%)] opacity-80"
                    />
                    <span className="relative z-10 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-amber-50">
                      <span className="hidden sm:inline">Balance:</span>{" "}
                      {computeRemaining(profile)}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => navigate("/shop")}>
                    Increase searches
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User avatar with menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
                    <Avatar className="h-9 w-9 select-none">
                      <AvatarImage
                        src={user.photoURL || undefined}
                        alt="User"
                      />
                      <AvatarFallback>
                        <UserIcon className="h-5 w-5 opacity-70" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={async () => {
                      try {
                        await signOut();
                        navigate("/");
                      } catch (e) {
                        console.warn("Sign out failed", e);
                      }
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              title="Sign in"
              className="px-2 sm:px-4"
            >
              <LogIn />
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          )}

          <button
            className="md:hidden ml-2 inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border">
          <div className="container py-2 grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`rounded px-3 py-2 hover:bg-accent ${location.pathname === item.to ? "bg-accent" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
