import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { computeRemaining } from "@/lib/user";
import { cn } from "@/lib/utils";
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
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-black text-2xl">
          <img
            src="https://i.ibb.co/KjddQYWn/osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak-osintleak.png"
            alt="Osint Info logo"
            className="h-10 w-10 rounded-lg"
          />
          <span className="leading-none">Osint Info</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "interactive-glass inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold tracking-tight text-foreground/75 shadow-[0_14px_32px_-28px_rgba(6,182,212,0.85)] transition-[color,shadow] duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "text-foreground shadow-[0_18px_42px_-26px_rgba(6,182,212,0.9)]"
                    : "hover:shadow-[0_18px_40px_-30px_rgba(6,182,212,0.8)]",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              {/* Remaining searches pill with dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative hidden overflow-hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-transform duration-300 [background-size:220%_220%] bg-[linear-gradient(115deg,#4ade80_0%,#06b6d4_50%,#38bdf8_100%)] hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    title="Searches remaining"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_55%)] opacity-70"
                    />
                    <span className="relative z-10 inline-flex items-center gap-3">
                      <span className="truncate text-xs font-black uppercase tracking-[0.35em]">
                        Balance
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-sm font-black leading-none">
                        {computeRemaining(profile)}
                      </span>
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
            <Button onClick={() => navigate("/auth")} title="Sign in">
              <LogIn />
              <span className="inline">Sign in</span>
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
                className={cn(
                  "interactive-glass rounded-xl px-3 py-2 text-sm font-semibold tracking-tight text-foreground/75 shadow-[0_10px_30px_-30px_rgba(6,182,212,0.75)] transition-[color,shadow] duration-300 hover:text-foreground",
                  location.pathname === item.to &&
                    "text-foreground shadow-[0_16px_40px_-28px_rgba(6,182,212,0.85)]",
                )}
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
