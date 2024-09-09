const http = require('node:http');
const fs = require('fs');

// Define the hostname (localhost IP address) and port number for the server to listen on
const hostname = '127.0.0.1';
const port = 3000;

// Create the server using the 'http' module's createServer method
const server = http.createServer((req, res) => {
  // Set the response header to indicate a successful response (status code 200)
  // and set the Content-Type to an HTML file
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  // Read the contents of the HTML file
  fs.readFile('template.html', (error, data) => {
    if (error) {
      // Change the status to 404 (Not Found)
      res.writeHead(404);
      res.write('File not found.');
    } else {
      // Write the HTML file data to the response body
      res.write(data);
    }
    // End the response, signaling that no more data will be sent
    res.end();
  });
});

// Instruct the server to listen for incoming requests on the specified hostname and port
server.listen(port, hostname, () => {
  // Log a message to the console to indicate that the server is running
  console.log(`Server running at http://${hostname}:${port}/`);
});