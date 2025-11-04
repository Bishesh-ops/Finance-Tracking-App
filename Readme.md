# Personal Finance Tracker - Full Stack Application

## Project Overview
This is a modern, full-stack personal finance tracking application with a professional user interface and robust backend infrastructure. The application provides comprehensive tools for managing financial accounts, tracking income and expenses, organizing transactions by category, and visualizing financial data with a clean, accessible design.

### Architecture
- **Frontend**: Next.js 16.0.1 with React 19, Tailwind CSS v4, and TypeScript
- **Backend**: FastAPI (Python) with PostgreSQL database
- **Deployment**: Docker containerization for both services

Built with modern technologies and best practices, this project demonstrates expertise in:

**Backend Development:**

- RESTful API Design: Intuitive and well-structured endpoints for all data operations
- Secure Authentication & Authorization (JWT & OAuth2): Token-based authentication to secure endpoints
- Database Management (PostgreSQL & SQLAlchemy): Efficient relational database with ORM
- Database Migrations (Alembic): Professional schema management for production environments
- Asynchronous Programming (FastAPI): Leveraging Python's async/await for high-performance I/O
- Data Validation & Serialization (Pydantic): Robust data handling with automatic validation
- Containerization (Docker & Docker Compose): Streamlined development and deployment
- Filtering, Sorting, and Pagination: Enhanced API usability for large datasets

**Frontend Development:**
- Modern React Architecture: Next.js 16 with App Router and Server Components
- Type Safety: Full TypeScript implementation across the codebase
- Professional UI/UX: Material Design-inspired color palette with WCAG AAA accessibility compliance
- Responsive Design: Mobile-first approach with Tailwind CSS v4
- State Management: React Context API for authentication and global state
- Performance Optimization: Turbopack for faster builds and hot module replacement

**UI Design Philosophy:**
The interface features a scientifically-proven color scheme designed for maximum readability and professional appearance:
- **Primary Color**: Blue (#3B82F6) - Conveys trust and stability
- **Success/Income**: Emerald (#10B981) - Positive financial actions
- **Warning/Expense**: Rose (#F43F5E) - Negative financial actions
- **Neutral Base**: Light gray background (#F5F7FA) with dark text (#1A202C) for optimal contrast
- **Card System**: Solid white cards with subtle shadows instead of glassmorphism effects
- **Text Hierarchy**: Gray-900 for headings, Gray-600 for body text, ensuring readability
## Features

### Frontend Features
- **User Authentication**: Secure login and registration with JWT token management
- **Dashboard**:
  - Financial overview with total balance, income, and expense statistics
  - Recent transactions list with visual indicators
  - Account management with balance tracking
  - Category-based spending breakdown
  - Budget tracking and progress visualization
- **Transaction Management**:
  - Create, view, edit, and delete transactions
  - Filter by date range, category, or type
  - Sort by date or amount
  - Visual income/expense indicators
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Professional Color Scheme**: Scientifically-proven color palette for optimal readability

### Backend API Features

**User Management:**
- Secure user registration (POST /users/)
- User login and JWT access token generation (POST /token)
- Retrieval of current authenticated user details (GET /users/me/)
- Authorization ensuring users can only manage their own data

**Account Management:**
- Create, Retrieve, Update, and Delete financial accounts (/users/{user_id}/accounts/)
- Accounts linked to specific users with proper authorization
- Automatic balance calculations

**Category Management:**
- Create, Retrieve, Update, and Delete transaction categories (/categories/)
- Shared categories accessible to authenticated users
- Support for both income and expense categories

**Transaction Management:**
- Create, Retrieve, Update, and Delete transactions (/users/{user_id}/transactions/)
- Automatic account balance adjustments on transaction changes
- Filtering by date range, category, or type
- Sorting by date or amount (ascending/descending)
- Pagination with skip and limit parameters

**Database Migrations:**
- Alembic configured for schema management
- Controlled upgrades and downgrades

**Containerized Environment:**
- Docker Compose orchestration for FastAPI and PostgreSQL services
## Technologies Used

### Frontend Stack
- **Next.js 16.0.1**: React framework with App Router and Turbopack
- **React 19.0.0**: UI library with latest features
- **TypeScript 5**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework with PostCSS
- **ESLint**: Code quality and consistency

### Backend Stack
- **Python 3.8+**: Programming language
- **FastAPI**: High-performance async web framework
- **Uvicorn**: ASGI server for FastAPI
- **PostgreSQL**: Relational database
- **SQLAlchemy 2.0**: Python ORM
- **Alembic**: Database migration tool
- **Pydantic**: Data validation with type hints
- **passlib & bcrypt**: Secure password hashing
- **python-jose**: JWT implementation
- **Docker & Docker Compose**: Containerization and orchestration
- **httpx**: Async HTTP client for testing
## Setup and Installation

This guide covers setting up both the backend and frontend of the application.

### Prerequisites
- **Python 3.8+** installed on your system
- **Node.js 20+** and npm installed
- **Docker Desktop** installed and running
- **Git** installed
### 1. Clone the Repository
Clone this repository to your local machine:

```bash
git clone <repository-url>
cd Finance_App
```

### 2. Backend Setup

#### Set Up Python Virtual Environment
Create a Python virtual environment to manage backend dependencies:

```bash
python -m venv .venv
```

Activate the virtual environment:

**On macOS/Linux:**
```bash
source .venv/bin/activate
```

**On Windows (Command Prompt):**
```bash
.venv\Scripts\activate.bat
```

**On Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

#### Install Python Dependencies
With your virtual environment active, install the required Python packages:

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables (.env)
Create a `.env` file in the root directory alongside `docker-compose.yml`. **NEVER commit this file to Git.**

```bash
# .env

# Database URL for PostgreSQL
# Use 'db' when running with Docker Compose
# Use 'localhost' if running FastAPI directly on host machine
DATABASE_URL="postgresql://myuser:mypassword@db/finance_tracker"

# JWT Configuration
# Generate a secure key: python -c "import os; print(os.urandom(32).hex())"
SECRET_KEY="your-generated-secret-key-here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Replace `myuser`, `mypassword`, and generate your own `SECRET_KEY`.

#### Start Docker Compose Services
Build and start the backend services:

```bash
docker compose up --build -d
```

- `--build`: Rebuilds the Docker image (needed after changing `requirements.txt` or `Dockerfile`)
- `-d`: Runs containers in detached mode

#### Run Database Migrations (Alembic)
Apply database migrations to create the schema:

1. Verify services are running:
```bash
docker compose ps
```

2. Generate initial migration (if not already present):
```bash
docker compose exec app alembic revision --autogenerate -m "create initial tables"
```

Review the generated file in `alembic/versions/` to ensure it contains `op.create_table()` calls.

3. Apply migrations:
```bash
docker compose exec app alembic upgrade head
```

This creates all tables in the PostgreSQL database.

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd finance-app-frontend
```

#### Install Frontend Dependencies

```bash
npm install
```

#### Run the Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

#### Build for Production

```bash
npm run build
npm start
```

### 4. Verify Installation

1. **Backend**: Visit `http://localhost:8000/docs` for interactive API documentation
2. **Frontend**: Visit `http://localhost:3000` to access the application
3. **Test Flow**: Register a new user, login, and explore the dashboard

## API Documentation and Testing
The FastAPI backend provides interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Basic Testing Flow

1. **Register a User**:
   - POST `/users/`
   - Body: `{"username": "testuser", "password": "testpassword"}`

2. **Login to Get Token**:
   - POST `/token`
   - Body (x-www-form-urlencoded): `username=testuser`, `password=testpassword`, `grant_type=password`
   - Copy the `access_token` from response

3. **Authorize in Swagger UI**:
   - Click "Authorize" button (top right)
   - Select "bearerAuth"
   - Enter: `Bearer YOUR_ACCESS_TOKEN`

4. **Test Protected Endpoints**:
   - GET `/users/me/` - View current user
   - Create accounts, categories, and transactions

## Color Scheme Reference

The application uses a professional, accessibility-focused color palette:

| Purpose | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Primary Action | Blue 500 | #3B82F6 | Buttons, links, icons |
| Income/Success | Emerald 500 | #10B981 | Positive transactions |
| Expense/Warning | Rose 500 | #F43F5E | Negative transactions |
| Background | Light Gray | #F5F7FA | Page background |
| Cards | White | #FFFFFF | Content containers |
| Heading Text | Gray 900 | #1A202C | Primary text |
| Body Text | Gray 600 | #4B5563 | Secondary text |
| Supporting Text | Gray 500 | #6B7280 | Tertiary text |

All color combinations meet WCAG AAA accessibility standards for contrast.

## Stopping the Application
### Stop Backend Services

```bash
docker compose down
```

To remove volumes (including database data):
```bash
docker compose down --volumes
```

### Stop Frontend Development Server

Press `Ctrl+C` in the terminal running the Next.js dev server.

## Project Structure

```
Finance_App/
├── finance-app-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   │   ├── dashboard/         # Dashboard page
│   │   │   ├── login/             # Login page
│   │   │   ├── transactions/      # Transactions page
│   │   │   ├── context/           # React Context providers
│   │   │   └── globals.css        # Global styles
│   │   └── services/              # API service layer
│   ├── package.json
│   └── tsconfig.json
├── finance_app_backend/           # FastAPI backend application
│   ├── main.py                    # FastAPI app entry point
│   ├── database.py                # Database configuration
│   ├── models.py                  # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   ├── crud.py                    # Database operations
│   └── auth.py                    # Authentication logic
├── alembic/                       # Database migrations
├── docker-compose.yml             # Docker orchestration
├── Dockerfile                     # Backend container config
├── requirements.txt               # Python dependencies
└── .env                           # Environment variables (not committed)
```

## Contributing

This project demonstrates modern full-stack development practices. When contributing:

1. Follow the established code style (ESLint for frontend, PEP 8 for backend)
2. Maintain type safety (TypeScript, Pydantic)
3. Ensure accessibility standards (WCAG AAA)
4. Test all changes thoroughly
5. Update documentation as needed

## License

MIT
