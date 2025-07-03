# Multi-Tenant ERP System

A production-ready, multi-tenant Enterprise Resource Planning (ERP) system built with Django, designed for service-based companies.

## Features

- Multi-tenant architecture with isolated data per company
- Role-based access control (Parent User, Admin User, Employee)
- Custom user model with UUID-based identification
- Email-based authentication
- Secure login/logout functionality
- Responsive frontend using Django templates
- MySQL database backend
- Production-ready security measures

## User Roles

1. **Parent User (Company Owner/CEO)**
   - Company registration and management
   - Admin user creation and management
   - Full system access

2. **Admin User**
   - Employee management (CRUD operations)
   - Department and role management
   - Limited system access

3. **Employee**
   - View-only access to employee lists
   - Personal profile management
   - Restricted system access

## Technical Stack

- Backend: Django 5.0.2
- Database: MySQL
- Frontend: HTML, CSS, JavaScript, Django Templates
- Authentication: Django AllAuth
- Forms: Django Crispy Forms
- API: Django REST Framework

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd erps
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root and configure your environment variables:
   ```
   DEBUG=True
   SECRET_KEY=your-secret-key
   DATABASE_URL=mysql://user:password@localhost:3306/erp_db
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   ```

5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Project Structure

```
erps/
├── manage.py
├── requirements.txt
├── .env
├── .gitignore
├── core/
│   ├── __init__.py
│   ├── settings/
│   ├── urls.py
│   └── wsgi.py
├── accounts/
│   ├── models.py
│   ├── views.py
│   ├── forms.py
│   └── urls.py
├── companies/
│   ├── models.py
│   ├── views.py
│   └── urls.py
├── employees/
│   ├── models.py
│   ├── views.py
│   └── urls.py
└── templates/
    ├── base.html
    ├── accounts/
    ├── companies/
    └── employees/
```

## Security Features

- Custom user model with UUID
- Email-based authentication
- Role-based access control
- Secure password handling
- CSRF protection
- XSS protection
- SQL injection prevention
- Session security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 