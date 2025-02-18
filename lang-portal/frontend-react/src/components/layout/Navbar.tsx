import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  ListChecks,
  FolderKanban,
  History,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/study-activities", label: "Study Activities", icon: BookOpen },
  { href: "/words", label: "Words", icon: ListChecks },
  { href: "/groups", label: "Word Groups", icon: FolderKanban },
  { href: "/sessions", label: "Sessions", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-background">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex h-16 items-center space-x-8">
          <div className="text-xl font-bold text-primary">Thai Learning</div>
          <div className="flex space-x-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <a
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
