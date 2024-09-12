const http = require('node:http');
const fs = require('fs');
const mammoth = require('mammoth');

// Define the hostname (localhost IP address) and port number for the server to listen on
const hostname = '127.0.0.1';
const port = 3000;

// Create the server using the 'http' module's createServer method
const server = http.createServer((req, res) => {
  const resumeDoc = 'resume.docx';
  
  // Check if the requested URL is the root of the website
  if (req.url === '/') {
    fs.readFile(resumeDoc, (error, data) => {
      if (error) {
        // Handle when the file wasn't found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('File not found.');
      } 
      else {
        // Define a style map
        const styleMap = [
          "Heading1 => h1",
          "Normal => p",
        ].join(", ");

        // Convert the Word file to HTML
        mammoth.convertToHtml({ buffer: data, styleMap: styleMap }).then(result => {
          const resumeHTML = result.value;

          // Read the HTML template
          fs.readFile('template.html', (error, templateData) => {
            if (error) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Error loading the template');
            } 
            else {
              // Replace the placeholder with the resume content
              const responseHtml = templateData.toString()
                .replace('<div id="resume-content"></div>', `<div id="resume-content">${resumeHTML}</div>`);

              console.log('Served the content.');

              // Serve the final HTML
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(responseHtml);
            }
          });
        }).catch(error => {
          // Handle conversion error
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error processing the resume.');
        });
      }
    });
  }
  // Serve the CSS file when requested
  else if (req.url === '/theme.css') {
    fs.readFile('theme.css', (error, data) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('CSS file not found');
      } 
      else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        console.log('Served the theme.');
        res.end(data);
      }
    });
  }
  else {
    // Handle when the requested URL is not at the root
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Instruct the server to listen for incoming requests on the specified hostname and port
server.listen(port, hostname, () => {
  // Log a message to the console to indicate that the server is running
  console.log(`Server running at http://${hostname}:${port}/`);
});