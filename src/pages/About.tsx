import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, MapPin, Navigation, Globe } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold mb-4">About PackPal</h1>
              <p className="text-xl text-muted-foreground">
                Your smart travel companion for planning routes and organizing trips
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardContent className="pt-6">
                  <Navigation className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Route Planning</h3>
                  <p className="text-muted-foreground">
                    Visualize routes from your current location to any destination worldwide.
                    See your journey mapped out with interactive maps.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <MapPin className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Smart Suggestions</h3>
                  <p className="text-muted-foreground">
                    Get intelligent destination autocomplete suggestions as you type.
                    Find cities, landmarks, and places around the globe.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Plane className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Trip Management</h3>
                  <p className="text-muted-foreground">
                    Save your favorite routes and destinations. Access your trips
                    anytime, anywhere.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Globe className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Global Coverage</h3>
                  <p className="text-muted-foreground">
                    Plan routes anywhere in the world. Powered by OpenStreetMap
                    for accurate and up-to-date geographic data.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-12">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                <ol className="space-y-4 list-decimal list-inside">
                  <li className="text-muted-foreground">
                    Allow location access to detect your current position
                  </li>
                  <li className="text-muted-foreground">
                    Type your destination in the search box
                  </li>
                  <li className="text-muted-foreground">
                    Select from autocomplete suggestions
                  </li>
                  <li className="text-muted-foreground">
                    View your route on an interactive map
                  </li>
                  <li className="text-muted-foreground">
                    Save your trip for later (requires account)
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;

