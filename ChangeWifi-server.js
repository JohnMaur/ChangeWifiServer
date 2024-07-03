// const { SerialPort } = require('serialport');
// const { ReadlineParser } = require('@serialport/parser-readline');
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const port = 3535; // Choose your backend server port

// app.use(bodyParser.json());
// app.use(cors({
//   origin: "*",
// }));

// let serialPort; // Define serialPort as a global variable

// function initializeSerialPort() {
//   serialPort = new SerialPort({
//     path: 'COM5', // Replace with the appropriate COM port
//     baudRate: 9600
//   });

//   const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

//   parser.on('data', (line) => {
//     console.log(`Received from Arduino: ${line}`);
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


// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3535; // Choose your backend server port

app.use(bodyParser.json());
app.use(cors({
  origin: "*",
}));

let serialPort; // Define serialPort as a global variable
let arduinoMessages = []; // Array to store Arduino messages

function initializeSerialPort() {
  serialPort = new SerialPort({
    path: 'COM5', // Replace with the appropriate COM port
    baudRate: 9600
  });

  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  parser.on('data', (line) => {
    console.log(`Received from Arduino: ${line}`);
    arduinoMessages.push(line); // Store message in array
  });

  serialPort.on('error', (err) => {
    console.error('Serial port error:', err.message);
    if (err.message.includes('File not found')) {
      console.log('COM5 not available yet...');
      serialPort = null; // Reset serialPort variable
    }
  });

  serialPort.on('open', () => {
    console.log('Serial port opened');
    // Optionally, you can send an initialization command once port is opened
    // Example: serialPort.write('INIT\n');
  });

  serialPort.on('close', () => {
    console.log('Serial port closed');
    serialPort = null; // Reset serialPort variable
  });
}

function checkAndInitializeSerialPort() {
  SerialPort.list().then((ports) => {
    const com5Exists = ports.some(port => port.path === 'COM5');
    if (com5Exists && !serialPort) {
      console.log('COM5 found, initializing serial port...');
      initializeSerialPort();
    } else if (!com5Exists && serialPort) {
      console.log('COM5 disconnected, closing serial port...');
      serialPort.close();
    }
  }).catch((err) => {
    console.error('Error listing serial ports:', err.message);
  });
}

// Initialize serial port check on application startup
checkAndInitializeSerialPort();

// Check for COM5 availability every 10 seconds (adjust interval as needed)
setInterval(checkAndInitializeSerialPort, 10000);

// Endpoint to update WiFi configuration
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

// Endpoint to check serial port availability
app.get('/check-serial-port', (req, res) => {
  res.json({ available: !!serialPort }); // Return true if serialPort is defined, false otherwise
});

// Endpoint to retrieve Arduino messages
app.get('/arduino-messages', (req, res) => {
  res.json({ messages: arduinoMessages }); // Return array of Arduino messages
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

