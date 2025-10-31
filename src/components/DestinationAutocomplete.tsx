import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface DestinationSuggestion {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  displayName: string;
}

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (destination: DestinationSuggestion) => void;
  placeholder?: string;
  className?: string;
}

const DestinationAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search destination (e.g., Paris, New York)...",
  className,
}: DestinationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchDestinations(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchDestinations = async (query: string) => {
    setLoading(true);
    try {
      // Use Nominatim (OpenStreetMap) - free and reliable
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=10&addressdetails=1`
      );
      const nominatimData = await nominatimResponse.json();

      if (Array.isArray(nominatimData) && nominatimData.length > 0) {
        const mapped = nominatimData
          .filter((item) => item.lat && item.lon)
          .map((item) => ({
            name: item.name || item.display_name.split(",")[0],
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            country: item.address?.country,
            displayName: item.display_name,
          }));
        setSuggestions(mapped);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error searching destinations:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (suggestion: DestinationSuggestion) => {
    onChange(suggestion.displayName);
    onSelect(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1"
          >
            <Card className="max-h-64 overflow-y-auto shadow-lg border">
              <div className="p-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.name}-${suggestion.lat}-${suggestion.lon}-${index}`}
                    onClick={() => handleSelect(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {suggestion.name}
                      </div>
                      {suggestion.country && (
                        <div className="text-xs text-muted-foreground truncate">
                          {suggestion.country}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationAutocomplete;

