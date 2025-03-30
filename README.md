# File Management Application

A full-stack web application with Django backend and React frontend for user authentication, file management, and dashboard analytics.

## Features

- User authentication (login/registration)
- File upload/download with type detection
- Dashboard with file statistics
- User profile management
- Address management

## Technologies

- **Backend**: Django 4.1, Django REST Framework
- **Frontend**: React 18, Material-UI
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT (JSON Web Tokens)

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL (for production)
- Git

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up database:
   ```bash
   python manage.py migrate
   ```

5. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Run development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory:

```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

## Deployment

### Heroku Deployment

1. Create a Heroku account and install CLI
2. Login and create app:
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. Set up PostgreSQL:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. Deploy:
   ```bash
   git push heroku main
   heroku run python manage.py migrate
   heroku run python manage.py createsuperuser
   ```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register/` | POST | User registration |
| `/api/login/` | POST | User login |
| `/api/files/` | GET | List user files |
| `/api/files/upload/` | POST | Upload file |
| `/api/files/<id>/download/` | GET | Download file |
| `/api/profile/` | GET, PUT | User profile |
| `/api/dashboard/` | GET | Dashboard statistics |

## Testing

Run backend tests:
```bash
python manage.py test
```

Run frontend tests:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details