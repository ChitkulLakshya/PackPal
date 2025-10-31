import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, Wind, Droplets, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: { main: string; description: string; icon: string }[];
  };
  daily: Array<{
    dt: number;
    temp: { day: number; min: number; max: number };
    weather: { main: string; description: string; icon: string }[];
  }>;
}

interface WeatherDisplayProps {
  latitude: number;
  longitude: number;
}

const WeatherDisplay = ({ latitude, longitude }: WeatherDisplayProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Note: Users need to add their OpenWeatherMap API key
        const API_KEY = localStorage.getItem('OPENWEATHER_API_KEY') || 'demo';
        const response = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError('Unable to load weather. Please add your OpenWeatherMap API key in settings.');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchWeather();
    }
  }, [latitude, longitude]);

  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'clouds':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Get a free API key at{' '}
            <a
              href="https://openweathermap.org/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenWeatherMap
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <div className="space-y-4">
      {/* Current Weather */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getWeatherIcon(weather.current.weather[0].main)}
              Current Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">{Math.round(weather.current.temp)}°C</p>
                <p className="text-xs text-muted-foreground">
                  Feels like {Math.round(weather.current.feels_like)}°C
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-xl font-semibold">{weather.current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Wind</p>
                  <p className="text-xl font-semibold">
                    {Math.round(weather.current.wind_speed)} m/s
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conditions</p>
                <p className="text-lg font-semibold capitalize">
                  {weather.current.weather[0].description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 5-Day Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {weather.daily.slice(0, 5).map((day, index) => (
                <div
                  key={day.dt}
                  className="text-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <p className="text-sm font-medium mb-2">
                    {new Date(day.dt * 1000).toLocaleDateString('en-US', {
                      weekday: 'short',
                    })}
                  </p>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(day.weather[0].main)}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize mb-1">
                    {day.weather[0].description}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">{Math.round(day.temp.max)}°</span>
                    <span className="text-muted-foreground"> / {Math.round(day.temp.min)}°</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WeatherDisplay;
