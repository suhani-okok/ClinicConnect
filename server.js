require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const User = require('./models/User');
const Location = require('./models/Location');
const userdetailsConnectionUri = process.env.MONGO_URI_USERDETAILS;



const app = express();
const port = 3007;


app.use(express.json()); 

console.log('MONGO_URI_USERDETAILS:', process.env.MONGO_URI_USERDETAILS);

// MongoDB Connection
mongoose.connect(userdetailsConnectionUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to userdetails database'))
  .catch(err => console.error('Error connecting to userdetails database:', err));


// Register Route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = new User({ email, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(400).send('Error registering user: ' + error.message);
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid email or password11');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password12');
    }

    res.status(200).send('Login successful');
  } catch (error) {
    res.status(500).send('Server error: ' + error.message);
  }
});


//add location route
app.post('/add-location', async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    const newLocation = new Location({
      latitude,
      longitude,
      address,
    });

    await newLocation.save();

    res.json({ message: "location added sucessfully", location: newLocation });
  } catch (err) {
    res.status(500).send("error adding the location", err);
  }
});


// Haversine formula function
function haversine(lat1, lon1, lat2, lon2) {
  const toRadians = angle => angle * (Math.PI / 180);
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

//finding nearest loation and displaying results route
app.post('/nearest-location', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
      const locations = await Location.find();

      let nearestLocation = null;
      let minDistance = Infinity;

      for (const location of locations) {
          const distance = haversine(latitude, longitude, location.latitude, location.longitude);

          if (distance < minDistance) {
              minDistance = distance;
              nearestLocation = location;
          }
      }

      if (nearestLocation) {
          res.json({
              message: "here's the detail about the nearest clinic",
              address: nearestLocation.address,
              latitude: nearestLocation.latitude,
              longitude: nearestLocation.longitude,
              distance: minDistance
          });
      } else {
          res.status(404).json({ message: 'No locations found' });
      }
  } catch (err) {
      console.error('Error retrieving locations:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3007)