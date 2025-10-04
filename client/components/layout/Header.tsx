import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
  const navItems =
    profile?.role === "admin"
      ? [...baseNavItems, { to: "/admin", label: "Admin" }]
      : baseNavItems;
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-black text-xl">
          <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/30" />
          Osint Info
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-foreground/80 ${isActive ? "text-foreground" : "text-foreground/60"}`
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
                    className="relative overflow-visible hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-sm hover:bg-accent shadow-[0_0_20px_rgba(234,179,8,0.35)] ring-1 ring-amber-400/50"
                    title="Searches remaining"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -inset-0.5 rounded-full [mask:radial-gradient(farthest-side,transparent_calc(100%_-_3px),#000_calc(100%_-_0px))] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_340deg,rgba(245,158,11,0.95)_350deg,transparent_360deg)] opacity-80 blur-[2px] animate-[spin_4s_linear_infinite]"
                    />
                    <span className="relative z-10 inline-flex items-center gap-2">
                      <span className="max-w-[12rem] truncate font-semibold">
                        Balance
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 px-2 py-0.5 text-xs font-semibold">
                        {typeof profile?.totalSearchesRemaining === "number"
                          ? profile.totalSearchesRemaining
                          : 0}
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
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          )}

          <button
            className="md:hidden ml-2 inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
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
