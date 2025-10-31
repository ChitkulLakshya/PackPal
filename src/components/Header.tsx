import { Link } from "react-router-dom";
import { Plane } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Plane className="w-8 h-8" />
          <span>PackPal</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/trip-planner" className="text-foreground hover:text-primary transition-colors">
              Trip Planner
            </Link>
            <Link to="/new-trip" className="text-foreground hover:text-primary transition-colors">
              New Trip
            </Link>
            <Link to="/my-trips" className="text-foreground hover:text-primary transition-colors">
              My Trips
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
