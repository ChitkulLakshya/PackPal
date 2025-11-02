import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface WeatherReportProps {
  lat?: number;
  lon?: number;
  destinationName?: string;
}

const WeatherReport = ({ lat, lon, destinationName }: WeatherReportProps) => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!lat || !lon) {
        setWeather(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${
            import.meta.env.VITE_OPENWEATHER_API_KEY
          }&units=metric`
        );
        const data = await res.json();
        if (data.cod === 200) {
          setWeather(data);
        } else {
          setWeather(null);
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading weather...</span>
        </CardContent>
      </Card>
    );
  }

  if (!weather || !lat || !lon) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="shadow-lg border border-primary/20">
        <CardHeader>
          <CardTitle>Weather in {destinationName || weather.name}</CardTitle>
          <CardDescription>Live weather update</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</p>
              <p className="capitalize text-muted-foreground">{weather.weather[0].description}</p>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="w-16 h-16"
            />
          </div>
          <div className="mt-3 text-sm text-muted-foreground space-y-1">
            <p>🌡️ Feels like: {Math.round(weather.main.feels_like)}°C</p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
            <p>🌬️ Wind: {weather.wind.speed} m/s</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeatherReport;
