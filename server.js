const http = require('node:http');
const fs = require('fs');
const mammoth = require('mammoth');
const path = require('path');

// Define the available themes
const themes = ['space_theme.css', 'newspaper_theme.css', 'basic_theme.css', 'retro_theme.css', 'pastel_theme.css'];
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  const resumeDoc = 'resume.docx';
  
  // Serve the resume at the root URL
  if (req.url === '/') {
    fs.readFile(resumeDoc, (error, data) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('File not found.');
        return;
      }

      // Define a style map for the Word to HTML conversion
      const styleMap = "Heading1 => h1, Heading2 => h2, Normal => p";

      // Convert the Word file to HTML
      mammoth.convertToHtml({ buffer: data, styleMap }).then(result => {
        const resumeHTML = result.value;

        // Read the HTML template
        fs.readFile('template.html', (error, templateData) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading the template');
            return;
          }

          // Choose a random theme
          const randomTheme = themes[Math.floor(Math.random() * themes.length)];
          
          // Replace the placeholders in the template
          let responseHtml = templateData.toString()
            .replace('<div id="resume-content"></div>', `<div id="resume-content">${resumeHTML}</div>`)
            .replace('random-theme', randomTheme);

          // Serve the final HTML
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(responseHtml);
        });
      }).catch(error => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error processing the resume.');
      });
    });
  }
  
  // Serve the theme CSS
  else if (req.url.startsWith('/themes')) {
    const themePath = path.join(__dirname, req.url);
    fs.readFile(themePath, (error, data) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('CSS file not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
      }
    });
  }
  
  // Serve resources such as images
  else if (req.url.startsWith('/resources')) {
    const resourcePath = path.join(__dirname, req.url);
    fs.readFile(resourcePath, (error, data) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Resource not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(data);
      }
    });
  }
  
  // Handle all other routes with a 404
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
