# Fintech System

A simple backend system for a fintech application built with NestJS. This project provides basic functionalities for managing user accounts and transactions, including creating accounts, checking balances, and making deposits or withdrawals.

## Technologies Used

- **[NestJS](https://nestjs.com/):** A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- **[TypeScript](https://www.typescriptlang.org/):** A typed superset of JavaScript that compiles to plain JavaScript.
- **[Mongoose](https://mongoosejs.com/):** An Object Data Modeling (ODM) library for MongoDB and Node.js.
- **[Jest](https://jestjs.io/):** A delightful JavaScript Testing Framework with a focus on simplicity.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd fintech-system
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Copy the example environment file and rename it to .env:
    ```bash
    cp example.env .env
    ```
5.  Update the .env file with your database connection string and other configuration values.

## Usage

### Running the Application

- **Development mode:**
  ```bash
  npm run start
  ```
- **Watch mode (rebuilds on file change):**
  ```bash
  npm run start:dev
  ```
- **Production mode:**
  `bash
  npm run start:prod
  `
  The application will be running on `http://localhost:3030`.

### Docker

To build and run the application using Docker, follow these steps:

1.  **Build the Docker image:**

    ```bash
    docker build -t fintech-system .
    ```

2.  ** Run MongoDB container**
    ```bash
    docker run -d \
        --name mongodb \
        -p 27017:27017 \
    mongo --replSet rs0
    ```
    Enable DB Session Transactions
    ```bash
    $ docker exec -it mongo-rs mongosh
    rs.initiate();
    cfg = rs.conf();
    cfg.members[0].host = "localhost:27017";
    rs.reconfig(cfg, { force: true });
    ```
3.  **Run the Docker container:**

    ```bash
    docker run -p 3030:3030 fintech-system
    ```

The application will be accessible at `http://localhost:3030`.

### Using Docker Compose

To run the application and the MongoDB database together, you can use Docker Compose. This is the recommended way to run the application during development.

1.  **Start the services:**

    ```bash
    docker-compose up --build
    ```

## API Documentation

### Postman Collection

We've provided a Postman collection to help you interact with the API endpoints. The collection includes examples of all available API requests.

**Location:** [`docs/fintech-system.postman_collection.json`](docs/fintech-system.postman_collection.json)

**How to use:**
1. Import the collection into Postman
2. Set up the following environment variable in Postman:
   - `base_url`: `http://localhost:3030` (or your deployed URL)

**Available Endpoints:**
- **Accounts**
  - `POST /accounts` - Create a new account
  - `GET /accounts/:id/balance` - Get account balance
- **Transactions**
  - `POST /transactions` - Create a new transaction
  - `GET /transactions/account/:accountId` - Get transaction history for an account

For detailed request and response examples, please refer to the Postman collection.

    To run in detached mode:

    ```bash
    docker-compose up --build -d
    ```

2.  **Stop the services:**

    ```bash
    docker-compose down
    ```

### Running Tests

- **Run unit tests:**
  ```bash
  npm test
  ```
- **Run end-to-end (e2e) tests:**
  ```bash
  npm run test:e2e
  ```
- **Generate test coverage report:**
  ```bash
  npm run test:cov
  ```

## API Reference

The API is documented using Swagger. Once the application is running, you can access the interactive API documentation at [`http://localhost:3030/api`](http://localhost:3030/api).

### Account Endpoints

- `POST /accounts`
  - **Description:** Creates a new user account.
  - **Body:**
    ```json
    {
      "name": "string",
      "email": "string (optional)",
      "mobile": "string (optional)"
    }
    ```
  - **Response:** The created account object.

- `GET /accounts/:id/balance`
  - **Description:** Retrieves the balance for a specific user account.
  - **Parameters:** `id` (string) - The account's unique ID.

### Transaction Endpoints

- `POST /transactions/deposit`
  - **Description:** Deposits funds into an account.
  - **Body:**
    ```json
    {
      "accountId": "string",
      "amount": "number"
    }
    ```
  - **Response:** The created transaction object.

- `POST /transactions/withdraw`
  - **Description:** Withdraws funds from an account.
  - **Body:**
    ```json
    {
      "accountId": "string",
      "amount": "number"
    }
    ```
  - **Response:** The created transaction object.
  - **Response:** The account object with the current balance.

### Transaction Endpoints

- `POST /transaction/deposit`
  - **Description:** Deposits a specified amount into a user's account.
  - **Body:** `{ "accountId": "string", "amount": number }`
  - **Response:** The transaction object.

- `POST /transaction/withdraw`
  - **Description:** Withdraws a specified amount from a user's account.
  - **Body:** `{ "accountId": "string", "amount": number }`
  - **Response:** The transaction object.

## License

This project is UNLICENSED.
