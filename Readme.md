# Personal Finance Tracker Backend
Project Overview
This is a robust and secure backend service for a personal finance tracking application. It provides a comprehensive RESTful API for managing users, financial accounts, transaction categories, and all income/expense transactions.

Built with modern Python technologies, this project demonstrates a strong understanding of full-stack backend development principles, including:

RESTful API Design: Intuitive and well-structured endpoints for all data operations.
Secure Authentication & Authorization (JWT & OAuth2): Implemented token-based authentication to secure endpoints and ensure users can only access their own data.
Database Management (PostgreSQL & SQLAlchemy): Efficient and reliable data persistence with a powerful relational database and an Object-Relational Mapper.
Database Migrations (Alembic): Professional schema management for incremental database updates, crucial for production environments.
Asynchronous Programming (FastAPI): Leveraging Python's async/await for high-performance I/O operations.
Data Validation & Serialization (Pydantic): Robust handling of incoming and outgoing data with automatic validation.
Containerization (Docker & Docker Compose): Streamlined development environment and deployment readiness through container orchestration.
Filtering, Sorting, and Pagination: Enhancing API usability for retrieving large datasets.
Features
The backend API supports the following core functionalities:

User Management:
Secure user registration (POST /users/).
User login and JWT access token generation (POST /token).
Retrieval of the current authenticated user's details (GET /users/me/).
Authorization checks ensuring users can only manage their own data.
Account Management:
Create, Retrieve (all or single), Update, and Delete financial accounts (/users/{user_id}/accounts/).
Accounts are linked to specific users, with proper authorization.
Category Management:
Create, Retrieve (all or single), Update, and Delete transaction categories (/categories/).
Categories are shared and can be managed by any authenticated user.
Transaction Management:
Create, Retrieve (all or single), Update, and Delete income/expense transactions (/users/{user_id}/transactions/).
Automatic Account Balance Adjustments: Account balances are automatically updated when transactions are created, updated, or deleted.
Filtering: Filter transactions by date range, category, or type.
Sorting: Sort transactions by date or amount in ascending or descending order.
Pagination: Retrieve transactions with skip and limit parameters.
Database Migrations:
Alembic is configured to manage schema changes, supporting controlled upgrades and downgrades of the PostgreSQL database.
Containerized Development Environment:
Use Docker Compose to run the FastAPI application and PostgreSQL database in isolated containers.
Technologies Used
Python 3.8+
FastAPI: High-performance web framework for building APIs.
Uvicorn: ASGI server for running FastAPI applications.
PostgreSQL: Robust relational database.
SQLAlchemy: Python SQL toolkit and Object-Relational Mapper (ORM).
Alembic: Lightweight database migration tool for SQLAlchemy.
Pydantic: Data validation and settings management using Python type hints.
passlib & bcrypt: Secure password hashing.
python-jose: JSON Web Token (JWT) implementation.
Docker & Docker Compose: For containerization and orchestration of development environment.
httpx: Asynchronous HTTP client (used for testing, but testing files are excluded from this consolidated version).
Setup and Installation
Follow these steps to get the backend application running on your local machine using Docker Compose.

Prerequisites
Python 3.8+ installed on your system.
Docker Desktop installed and running.
Git installed.
1. Clone the Repository
Clone this repository to your local machine:

Bash


2. Set Up Python Virtual Environment
It's highly recommended to use a Python virtual environment to manage project dependencies.

Bash

python -m venv .venv
Activate the virtual environment:

On macOS/Linux:
Bash

source .venv/bin/activate
On Windows (Command Prompt):
Bash

.venv\Scripts\activate.bat
On Windows (PowerShell):
PowerShell

.venv\Scripts\Activate.ps1
3. Install Python Dependencies
With your virtual environment active, install the required Python packages from requirements.txt:

Bash

pip install -r requirements.txt
4. Configure Environment Variables (.env)
Create a .env file in the root directory of your project (FINANCE_APP/), alongside docker-compose.yml. This file is crucial and should NEVER be committed to Git.

Code snippet

# .env

# Database URL for PostgreSQL service within Docker Compose network
# IMPORTANT:
# - Use 'localhost' if running the Python app directly on your host machine
#   (e.g., with 'uvicorn finance_app_backend.main:app --reload') and connecting
#   to a standalone Docker PG container.
# - Use 'db' if running the Python app inside the Docker Compose setup
#   (e.g., with 'docker compose up').
DATABASE_URL="postgresql://myuser:mypassword@db/finance_tracker" # Set to 'db' for Docker Compose

# JWT Configuration
# Generate a strong, random key using: python -c "import os; print(os.urandom(32).hex())"
SECRET_KEY="YOUR_ACTUAL_GENERATED_SECRET_KEY_HERE" # <-- REPLACE WITH YOUR ACTUAL GENERATED KEY!
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
Action: Replace myuser, mypassword, and YOUR_ACTUAL_GENERATED_SECRET_KEY_HERE with your chosen secure values.

5. Start Docker Compose Services
This will build your application's Docker image, create your database service, and start both.

Bash

docker compose up --build -d
--build: Forces Docker to rebuild your application image (useful if you change requirements.txt or Dockerfile).
-d: Runs the containers in detached mode.
6. Run Database Migrations (Alembic)
Once your Docker Compose services are running, you need to apply the database schema. This uses Alembic to create your tables.

Ensure finance_tracker_db is healthy (docker compose ps).

Generate the initial migration script: (This requires your .env DATABASE_URL to be db).

Bash

docker compose exec app alembic revision --autogenerate -m "create initial tables"
This will create a new Python file in alembic/versions/. Review this file to ensure it contains op.create_table() calls for your models.
Important: If you see pass in upgrade() or downgrade(), it means tables already exist in your database. You'll need to drop the finance_tracker database inside the finance_tracker_db container first (e.g., by connecting with docker compose exec db psql -U myuser postgres then DROP DATABASE finance_tracker; CREATE DATABASE finance_tracker;) and then regenerate the migration.
Apply the migration:

Bash

docker compose exec app alembic upgrade head
This will create all your tables in the finance_tracker_db database.

API Documentation and Testing
Once all services are up and running, you can access the interactive API documentation:

Swagger UI: Open your browser and navigate to http://localhost:8000/docs
ReDoc: Open your browser and navigate to http://localhost:8000/redoc
You can use these interfaces to explore the available endpoints and test them directly.

Basic Testing Flow:
Register a User: POST /users/ (e.g., {"username": "myuser", "password": "mypassword"})
Login to Get Token: POST /token (Select x-www-form-urlencoded body: username=myuser, password=mypassword, grant_type=password). Copy the access_token from the response.
Authorize in Swagger UI: Click "Authorize" (top right), select "bearerAuth", paste Bearer YOUR_ACCESS_TOKEN.
Test Protected Endpoints: Try GET /users/me/ or create an account for your user.
Stopping the Application
To stop your Docker Compose application gracefully:

Go to your terminal where docker compose up -d was run.
Press Ctrl+C.
Then, run:
Bash

docker compose down
This stops containers and removes networks. If you want to remove volumes (and thus database data), use docker compose down --volumes.
