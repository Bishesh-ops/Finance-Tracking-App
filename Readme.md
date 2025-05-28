Personal Finance Tracker Backend
Project Overview
This is the backend service for a personal finance tracking application. Built with FastAPI, PostgreSQL, and SQLAlchemy, it provides a robust and high-performance API for managing users, financial accounts, transaction categories, and individual transactions (income and expenses).

This project is designed as a senior undergraduate capstone, demonstrating a solid understanding of modern backend development principles, including:

RESTful API Design: Clean, intuitive endpoints for data manipulation.
Database Management: Efficient interaction with a relational database (PostgreSQL) using an ORM (SQLAlchemy).
Asynchronous Programming: Leveraging Python's async/await capabilities for concurrent operations.
Data Validation & Serialization: Using Pydantic for robust input/output handling.
Dependency Management: Utilizing pip and virtual environments for clean dependency trees.
Containerization (Docker): Easy setup and isolation of the database service.
Features
Currently, the backend supports the following core functionalities:

User Management:
Create new users (with password hashing for security).
Retrieve user details by ID.
Database Initialization: Automatically creates necessary tables in PostgreSQL on startup.
Upcoming Features (Planned):
Account Management (CRUD)
Category Management (CRUD)
Transaction Management (CRUD)
Filtering and Pagination for transactions.
Basic Financial Summaries (e.g., monthly income/expenses).
User Authentication and Authorization (e.g., JWT).
Technologies Used
Python 3.8+
FastAPI: High-performance, easy-to-use web framework for building APIs.
Uvicorn: ASGI server for running the FastAPI application.
PostgreSQL: Powerful, open-source relational database.
SQLAlchemy: Python SQL toolkit and Object-Relational Mapper (ORM).
Pydantic: Data validation and settings management using Python type hints.
passlib: Library for secure password hashing.
Docker: For containerizing the PostgreSQL database.