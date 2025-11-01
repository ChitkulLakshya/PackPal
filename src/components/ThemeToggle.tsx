import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <Sun className="w-4 h-4" />
      </Button>
    );
  }

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      // If system, check current resolved theme
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "light" : "dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 relative"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
      <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;

