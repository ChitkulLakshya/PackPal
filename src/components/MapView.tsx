import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  destination: string;
  onCoordinatesFound?: (lat: number, lon: number) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 10);
  }, [center, map]);
  return null;
}

const MapView = ({ destination, onCoordinatesFound }: MapViewProps) => {
  const [coordinates, setCoordinates] = useState<[number, number]>([48.8566, 2.3522]); // Default to Paris
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination) return;

    const geocodeDestination = async () => {
      setLoading(true);
      try {
        // Using OpenStreetMap Nominatim API for geocoding (free)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoordinates([lat, lon]);
          onCoordinatesFound?.(lat, lon);
        }
      } catch (error) {
        console.error('Error geocoding destination:', error);
      } finally {
        setLoading(false);
      }
    };

    geocodeDestination();
  }, [destination, onCoordinatesFound]);

  if (loading) {
    return (
      <div className="w-full h-[300px] rounded-lg bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-border shadow-lg">
      <MapContainer
        center={coordinates}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates}>
          <Popup>{destination}</Popup>
        </Marker>
        <MapUpdater center={coordinates} />
      </MapContainer>
    </div>
  );
};

export default MapView;
