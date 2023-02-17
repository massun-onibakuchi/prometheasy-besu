#!/bin/sh

# NOTE: Error: listen EADDRINUSE: address already in use 127.0.0.1:8545
lsof -i:8545

# Start chain in the background and save its PID
npx hardhat node --port 8545 & chain_pid=$!

# Wait for the chain to start
# 4 seconds is enough for the chain to start
sleep 3

# Run yarn test in parallel
npx hardhat test & test_pid=$!

# # Wait for the test to finish
wait $test_pid

# # Kill the chain
kill $chain_pid

