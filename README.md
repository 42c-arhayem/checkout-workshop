# 42C Banking API

A set of banking API with security vulnerabilities exposed in its design and implementation. 

## Introduction ##
42C Banking API provides endpoints to simulated services for an online banking experience. A customer can register a new account, then log into their account and access services like make a payment or apply for a new credit card. 

The first phase of this project simulates a customer online banking experience. 

The second phase will add an additional set of API endpoints to simulate an OpenBanking experience, where third party providers may be granted access to a customers banking data. 

If you have any request, please [create an issue](https://github.com/anthony-42crunch/42c-bank/issues/new) and describe what you need.

## Overview of the API endpoints (v1) ##

- Register
  - Create a new customer online bank account.
- Login
  - Log in to the account and retrieve an access token.
- Accounts
  - Read and write services on the customers account.
- Balances
  - Read the customers current account balance.
- Payees
  - Add or remove a contact or a utility account (e.g. electricty) to the customers list of payees for bank transfers.
- Payment
  - Initiate an online bank transfer of bill payment
- Transactions
  - Retrieve a history of banking transactions
- Credit card application
  - Apply for new credit card, that can be collected or posted to the customers preferred address.
- Mortgage consultation
  - Reserve a timeslot to speak with a mortgage advisor 
- File Upload
  - Upload a document for identification purposes

## GraphQL API Implementation ##

In addition to the REST API, a complete GraphQL implementation is available in the `backend/graphql/` directory. The GraphQL API provides the same functionalities with the benefits of flexible querying, strong typing, and a single endpoint.

**Features:**
- All REST API functionalities available as GraphQL queries and mutations
- Built-in API documentation through GraphQL introspection
- Interactive GraphQL Playground for testing
- Comprehensive vulnerability testing guide with exploitation examples
- Docker support for easy deployment

**Quick Start:**
```bash
cd backend/graphql
npm install
npm run dev
```

Access GraphQL Playground at: `http://localhost:4000/graphql`

📖 Documentation:
- [README.md](backend/graphql/README.md) - Complete API documentation
- [VULNERABILITIES.md](backend/graphql/VULNERABILITIES.md) - Security testing guide
- [SAMPLE_QUERIES.md](backend/graphql/SAMPLE_QUERIES.md) - Example queries

## Get started (REST API) ## 

1. Clone this repository to your local machine
2. Ensure your container software (e.g. Docker Desktop) is up and running
3. Run the following command using docker compose to pull the 42C Banking images (application and database) and run them as local containers.

```
docker-compose -f 42c-bank.yaml up
```

## Get started (developer mode) ##
To make it easy during a demo to modify the API source code and rerun a Conformance Scan test, the project uses nodemon to automatically update the running backend server whenever changes are made to the API code. This requires separating the application and database deployments. 

1. Clone this repository to your local machine
2. If not already available locally, build a local version of the database docker container; which includes some seed data:
```
cd database-setup 
docker build .
```
3. If not already started, start Docker for Desktop 

4. Use Docker compose to start the database container.
```
cd ..
docker compose -f 42c-bank-db.yaml up   
```
5. Open a new terminal and install the dependency packages for the project:
```
npm install
```
6. Start 42C-Bank and overwrite the default MONGO_URI (since the app is not running in a container): 
```
MONGO_URI=mongodb://localhost:27017/42c-bank-db npm run server
```

The application should now be up and running on port 3000 (http) and port 443 (https).
Each time you save a source file, the server will automatically restart to include your changes. 

## Project resources ## 

### OpenAPI definitions ###
Two OpenAPI files are provided. One will receive an Audit score of ~60/100 and is intended to showcase API Security Audit. The second will receive an Audit score of 100/100 and 0 issues, and is intended for use with API Conformance Scan. 

### Seeded user accounts ### 
The database provided has two prepared user accounts out of the box. You can use these immediately to login and test the banking services. 

**User 1 login**
```
email: janedoe@email.com
pan: 11111 
```

**User 2 login**
```
email: ljansen@email.com
pan: 99999
```

### Postman assets ###
A postman collection and enviroment are also provided to interact and test the API endpoints.  

## Vulnerabilities ##

| Vulnerability |	OWASP |	Operation | Endpoint | Source Code Fix |
| ------------- | ----- | --------- | -------- | --------------- |
| A user can update the credit card application of another user to change the postal address. |	API-1 (BOLA) | PUT | /account/products/cards/{referenceId} | accountsController.js |
| A user can send a large PAN to the login endpoint. The large input can overwhelm the servers hashing function. | API-2 (Broken AuthN) | POST | /auth/login | authController.js |
| A user can write a hidden property "accountType", setting it to 'Business' | API-3 (BOPLA - mass assignment) |	PUT |	/account |	accountsController.js |
| The API leaks the "accountType" property in the PUT response | API-3 (BOPLA - excessive data exposure) | PUT |	/account | accountsController.js |
| The API leaks the hashed PAN in a 401 response from the login endpoint | API-3 (BOPLA - excessive data exposure) | POST	| /auth/login	| authController.js |
| The API fails to restrict the number of transaction records returned in the response | API-4 (Unrestricted Resource Consumption) | GET | /account/transactions | accountsController.js |
| A user can make unlimited requests for a meeting with a mortgage consultation, occuping the teams entire timeslots | API-6 (Unrestricted Access to Sensitive Business Flows) | POST |	/account/products/mortgages/meeting |	accountsController.js |
| A user can submit a localhost url instead of an external image file, and figure out what ports are open on the server based on the API response (404 vs 500) |	API-7 (SSRF) | POST |	/account/files | accountsController.js |
| The API does not explicitly block unsupported Verbs |	API-8 (Security Misconfiguration)	| POST |	/auth/login |	authRoutes.js |
| A user can make a transfer from another users account |	API-8:2019 (Injection)	| POST |	/account/payments/transfer |	accountsController.js |
| The filename parameter is vulnerable to path traversal |	A01:2021  (Broken Access Control)	| GET |	/account/files |	accountsController.js |
