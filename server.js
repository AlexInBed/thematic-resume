const http = require('node:http');
const fs = require('fs');
const mammoth = require('mammoth');

// Define the available themes
const themes = ['theme1.css', 'theme2.css', 'theme3.css'];
let randomTheme;

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
              // Get a random theme
              randomTheme = themes[Math.floor(Math.random() * themes.length)];
              
              // Create an HTML variable to serve
              let responseHtml = templateData;

              // TODO: I wonder if I could just do this once (unlike the theme), but I'm really not sure because I refresh
              // Replace the placeholder with the resume content
              responseHtml = responseHtml.toString()
                .replace('<div id="resume-content"></div>', `<div id="resume-content">${resumeHTML}</div>`);

              // Insert the random theme
              responseHtml = responseHtml.toString()
                .replace('random-theme', randomTheme);

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
  else if (req.url.startsWith('/themes')) {
    fs.readFile(`themes/${randomTheme}`, (error, data) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('CSS file not found');
      } 
      else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        console.log('Served the theme: ' + randomTheme);
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