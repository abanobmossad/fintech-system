# Fintech System

A simple backend system for a fintech application built with NestJS. This project provides basic functionalities for managing user accounts and transactions, including creating accounts, checking balances, and making deposits or withdrawals.

## Technologies Used

*   **[NestJS](https://nestjs.com/):** A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
*   **[TypeScript](https://www.typescriptlang.org/):** A typed superset of JavaScript that compiles to plain JavaScript.
*   **[Mongoose](https://mongoosejs.com/):** An Object Data Modeling (ODM) library for MongoDB and Node.js.
*   **[Jest](https://jestjs.io/):** A delightful JavaScript Testing Framework with a focus on simplicity.

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

*   **Development mode:**
    ```bash
    npm run start
    ```
*   **Watch mode (rebuilds on file change):**
    ```bash
    npm run start:dev
    ```
*   **Production mode:**
    ```bash
    npm run start:prod
    ```
The application will be running on `http://localhost:3030`.

### Docker

To build and run the application using Docker, follow these steps:

1.  **Build the Docker image:**

    ```bash
    docker build -t fintech-system .
    ```

2.  **Run the Docker container:**

    ```bash
    docker run -p 3000:3000 fintech-system
    ```

The application will be accessible at `http://localhost:3000`.

### Using Docker Compose

To run the application and the MongoDB database together, you can use Docker Compose. This is the recommended way to run the application during development.

1.  **Start the services:**

    ```bash
    docker-compose up --build
    ```

    To run in detached mode:
    ```bash
    docker-compose up --build -d
    ```

2.  **Stop the services:**

    ```bash
    docker-compose down
    ```

### Running Tests

*   **Run unit tests:**
    ```bash
    npm run test
    ```
*   **Run end-to-end (e2e) tests:**
    ```bash
    npm run test:e2e
    ```
*   **Generate test coverage report:**
    ```bash
    npm run test:cov
    ```

## API Reference

The API is documented using Swagger. Once the application is running, you can access the interactive API documentation at [`http://localhost:3030/api`](http://localhost:3030/api).

### Account Endpoints

*   `POST /accounts`
    *   **Description:** Creates a new user account.
    *   **Body:** 
        ```json
        {
          "name": "string",
          "email": "string (optional)",
          "mobile": "string (optional)"
        }
        ```
    *   **Response:** The created account object.

*   `GET /accounts/:id/balance`
    *   **Description:** Retrieves the balance for a specific user account.
    *   **Parameters:** `id` (string) - The account's unique ID.

### Transaction Endpoints

*   `POST /transactions/deposit`
    *   **Description:** Deposits funds into an account.
    *   **Body:**
        ```json
        {
          "accountId": "string",
          "amount": "number"
        }
        ```
    *   **Response:** The created transaction object.

*   `POST /transactions/withdraw`
    *   **Description:** Withdraws funds from an account.
    *   **Body:**
        ```json
        {
          "accountId": "string",
          "amount": "number"
        }
        ```
    *   **Response:** The created transaction object.
    *   **Response:** The account object with the current balance.

### Transaction Endpoints

*   `POST /transaction/deposit`
    *   **Description:** Deposits a specified amount into a user's account.
    *   **Body:** `{ "accountId": "string", "amount": number }`
    *   **Response:** The transaction object.

*   `POST /transaction/withdraw`
    *   **Description:** Withdraws a specified amount from a user's account.
    *   **Body:** `{ "accountId": "string", "amount": number }`
    *   **Response:** The transaction object.

## License

This project is UNLICENSED.
