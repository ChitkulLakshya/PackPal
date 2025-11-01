import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane, Menu, X, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const navigate = useNavigate();
  
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 10);
      
      // Auto-hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Show navbar when mouse is near top (within 100px)
      if (e.clientY < 100) {
        setIsVisible(true);
        clearTimeout(timeoutId);
      } else {
        timeoutId = setTimeout(() => {
          if (window.scrollY > 100) {
            setIsVisible(false);
          }
        }, 2000);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <motion.nav
      initial={false}
      animate={{
        opacity: isVisible || isAtTop ? 1 : 0,
        y: isVisible || isAtTop ? 0 : -20,
      }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible || isAtTop
          ? "bg-background/80 backdrop-blur-md border-b border-border/50"
          : "pointer-events-none"
      }`}
      style={{ pointerEvents: isVisible || isAtTop ? "auto" : "none" }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
        >
          <Plane className="w-8 h-8" />
          <span>PackPal</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/my-trips"
            className="text-foreground hover:text-primary transition-colors"
          >
            My Trips
          </Link>
          <Link
            to="/about"
            className="text-foreground hover:text-primary transition-colors"
          >
            About
          </Link>

          <div className="flex items-center gap-2 ml-4">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome back, {user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/signup")}
                  className="bg-primary text-primary-foreground hover:opacity-90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/my-trips"
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Trips
              </Link>
              <Link
                to="/about"
                className="block text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                {user ? (
                  <>
                    <div className="text-sm text-muted-foreground mb-2">
                      Welcome back, {user.name}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigate("/login");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                    <Button
                      className="w-full bg-primary text-primary-foreground"
                      onClick={() => {
                        navigate("/signup");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

