import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, User } from "lucide-react";
import { motion } from "framer-motion";
import { TRANSITION_FAST } from "@/lib/motion";

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
              className="relative flex flex-col items-center justify-center min-w-[56px] h-full"
            >
              <motion.div whileTap={{ scale: 0.85 }} transition={TRANSITION_FAST}>
                <motion.div
                  animate={{ scale: active ? 1.12 : 1 }}
                  transition={TRANSITION_FAST}
                >
                  <Icon
                    size={23}
                    strokeWidth={active ? 2.2 : 1.5}
                    className={`transition-colors duration-200 ${
                      active ? "text-neon-primary drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]" : "text-neon-secondary/45"
                    }`}
                  />
                </motion.div>
              </motion.div>
              {active && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute bottom-1.5 w-1 h-1 rounded-full bg-neon-primary"
                  transition={TRANSITION_FAST}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
