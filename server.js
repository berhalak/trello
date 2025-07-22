#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse URL and get file path
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>404 - File Not Found</h1>
        <p>The requested file <code>${req.url}</code> was not found.</p>
        <a href="/">Go back to home</a>
      `);
      return;
    }

    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - File Not Found</h1>');
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${error.code}`);
        }
      } else {
        // Set CORS headers for development
        res.writeHead(200, {
          'Content-Type': mimeType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end(content, 'utf-8');
      }
    });
  });
});

// Start server
server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`🚀 Trello Clone server running at ${url}`);
  console.log(`📁 Serving files from: ${path.resolve('.')}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log(`\n💡 Tips:`);
  console.log(`   • Open ${url} in your browser`);
  console.log(`   • Press Ctrl+C to stop the server`);
  console.log(`   • Files are served from the current directory\n`);

  // Try to open browser automatically
  const platform = process.platform;
  let command;
  
  if (platform === 'darwin') {
    command = `open ${url}`;
  } else if (platform === 'win32') {
    command = `start ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }

  // Open browser after a short delay
  setTimeout(() => {
    exec(command, (error) => {
      if (error) {
        console.log(`🌐 Couldn't auto-open browser. Please visit: ${url}`);
      } else {
        console.log(`🌐 Browser opened automatically!`);
      }
    });
  }, 1000);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed. Goodbye!');
    process.exit(0);
  });
});

// Handle unhandled errors
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
