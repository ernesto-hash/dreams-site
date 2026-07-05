import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, User } from "lucide-react";

const tabs = [
  { icon: Home,       label: "Home",     to: "/"           },
  { icon: Search,     label: "Discover", to: "/descobrir"  },
  { icon: PlusSquare, label: "Publish",  to: "/submit"     },
  { icon: User,       label: "Profile",  to: "/login"      },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-neon-primary/15 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ icon: Icon, label, to }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className="flex flex-col items-center justify-center min-w-[56px] h-full"
            >
              <Icon
                size={23}
                strokeWidth={active ? 2.2 : 1.5}
                className={active ? "text-neon-primary" : "text-neon-secondary/45"}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
