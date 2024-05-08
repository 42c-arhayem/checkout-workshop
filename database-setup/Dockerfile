FROM mongo
ENV MONGO_INITDB_DATABASE 42c-bank-db
COPY init.sh init-accountData.json init-ccData.json /docker-entrypoint-initdb.d/
EXPOSE 27017