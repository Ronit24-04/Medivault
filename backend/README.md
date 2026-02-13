# MediVault Backend API

Digital Medical Records Manager - RESTful API built with Node.js, Express, TypeScript, Prisma, and MySQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Patient Management**: Create and manage multiple patient profiles (family members)
- **Medical Records**: Upload and organize medical documents with Cloudinary storage
- **Emergency Features**: Emergency PIN access, contacts, and alert system with email notifications
- **Hospital Finder**: Location-based hospital search with distance calculation
- **File Upload**: Cloudinary integration for secure medical document storage
- **Email Notifications**: Automated emails for verification, password reset, and emergency alerts
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Rate limiting, helmet, CORS, input validation with Zod
- **Type Safety**: Full TypeScript implementation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL database (XAMPP or similar)
- Cloudinary account (for file storage)
- Gmail account (for email notifications)

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the following required variables:
     ```env
     DATABASE_URL="mysql://root@localhost:3306/medivault_db"
     CLOUDINARY_CLOUD_NAME=your-cloud-name
     CLOUDINARY_API_KEY=your-api-key
     CLOUDINARY_API_SECRET=your-api-secret
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-specific-password
     ```

3. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be running at `http://localhost:3000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── patients/     # Patient management
│   │   ├── medical-records/ # Medical records
│   │   ├── emergency/    # Emergency features
│   │   └── hospitals/    # Hospital finder
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── .env                  # Environment variables
└── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/setup-emergency-pin` - Setup 6-digit emergency PIN
- `POST /api/auth/verify-emergency-pin` - Verify emergency PIN
- `GET /api/auth/profile` - Get current user profile

### Patients
- `POST /api/patients` - Create patient profile
- `GET /api/patients` - List all patients
- `GET /api/patients/:patientId` - Get patient details
- `PUT /api/patients/:patientId` - Update patient
- `DELETE /api/patients/:patientId` - Delete patient
- `GET /api/patients/:patientId/emergency-info` - Get emergency info

### Medical Records
- `POST /api/patients/:patientId/records` - Upload medical record
- `GET /api/patients/:patientId/records` - List records (with filters)
- `GET /api/patients/:patientId/records/timeline` - Timeline view
- `GET /api/patients/:patientId/records/:recordId` - Get record details
- `PUT /api/patients/:patientId/records/:recordId` - Update record
- `DELETE /api/patients/:patientId/records/:recordId` - Delete record

### Emergency
- `POST /api/emergency/contacts` - Add emergency contact
- `GET /api/emergency/contacts` - List emergency contacts
- `PUT /api/emergency/contacts/:contactId` - Update contact
- `DELETE /api/emergency/contacts/:contactId` - Delete contact
- `POST /api/emergency/alerts` - Send emergency alert
- `GET /api/emergency/alerts` - List alerts
- `POST /api/emergency/alerts/:alertId/acknowledge` - Acknowledge alert

### Hospitals
- `GET /api/hospitals` - Search hospitals (with location filters)
- `GET /api/hospitals/:hospitalId` - Get hospital details

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | Yes |
| `JWT_SECRET` | Secret for access tokens | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `EMAIL_USER` | Gmail address | Yes |
| `EMAIL_PASSWORD` | Gmail app password | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## 📧 Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password
3. Use this app password in `EMAIL_PASSWORD` environment variable

**Note**: We're using Gmail with Nodemailer as it's free and reliable for development and small-scale production use.

## ☁️ Cloudinary Setup

1. Sign up for a free Cloudinary account at https://cloudinary.com
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to your `.env` file

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:push` - Push schema changes to database

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Zod schema validation
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Emergency PIN**: 6-digit PIN with rate limiting

## 📝 Notes

- Medical records are stored in Cloudinary for reliability and CDN delivery
- Emergency PIN attempts are rate-limited to 5 attempts per 15 minutes
- All timestamps are in UTC
- File uploads are limited to 10MB by default
- Supported file types: JPEG, PNG, PDF

## 🤝 Contributing

This is a project for MediVault Digital Medical Records Manager.

## 📄 License

MIT

## 🆘 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for better healthcare management**
