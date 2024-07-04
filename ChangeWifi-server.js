
const axios = require('axios');
const bonjour = require('bonjour')();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: "*",
}));

let esp8266Ip = null;
let discoveryInterval = null;
let connectionCheckInterval = null;
let statusMessage = "Starting ESP8266 discovery...";

// Update status message at various points in your code
const discoverESP8266 = () => {
  console.log("Starting ESP8266 discovery...");
  statusMessage = "Starting ESP8266 discovery...";
  
  bonjour.find({ type: 'http' }, service => {
    console.log("Found service:", service);
    if (service.name === 'MACTsDevice') {
      esp8266Ip = service.referer.address;
      console.log(`Discovered ESP8266 at IP address: ${esp8266Ip}`);
      statusMessage = `Discovered ESP8266 at IP address: ${esp8266Ip}`;

      if (discoveryInterval) {
        clearInterval(discoveryInterval);
        discoveryInterval = null;
        console.log("ESP8266 discovered, stopping further discovery attempts.");

        // Start checking the connection status
        startConnectionCheck();
      }
    } else {
      console.log(`Found service: ${service.name}, but not the expected MACTsDevice`);
    }
  }).on('error', err => {
    console.error("Bonjour error:", err);
    statusMessage = "Bonjour error: " + err.message;
  });
};

const startDiscovery = () => {
  // Call the discovery function initially and set an interval for continuous discovery
  discoverESP8266();
  discoveryInterval = setInterval(discoverESP8266, 30000); // Retry discovery every 30 seconds
};

const checkConnection = () => {
  if (!esp8266Ip) return;

  axios.get(`http://${esp8266Ip}/`)
    .then(response => {
      console.log("Connection check successful");
      statusMessage = "Connection check successful";
    })
    .catch(error => {
      console.error("Connection check failed, restarting discovery...");
      statusMessage = "Connection check failed, restarting discovery...";
      esp8266Ip = null;
      startDiscovery();
    });
};

// Add a new endpoint to get the current status
app.get('/status', (req, res) => {
  res.json({ status: statusMessage });
});

const startConnectionCheck = () => {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
  connectionCheckInterval = setInterval(checkConnection, 30000); // Check connection every 30 seconds
};

// Start the initial discovery process
startDiscovery();

// Endpoint to get the discovered ESP8266 IP
app.get('/esp8266-ip', (req, res) => {
  if (!esp8266Ip) {
    return res.status(500).send('ESP8266 not discovered yet');
  }
  res.json({ ip: esp8266Ip });
});

// Test endpoint to check connection to ESP8266
app.get('/test-connection', (req, res) => {
  if (!esp8266Ip) {
    return res.status(500).send('ESP8266 IP not set');
  }

  axios.get(`http://${esp8266Ip}/`)
    .then(response => {
      res.send(`Connection successful: ${response.data}`);
    })
    .catch(error => {
      res.status(500).send(`Connection failed: ${error.message}`);
    });
});

// Endpoint to update Wi-Fi settings on ESP8266
app.post('/update-wifi', (req, res) => {
  const { ssid, password } = req.body;

  if (!esp8266Ip) {
    return res.status(500).send('ESP8266 not discovered yet');
  }

  axios.post(`http://${esp8266Ip}/update-wifi`, { ssid, password })
    .then(response => {
      res.send('Wi-Fi settings updated successfully');
    })
    .catch(error => {
      res.status(500).send('Failed to update Wi-Fi settings');
    });
});

const port = 3434;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});