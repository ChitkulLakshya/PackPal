# PackPal - Smart Travel Packing Assistant 🧳

PackPal is a comprehensive travel planning web application that helps travelers create personalized packing checklists with real-time weather data, interactive maps, and travel mode suggestions.

## ✨ Features

### Core Featur
- **Multi-Destination Trip Planner**: Plan trips with multiple destinations, see routes on an interactive map
- **Destination Autocomplete**: Real-time destination search with coordinates using OpenStreetMap Nominatim
- **Weather & Temperature Overview**: Live weather data for all destinations with temperature, humidity, and conditions
- **Transport Options Comparison**: Compare plane ✈️, train 🚆, bus 🚌, and drive 🚗 with:
  - Travel time estimatestion
  - Cost approximations
  - CO₂ emissions calculations
  - Automatic highlighting of fastest and cheapest options
- **Trip Overview Dashboard**: Interactive dashboard showing:
  - All destinations with weather cards
  - Route connections on map
  - Total travel time and cost
  - CO₂ emissions summary
- **Interactive Map View**: Leaflet.js integration with:
  - Multiple destination markers
  - Route lines connecting destinations
  - Automatic bounds fitting
- **Smart Packing Lists**: Auto-generated checklists based on destination, trip type, and weather
- **User Authentication**: Secure login and signup system
- **Save Trips**: Store and manage multiple trips in MongoDB
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Leaflet.js / React-Leaflet** for interactive maps
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

### APIs
- **OpenWeatherMap API** - Weather data and forecasts
- **OpenStreetMap Nominatim** - Geocoding and destination search (free)
- **OSRM Routing API** - Route calculation and distance (free)
- Custom transport mode estimation with CO₂ calculations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd packpal
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 4. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/packpal
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/packpal

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000
```

#### Frontend API Configuration
The frontend is configured to connect to the backend at `http://localhost:5000`. If you need to change this, update `src/utils/api.ts`.

### 5. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition: https://www.mongodb.com/docs/manual/installation/
2. Start MongoDB service:
   ```bash
   # On macOS
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```
3. Your MongoDB will be running at `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Add your IP address to the whitelist (or use `0.0.0.0/0` for testing)
4. Create a database user with read/write permissions
5. Get your connection string and update `MONGODB_URI` in `.env`

### 6. Database Schema

The application will automatically create the following collections when you first use them:

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date
}
```

#### Trips Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  destination: String (required),
  coordinates: {
    lat: Number,
    lon: Number
  },
  tripType: String (enum: ["business", "leisure", "adventure", "family", "romantic", "solo"], required),
  startDate: Date (required),
  endDate: Date (required),
  weatherSummary: String,
  createdAt: Date
}
```

**No manual database setup is required** - Mongoose will create collections automatically.

### 7. Frontend Environment Variables

Create a `.env` file in the root directory (optional, for API keys):

```env
# OpenWeatherMap API Key (optional - can also be set via browser localStorage)
VITE_OPENWEATHER_API_KEY=your-openweather-api-key-here
```

**To get an OpenWeatherMap API key:**
1. Sign up for a free API key at https://openweathermap.org/api
2. Get your API key from the dashboard (free tier includes 1,000 calls/day)
3. Add it to your `.env` file or set it in browser localStorage:
   ```javascript
   localStorage.setItem('OPENWEATHER_API_KEY', 'your-api-key-here')
   ```

**Note:** Destination search uses OpenStreetMap Nominatim (free, no API key required). Route calculation uses OSRM (free, no API key required).

### 8. Start the Application

#### Terminal 1 - Start Backend Server
```bash
cd server
npm start
```
The backend will run on `http://localhost:5000`

#### Terminal 2 - Start Frontend Dev Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## 📱 Usage

### Multi-Destination Trip Planner
1. Navigate to **Trip Planner** from the home page
2. **Add Destinations**: Use the search box to find and add multiple destinations
3. **Set Trip Details**: Enter start/end dates and trip type
4. **View Route**: See all destinations connected on an interactive map
5. **Compare Transport**: View transport options between destinations (plane, train, bus, drive)
6. **Check Weather**: See live weather for each destination
7. **View Summary**: Check total time, cost, and CO₂ emissions
8. **Save Trip**: Save your multi-destination trip plan

### Single Destination Packing List
1. **Sign Up**: Create a new account or log in
2. **Create Trip**: Enter destination, dates, and trip type
3. **View Map**: See your destination on an interactive map
4. **Check Weather**: View current weather and 5-day forecast
5. **Compare Travel Modes**: See estimated costs and times
6. **Generate Checklist**: Get a smart packing list
7. **Track Progress**: Check off items as you pack
8. **Save Trip**: Save your trip for future reference
9. **Manage Trips**: View and manage all your saved trips

## 🗂️ Project Structure

```
packpal/
├── server/                 # Backend
│   ├── models/            # Mongoose models
│   │   ├── User.js
│   │   └── Trip.js
│   ├── routes/            # API routes
│   │   ├── authRoutes.js
│   │   └── tripRoutes.js
│   ├── middleware/        # Auth middleware
│   │   └── authMiddleware.js
│   ├── server.js          # Express server
│   ├── package.json
│   └── .env              # Environment variables
│
├── src/                   # Frontend
│   ├── components/        # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ThemeToggle.tsx # Dark/light mode toggle
│   │   ├── DestinationAutocomplete.tsx # Destination search with autocomplete
│   │   ├── TransportComparison.tsx # Transport options comparison
│   │   ├── TripOverview.tsx # Multi-destination trip dashboard
│   │   ├── MapView.tsx
│   │   ├── WeatherDisplay.tsx
│   │   ├── TravelModes.tsx
│   │   ├── PackingItem.tsx
│   │   ├── PackingCategory.tsx
│   │   └── ui/           # Shadcn UI components
│   ├── pages/            # Page components
│   │   ├── Index.tsx     # Landing page
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── TripPlanner.tsx # Multi-destination trip planner
│   │   ├── TripForm.tsx  # Single destination trip creation
│   │   ├── Destination.tsx # Single destination view
│   │   ├── Checklist.tsx # Packing checklist
│   │   └── MyTrips.tsx   # Saved trips
│   ├── utils/            # Utilities
│   │   ├── api.ts        # Axios config
│   │   └── packingListGenerator.ts
│   ├── App.tsx           # Main app & routing
│   ├── index.css         # Global styles
│   └── main.tsx
│
├── public/
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### Trips (Protected - requires JWT token)
- `POST /api/trips/save` - Save a new trip (supports both single and multi-destination trips)
  - Single destination: `{ destination, coordinates, tripType, startDate, endDate, ... }`
  - Multi-destination: `{ destinations: [{ name, coordinates }], route, totalTime, totalCost, totalCO2, ... }`
- `GET /api/trips/user/:id` - Get all trips for a user
- `DELETE /api/trips/:id` - Delete a trip

## 🎨 Design System

PackPal uses a custom design system with semantic color tokens:
- **Primary**: Travel-themed green (`hsl(142, 70%, 45%)`)
- **Secondary**: Ocean blue (`hsl(201, 89%, 48%)`)
- **Accent**: Coral (`hsl(14, 90%, 60%)`)

All components use these tokens for consistent theming and dark mode support.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check your connection string in `.env`
- For Atlas, verify IP whitelist and credentials

### Weather Not Loading
- Verify your OpenWeatherMap API key is valid
- Check browser console for errors
- API keys can take a few minutes to activate after creation

### Backend Connection Failed
- Ensure backend is running on port 5000
- Check for port conflicts
- Verify `baseURL` in `src/utils/api.ts`

### Map Not Displaying
- Check browser console for errors
- Ensure Leaflet CSS is imported
- Verify internet connection for map tiles

## 🚀 Deployment

### Backend (Heroku, Railway, Render)
1. Push code to Git repository
2. Connect to deployment platform
3. Set environment variables
4. Deploy

### Frontend (Netlify, Vercel)
1. Build the app: `npm run build`
2. Deploy the `dist` folder
3. Update backend URL in environment variables

## 📄 License

MIT License - feel free to use this project for learning or production!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Happy Packing with PackPal! ✈️🌍**
