#!/bin/sh

# Start Node.js application in the background
node dist/index.js &

# Wait a moment for Node.js to start
sleep 2

# Start nginx in foreground (so container stays alive)
nginx -g "daemon off;"
