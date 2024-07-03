// const { SerialPort } = require('serialport');
// const { ReadlineParser } = require('@serialport/parser-readline');
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const port = process.env.PORT || 3535;

// app.use(bodyParser.json());
// app.use(cors({
//   origin: "*",
// }));

// let serialPort; // Define serialPort as a global variable
// let arduinoMessages = []; // Array to store Arduino messages

// function initializeSerialPort() {
//   serialPort = new SerialPort({
//     path: 'COM5', // Replace with the appropriate COM port
//     baudRate: 9600
//   });

//   const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

//   parser.on('data', (line) => {
//     console.log(`Received from Arduino: ${line}`);
//     arduinoMessages.push(line); // Store message in array
//   });

//   serialPort.on('error', (err) => {
//     console.error('Serial port error:', err.message);
//     if (err.message.includes('File not found')) {
//       console.log('COM5 not available yet...');
//       serialPort = null; // Reset serialPort variable
//     }
//   });

//   serialPort.on('open', () => {
//     console.log('Serial port opened');
//     // Optionally, you can send an initialization command once port is opened
//     // Example: serialPort.write('INIT\n');
//   });

//   serialPort.on('close', () => {
//     console.log('Serial port closed');
//     serialPort = null; // Reset serialPort variable
//   });
// }

// function checkAndInitializeSerialPort() {
//   SerialPort.list().then((ports) => {
//     const com5Exists = ports.some(port => port.path === 'COM5');
//     if (com5Exists && !serialPort) {
//       console.log('COM5 found, initializing serial port...');
//       initializeSerialPort();
//     } else if (!com5Exists && serialPort) {
//       console.log('COM5 disconnected, closing serial port...');
//       serialPort.close();
//     }
//   }).catch((err) => {
//     console.error('Error listing serial ports:', err.message);
//   });
// }

// // Initialize serial port check on application startup
// checkAndInitializeSerialPort();

// // Check for COM5 availability every 10 seconds (adjust interval as needed)
// setInterval(checkAndInitializeSerialPort, 10000);

// // Endpoint to update WiFi configuration
// app.post('/update-wifi', (req, res) => {
//   if (!serialPort) {
//     return res.status(500).send('Serial port not available');
//   }

//   const { ssid, password } = req.body;
//   const wifiConfig = JSON.stringify({ ssid, password });

//   serialPort.write(`${wifiConfig}\n`, (err) => {
//     if (err) {
//       console.error('Error writing to serial port:', err.message);
//       return res.status(500).send('Error updating WiFi');
//     }
//     console.log('Message sent to Arduino:', wifiConfig);
//     res.send('WiFi settings updated successfully');
//   });
// });

// // Endpoint to check serial port availability
// app.get('/check-serial-port', (req, res) => {
//   res.json({ available: !!serialPort }); // Return true if serialPort is defined, false otherwise
// });

// // Endpoint to retrieve Arduino messages
// app.get('/arduino-messages', (req, res) => {
//   res.json({ messages: arduinoMessages }); // Return array of Arduino messages
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

// const { ReadlineParser } = require('@serialport/parser-readline');
// const { SerialPort } = require('serialport');
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const http = require('http');
// const WebSocket = require('ws');

// const app = express();
// const port = process.env.PORT || 3535;

// app.use(bodyParser.json());
// app.use(cors({
//   origin: "*",
// }));

// let serialPort;
// let arduinoMessages = [];

// function initializeSerialPort() {
//   serialPort = new SerialPort({
//     path: 'COM5',
//     baudRate: 9600
//   });

//   const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

//   parser.on('data', (line) => {
//     console.log(`Received from Arduino: ${line}`);
//     arduinoMessages.push(line);
//     broadcast(line); // Broadcast new message to all WebSocket clients
//   });

//   serialPort.on('error', (err) => {
//     console.error('Serial port error:', err.message);
//     if (err.message.includes('File not found')) {
//       console.log('COM5 not available yet...');
//       serialPort = null;
//     }
//   });

//   serialPort.on('open', () => {
//     console.log('Serial port opened');
//   });

//   serialPort.on('close', () => {
//     console.log('Serial port closed');
//     serialPort = null;
//   });
// }

// function checkAndInitializeSerialPort() {
//   SerialPort.list().then((ports) => {
//     const com5Exists = ports.some(port => port.path === 'COM5');
//     if (com5Exists && !serialPort) {
//       console.log('COM5 found, initializing serial port...');
//       initializeSerialPort();
//     } else if (!com5Exists && serialPort) {
//       console.log('COM5 disconnected, closing serial port...');
//       serialPort.close();
//     }
//   }).catch((err) => {
//     console.error('Error listing serial ports:', err.message);
//     if (err.message.includes('spawn udevadm ENOENT')) {
//       console.error('udevadm not available. Ensure your environment supports serial port operations.');
//     } else {
//       console.error('An unexpected error occurred:', err.message);
//     }
//   });
// }


// checkAndInitializeSerialPort();
// setInterval(checkAndInitializeSerialPort, 10000);

// app.post('/update-wifi', (req, res) => {
//   if (!serialPort) {
//     return res.status(500).send('Serial port not available');
//   }

//   const { ssid, password } = req.body;
//   const wifiConfig = JSON.stringify({ ssid, password });

//   serialPort.write(`${wifiConfig}\n`, (err) => {
//     if (err) {
//       console.error('Error writing to serial port:', err.message);
//       return res.status(500).send('Error updating WiFi');
//     }
//     console.log('Message sent to Arduino:', wifiConfig);
//     res.send('WiFi settings updated successfully');
//   });
// });

// app.get('/check-serial-port', (req, res) => {
//   res.json({ available: !!serialPort });
// });

// app.get('/arduino-messages', (req, res) => {
//   res.json({ messages: arduinoMessages });
// });

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// wss.on('connection', (ws) => {
//   console.log('WebSocket client connected');
//   ws.send(JSON.stringify({ messages: arduinoMessages }));

//   ws.on('close', () => {
//     console.log('WebSocket client disconnected');
//   });
// });

// function broadcast(message) {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify({ message }));
//     }
//   });
// }

// server.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

// const bodyParser = require('body-parser');

// const http = require('http');
// const WebSocket = require('ws');

// const app = express();
// const port = process.env.PORT || 3535;

// app.use(bodyParser.json());
// app.use(cors({
//   origin: "*",
// }));

const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@stomp/stompjs');
const SockJS = require('sockjs-client');
const os = require('os');
const { Server: WebSocketServer } = require('ws'); 
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3535;
const isLocal = os.hostname() === 'DESKTOP-RQG2KUH'; // Adjust this to your local environment's hostname

app.use(cors({
  origin: "*",
}));

let serialPort;
let arduinoMessages = [];

// Initialize serial port if running in a local environment
if (isLocal) {
  const { SerialPort } = require('serialport');
  const { ReadlineParser } = require('@serialport/parser-readline');

  serialPort = new SerialPort({
    path: 'COM5', // Replace with the appropriate COM port
    baudRate: 9600
  });
  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  parser.on('data', (line) => {
    console.log(`Received from Arduino: ${line}`);
    arduinoMessages.push(line);
  });

  serialPort.on('open', () => {
    console.log('Serial port opened');
  });

  serialPort.on('close', () => {
    console.log('Serial port closed');
  });

  serialPort.on('error', (err) => {
    console.error('Serial port error:', err.message);
  });
} else {
  console.log('Serial port operations are not supported in this environment');
  // Implement mock functions or handle accordingly if not local
}

// Middleware
app.use(bodyParser.json());

// Routes

// Check serial port availability
app.get('/check-serial-port', (req, res) => {
  res.json({ available: !!serialPort });
});

// Update WiFi settings
app.post('/update-wifi', (req, res) => {
  if (!serialPort) {
    return res.status(500).send('Serial port not available');
  }

  const { ssid, password } = req.body;
  const wifiConfig = JSON.stringify({ ssid, password });

  serialPort.write(`${wifiConfig}\n`, (err) => {
    if (err) {
      console.error('Error writing to serial port:', err.message);
      return res.status(500).send('Error updating WiFi');
    }
    console.log('Message sent to Arduino:', wifiConfig);
    res.send('WiFi settings updated successfully');
  });
});

// Get Arduino messages
app.get('/arduino-messages', (req, res) => {
  res.json({ messages: arduinoMessages });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

// WebSocket server connection handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // Handle WebSocket messages
  });

  // Example of sending a message back to the WebSocket client
  ws.send('Hello, WebSocket client!');
});

// STOMP over WebSocket
const socket = new SockJS(`http://localhost:${port}/ws`);
const client = new Client({
  webSocketFactory: () => socket,
  onConnect: () => {
    client.subscribe('/topic/messages', (message) => {
      console.log(`Received STOMP message: ${message.body}`);
      // Handle STOMP messages
    });
  },
  onStompError: (frame) => {
    console.error('Broker reported error:', frame.headers['message']);
    console.error('Additional details:', frame.body);
  },
});
client.activate();
