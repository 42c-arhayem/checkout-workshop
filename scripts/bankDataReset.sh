#!/bin/bash

# Define the service and container names
SERVICE_NAME="database"
CONTAINER_NAME="mongo-db"

# Stop the database container if it exists
if [ $(docker ps -q -f name=${CONTAINER_NAME}) ]; then
    docker stop ${CONTAINER_NAME}
fi
echo "database stopped!"

# Remove the database container if it exists
if [ $(docker ps -aq -f name=${CONTAINER_NAME}) ]; then
    docker rm ${CONTAINER_NAME}
fi
echo "database container removed!"

# Restart the database container
docker-compose -f ../backend/docker/42c-bank.yaml up -d ${SERVICE_NAME}
echo "database restarted successfully!"
# Print status
docker-compose -f ../backend/docker/42c-bank.yaml ps