import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const location = useLocation();

  const [open, setOpen] = useState(false); // dropdown desktop
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Fecha menus ao trocar de rota
  useEffect(() => {
    setOpen(false);
    setMobileMenu(false);
  }, [location.pathname]);

  // Detecta scroll para shrink elegante
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 backdrop-blur-sm border-b border-neon-primary/10 transition-all duration-300 ${
        scrolled
          ? "bg-dark-bg/95 py-2"
          : "bg-gradient-to-b from-dark-bg/95 to-dark-bg/50 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex-shrink-0">
          <div
            className={`font-orbitron font-black tracking-wider transition-all duration-300 ${
              scrolled ? "text-base sm:text-xl" : "text-lg sm:text-2xl"
            }`}
          >
            <span className="bg-gradient-to-r from-neon-primary via-neon-secondary to-neon-primary bg-clip-text text-transparent drop-shadow-lg">
              ◇ DREAMS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-8 relative">
          <Link
            to="/gallery"
            className={`font-exo2 transition-all ${
              isActive("/gallery")
                ? "text-neon-primary"
                : "text-neon-secondary hover:text-neon-primary"
            }`}
          >
            Gallery
          </Link>

          <Link
            to="/submit"
            className={`font-exo2 transition-all ${
              isActive("/submit")
                ? "text-neon-primary"
                : "text-neon-secondary hover:text-neon-primary"
            }`}
          >
            Submit Dream
          </Link>

          {/* Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              onClick={() => setOpen(v => !v)}
              className={`font-exo2 transition-all ${
                location.pathname.startsWith("/dreams-")
                  ? "text-neon-primary"
                  : "text-neon-secondary hover:text-neon-primary"
              }`}
            >
              Explore Dreams
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-3 right-0 w-56 rounded-2xl bg-dark-bg/95 backdrop-blur-xl border border-neon-primary/20 shadow-glow-neon overflow-hidden"
                >
                  <Link
                    to="/dreams-about-dreams"
                    className="block px-5 py-3 text-sm text-neon-secondary hover:text-neon-primary hover:bg-neon-primary/5"
                  >
                    About Dreams
                  </Link>
                  <Link
                    to="/dreams-that-come-true"
                    className="block px-5 py-3 text-sm text-neon-secondary hover:text-neon-primary hover:bg-neon-primary/5"
                  >
                    Dreams That Come True
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </nav>

        {/* Mobile Hamburger (SVG animado) */}
        <button
          onClick={() => setMobileMenu(v => !v)}
          className="sm:hidden text-neon-primary"
          aria-label="Toggle menu"
        >
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            animate={mobileMenu ? "open" : "closed"}
          >
            <motion.line
              x1="3"
              y1="6"
              x2="21"
              y2="6"
              variants={{
                closed: { rotate: 0, translateY: 0 },
                open: { rotate: 45, translateY: 6 },
              }}
            />
            <motion.line
              x1="3"
              y1="12"
              x2="21"
              y2="12"
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 },
              }}
            />
            <motion.line
              x1="3"
              y1="18"
              x2="21"
              y2="18"
              variants={{
                closed: { rotate: 0, translateY: 0 },
                open: { rotate: -45, translateY: -6 },
              }}
            />
          </motion.svg>
        </button>
      </div>

      {/* Mobile Menu (swipe-to-close) */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -80) setMobileMenu(false);
            }}
            className="sm:hidden bg-dark-bg/95 backdrop-blur-xl border-t border-neon-primary/10"
          >
            <nav className="flex flex-col px-6 py-6 gap-4">
              <Link to="/gallery" className="text-neon-secondary hover:text-neon-primary">
                Gallery
              </Link>
              <Link to="/submit" className="text-neon-secondary hover:text-neon-primary">
                Submit Dream
              </Link>
              <Link to="/dreams-about-dreams" className="text-neon-secondary hover:text-neon-primary">
                About Dreams
              </Link>
              <Link to="/dreams-that-come-true" className="text-neon-secondary hover:text-neon-primary">
                Dreams That Come True
              </Link>

              <Link to="/submit" className="neon-button mt-4 text-center">
                Submit My Dream — Free
              </Link>

              <p className="text-xs text-neon-secondary/50 text-center mt-2">
                Swipe up to close
              </p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
