#!/bin/bash

# Define the service and container names
SERVICE_NAME="apiserver"
CONTAINER_NAME="42c-bank-api"

# Stop the apiserver container if it exists
if [ $(docker ps -q -f name=${CONTAINER_NAME}) ]; then
    docker stop ${CONTAINER_NAME}
fi
echo "api server stopped!"

# Remove the api server container if it exists
if [ $(docker ps -aq -f name=${CONTAINER_NAME}) ]; then
    docker rm ${CONTAINER_NAME}
fi
echo "api server container removed!"

# Remove all volumes related to the project
docker-compose -f ../backend/docker/42c-bank.yaml down -v --remove-orphans

# Restart the database container
docker-compose -f ../backend/docker/42c-bank.yaml up