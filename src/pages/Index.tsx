import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-travel.jpg";
import { CheckCircle2, MapPin, Cloud, List, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Never Forget Your
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {" "}Essentials{" "}
                </span>
                Again
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                PackPal creates smart, personalized packing lists based on your destination,
                trip type, and real-time weather data. Travel stress-free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => navigate("/new-trip")}
                  className="text-lg"
                >
                  Start Packing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/my-trips")}
                  className="text-lg"
                >
                  View My Trips
                </Button>
              </div>
            </div>

            <div className="animate-slide-up">
              <img
                src={heroImage}
                alt="Organized travel packing"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">How PackPal Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Smart packing lists in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="animate-scale-in shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Enter Trip Details</h3>
                <p className="text-muted-foreground">
                  Tell us your destination, dates, and trip type
                </p>
              </CardContent>
            </Card>

            <Card className="animate-scale-in shadow-lg hover:shadow-xl transition-shadow" style={{ animationDelay: "0.1s" }}>
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Get Smart Suggestions</h3>
                <p className="text-muted-foreground">
                  We analyze weather and trip type to suggest what you need
                </p>
              </CardContent>
            </Card>

            <Card className="animate-scale-in shadow-lg hover:shadow-xl transition-shadow" style={{ animationDelay: "0.2s" }}>
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <List className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Pack with Ease</h3>
                <p className="text-muted-foreground">
                  Check items off as you pack and track your progress
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold mb-4">Why Travelers Love PackPal</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of stress-free travelers
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Weather-based recommendations",
                "Trip type customization",
                "Progress tracking",
                "Save multiple trips",
                "Drag & drop interface",
                "Export and share lists",
              ].map((benefit, index) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start creating your personalized packing list today
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/new-trip")}
              className="text-lg animate-bounce-subtle"
            >
              Create Your First List
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
