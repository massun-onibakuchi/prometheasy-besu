#!/bin/sh

# troubleshooting: Error: listen EADDRINUSE: address already in use 127.0.0.1:8545
# use the following command to find the process that is using the port
# lsof -i:8545

# Start chain in the background and save its PID
# 1> /dev/null : redirect stdout to /dev/null (i.e. discard stdout)
# & : run the command in the background
# chain_pid=$! : save the PID of the command to a variable
npx hardhat node --port 8545 1> /dev/null & chain_pid=$!

# Wait for the chain to start
# 4 seconds is enough for the chain to start
sleep 3

# Run yarn test in parallel
npx hardhat test & test_pid=$!

# # Wait for the test to finish
wait $test_pid

# # Kill the chain
kill $chain_pid

