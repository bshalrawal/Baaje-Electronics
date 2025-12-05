# Baaje Electronics - E-Commerce Platform

![GitHub repo size](https://img.shields.io/github/repo-size/bshalrawal/Baaje-Electronics)

**Baaje Electronics** is a fully responsive e-commerce platform for electronics, built with a modern tech stack including Node.js backend, SQLite database, and a dynamic admin CMS for content management.

## Features

✨ **Frontend**
- Fully responsive design for all devices
- Modern electronics-focused UI
- Dynamic product loading from database
- Category-based navigation
- Product search functionality

🔧 **Backend & Admin Panel**
- Node.js/Express REST API
- SQLite database with Prisma ORM
- JWT-based authentication
- Full admin CMS for managing:
  - Products (with image uploads)
  - Categories
  - Homepage banners/sliders
  - Site settings
- Secure admin panel with role-based access

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Icons**: Ionicons

## Prerequisites

Before you begin, ensure you have:

* [Node.js](https://nodejs.org/) (v14 or higher)
* [Git](https://git-scm.com/downloads)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/bshalrawal/Baaje-Electronics.git
cd Baaje-Electronics
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default `.env` file contains:
- Database URL (SQLite)
- JWT secret
- Admin credentials (email: admin@baajeelectronics.com, password: admin123)

### 4. Set up the database

Generate Prisma client and create the database:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed the database

Populate the database with sample data:

```bash
npm run seed
```

This will create:
- Admin user
- Electronics categories (Smartphones, Laptops, Tablets, etc.)
- Sample products
- Homepage banners
- Site settings

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## Default Admin Credentials

- **Email**: admin@baajeelectronics.com
- **Password**: admin123

⚠️ **Important**: Change these credentials in production!

## Project Structure

```
Baaje-Electronics/
├── admin/                  # Admin panel files
│   ├── css/               # Admin styles
│   ├── js/                # Admin JavaScript
│   ├── login.html         # Admin login page
│   ├── dashboard.html     # Admin dashboard
│   ├── products.html      # Product management
│   ├── categories.html    # Category management
│   ├── banners.html       # Banner management
│   └── settings.html      # Site settings
├── assets/                # Frontend assets
│   ├── css/              # Stylesheets
│   ├── images/           # Images
│   └── js/               # JavaScript files
├── middleware/           # Express middleware
├── prisma/              # Database schema
├── routes/              # API routes
├── scripts/             # Utility scripts
├── uploads/             # Uploaded files
├── server.js            # Express server
├── index.html           # Main frontend page
└── package.json         # Dependencies
```

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get all categories
- `GET /api/banners` - Get all banners
- `GET /api/settings` - Get site settings

### Admin Endpoints (Require Authentication)
- `POST /api/admin/login` - Admin login
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- Similar CRUD endpoints for categories, banners, and settings

## Database Management

### View Database
```bash
npm run prisma:studio
```

### Create Migration
```bash
npm run prisma:migrate
```

### Reset Database
```bash
npx prisma migrate reset
npm run seed
```

## Deployment

### Environment Variables for Production

Update your `.env` file:
```env
NODE_ENV=production
JWT_SECRET=your-secure-random-string
SESSION_SECRET=another-secure-random-string
ADMIN_PASSWORD=your-secure-password
```

### Deploy to Vercel/Heroku/Railway

1. Push your code to GitHub
2. Connect your repository to your hosting platform
3. Set environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

**Bishal Rawal**
- Email: bshalrawal@gmail.com
- GitHub: [@bshalrawal](https://github.com/bshalrawal)

## Acknowledgments

- Built with ❤️ for electronics enthusiasts
- Icons by [Ionicons](https://ionic.io/ionicons)
- Fonts by [Google Fonts](https://fonts.google.com/)
