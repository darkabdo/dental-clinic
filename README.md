# 🦷 Dental Clinic - Full-Stack MERN Application

A modern, fully-featured dental clinic web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This application enables patients to register, book appointments with dentists, and manage their appointments through an intuitive user interface.

## ✨ Features

### 🔐 Authentication
- Dual role authentication: Patient and Dentist
- Separate registration and login for each role
- Secure login with JWT token authentication
- Password hashing with bcrypt
- Protected routes for authenticated users
- Token storage in localStorage with role identification

### 👥 User Management

#### Patient Features
- Patient registration with personal information (name, email, phone, DOB)
- Patient profile page displaying personal information
- Account management and data persistence

#### Dentist Features
- Dentist registration with professional information (full name, specialty, clinic name, license number)
- Dentist profile accessible from dashboard
- Professional credentials storage

### 📅 Appointment Management

#### Patient Features
- Book appointments with selected dentists
- Choose appointment date (up to 60 days in advance) and time slots
- Select reason for visit
- View all upcoming appointments
- Cancel scheduled appointments
- Appointment status tracking (scheduled, completed, cancelled)

#### Dentist Features
- View all appointments scheduled with them
- See patient information for each appointment
- Update appointment status (scheduled → completed or cancelled)
- Contact patients directly (email/phone links)

### 💼 Dentist Dashboard
- Overview of upcoming appointments with patient details
- Patient list with contact information and appointment history
- Real-time appointment status management
- Statistics dashboard showing total appointments, patients, and completed appointments
- Responsive design with tabbed interface for Appointments and Patients views
- 4 professional dentists with specializations:
  - Dr. Sarah Mitchell - General Dentistry
  - Dr. James Okafor - Orthodontics
  - Dr. Layla Hassan - Cosmetic Dentistry
  - Dr. Carlos Rivera - Oral Surgery

### 🎨 User Interface
- Responsive design for desktop, tablet, and mobile devices
- Modern gradient-based styling
- Intuitive navigation
- Hero landing page with service overview
- Informative team member profiles
- Clean and professional UI components

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

### Frontend
- **React.js** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **Vite** - Build tool and dev server
- **CSS3** - Styling

## 📋 Project Structure

```
dental-clinic/
├── backend/
│   ├── models/
│   │   ├── User.js              # Patient schema and model
│   │   ├── Dentist.js           # Dentist schema and model
│   │   └── Appointment.js       # Appointment schema and model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes (patient/dentist register & login)
│   │   ├── appointments.js      # Patient appointment routes (CRUD operations)
│   │   └── dentist.js           # Dentist-specific routes (appointments, patients)
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── server.js                # Express server setup
│   ├── package.json             # Backend dependencies
│   └── .env.example             # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Home page with hero section
│   │   │   ├── Login.jsx        # Dual role login (patient/dentist)
│   │   │   ├── Register.jsx     # Patient registration page
│   │   │   ├── DentistRegister.jsx    # Dentist registration page
│   │   │   ├── Profile.jsx      # Patient profile and appointments
│   │   │   ├── BookAppointment.jsx    # Appointment booking page
│   │   │   └── DentistDashboard.jsx   # Dentist dashboard with appointments & patients
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation bar with role-based links
│   │   │   ├── PrivateRoute.jsx # Protected route wrapper
│   │   │   └── AppointmentCard.jsx    # Appointment display card
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context (patient & dentist)
│   │   ├── styles/
│   │   │   ├── Navbar.css
│   │   │   ├── Auth.css
│   │   │   ├── Landing.css
│   │   │   ├── Profile.css
│   │   │   ├── BookAppointment.css
│   │   │   ├── AppointmentCard.css
│   │   │   └── DentistDashboard.css
│   │   ├── App.jsx              # Main app component with all routes
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── index.html               # HTML template
│   ├── vite.config.js           # Vite configuration
│   ├── package.json             # Frontend dependencies
│   └── public/                  # Static assets
│
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)

### Installation

#### 1. Clone or Download the Project

Navigate to the project directory:

```bash
cd dental-clinic
```

#### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the `.env` file with your settings:

```env
MONGO_URI=mongodb://localhost:27017/dental-clinic
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

**Environment Variables Guide:**
- `MONGO_URI`: MongoDB connection string
  - Local MongoDB: `mongodb://localhost:27017/dental-clinic`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/dental-clinic`
- `JWT_SECRET`: Secret key for JWT tokens (use a strong, random string in production)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

Start the backend server:

```bash
# For development with auto-reload
npm run dev

# Or for production
npm start
```

The backend will be available at `http://localhost:5000`

#### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/dental-clinic`

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create a database user
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/dental-clinic`
5. Update `MONGO_URI` in `.env` file

## 📖 Usage Guide

### 1. Register a New Account
- Navigate to the Register page
- Fill in all required fields:
  - First Name
  - Last Name
  - Email (must be unique)
  - Password (minimum 6 characters)
  - Phone Number
  - Date of Birth
- Click "Register" and you'll be redirected to the Login page

### 2. Login
- Enter your email and password
- Click "Login"
- Your JWT token is automatically stored in localStorage
- You'll be redirected to your Profile page

### 3. View Profile
- On the Profile page, view your personal information
- See all your upcoming appointments
- Each appointment shows:
  - Dentist name and specialty
  - Appointment date and time
  - Reason for visit
  - Status (scheduled/completed/cancelled)

### 4. Book an Appointment
- Click "Book Appointment" in the navigation or on the landing page
- Select a dentist from the dropdown
- Choose a date (within 60 days)
- Select a time slot (9:00 AM - 4:00 PM, 30-minute intervals)
- Select the reason for your visit
- Click "Book Appointment"
- You'll be redirected to your profile to see the new appointment

### 5. Cancel an Appointment
- Go to your Profile page
- Find the appointment you want to cancel
- Click "Cancel Appointment" button
- Confirm the cancellation
- The appointment status will change to "cancelled"

### 6. Logout
- Click "Logout" button in the navigation bar
- You'll be redirected to the landing page
- Your token will be removed from localStorage

## 🔌 API Endpoints

### Authentication Endpoints

#### Patient Register
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "(555) 123-4567",
  "dateOfBirth": "1990-01-15"
}

Response: 201 Created
{ "message": "User registered successfully" }
```

#### Patient Login
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "patient",
  "user": {
    "id": "60d5ec49c1234567890abcde",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "dateOfBirth": "1990-01-15"
  }
}
```

#### Dentist Register
```
POST /api/auth/dentist-register
Content-Type: application/json

Body:
{
  "fullName": "Dr. Sarah Mitchell",
  "email": "sarah@clinic.com",
  "password": "password123",
  "phone": "(555) 987-6543",
  "clinicName": "Smile Dental Clinic",
  "specialty": "General Dentistry",
  "licenseNumber": "DEN-123456"
}

Response: 201 Created
{ "message": "Dentist registered successfully" }
```

#### Dentist Login
```
POST /api/auth/dentist-login
Content-Type: application/json

Body:
{
  "email": "sarah@clinic.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "dentist",
  "dentist": {
    "id": "60d5ec49c1234567890abcdf",
    "fullName": "Dr. Sarah Mitchell",
    "email": "sarah@clinic.com",
    "phone": "(555) 987-6543",
    "clinicName": "Smile Dental Clinic",
    "specialty": "General Dentistry",
    "licenseNumber": "DEN-123456"
  }
}
```

### Patient Appointment Endpoints

#### Get Patient's Appointments
```
GET /api/appointments/my
Headers:
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
[
  {
    "_id": "60d5ec49c1234567890abcde",
    "patientId": "60d5ec49c1234567890abcde",
    "dentist": "Dr. Sarah Mitchell",
    "date": "2024-05-15T14:00:00.000Z",
    "time": "14:00",
    "reason": "Regular Checkup",
    "status": "scheduled",
    "createdAt": "2024-04-30T10:00:00.000Z",
    "updatedAt": "2024-04-30T10:00:00.000Z"
  }
]
```

#### Book Appointment
```
POST /api/appointments
Headers:
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "dentist": "Dr. Sarah Mitchell",
  "date": "2024-05-15T00:00:00.000Z",
  "time": "14:00",
  "reason": "Regular Checkup"
}

Response: 201 Created
{
  "message": "Appointment booked successfully",
  "appointment": { ... }
}
```

#### Cancel Appointment
```
DELETE /api/appointments/:id
Headers:
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{ "message": "Appointment cancelled successfully" }
```

### Dentist Endpoints

#### Get Dentist's Appointments
```
GET /api/dentist/my
Headers:
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
[
  {
    "_id": "60d5ec49c1234567890abcde",
    "patientId": {
      "_id": "60d5ec49c1234567890abcaa",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "(555) 123-4567"
    },
    "dentist": "Dr. Sarah Mitchell",
    "date": "2024-05-15T14:00:00.000Z",
    "time": "14:00",
    "reason": "Regular Checkup",
    "status": "scheduled"
  }
]
```

#### Get Dentist's Patient List
```
GET /api/dentist/patients
Headers:
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
[
  {
    "_id": "60d5ec49c1234567890abcaa",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "dateOfBirth": "1990-01-15"
  }
]
```

#### Get Dentist Profile
```
GET /api/dentist/profile
Headers:
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "_id": "60d5ec49c1234567890abcdf",
  "fullName": "Dr. Sarah Mitchell",
  "email": "sarah@clinic.com",
  "phone": "(555) 987-6543",
  "clinicName": "Smile Dental Clinic",
  "specialty": "General Dentistry",
  "licenseNumber": "DEN-123456",
  "createdAt": "2024-04-30T10:00:00.000Z"
}
```

#### Update Appointment Status
```
PUT /api/dentist/appointments/:id/status
Headers:
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "status": "completed"
}

Response: 200 OK
{
  "message": "Appointment status updated",
  "appointment": { ... }
}
```

## 🔒 Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs with 10 salt rounds
- **JWT Authentication**: Secure token-based authentication for API endpoints
- **Protected Routes**: Frontend private routes redirect unauthenticated users to login
- **CORS Enabled**: Prevents unauthorized cross-origin requests
- **Environment Variables**: Sensitive data stored in `.env` file (not committed to git)
- **Token Validation**: JWT tokens are verified before processing requests

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktop (1200px and up)

## 🧪 Testing the Application

### Patient Testing

#### 1. Test Patient Registration
```
Email: patient@example.com
Password: password123
Phone: (555) 123-4567
DOB: 1990-01-15
```

#### 2. Test Appointment Booking
- Login with patient account
- Navigate to "Book Appointment"
- Select a dentist and available date
- Book multiple appointments

#### 3. Test Appointment Cancellation
- View appointments on profile
- Cancel an appointment
- Verify cancellation on profile

### Dentist Testing

#### 1. Test Dentist Registration
```
Full Name: Dr. Sarah Mitchell
Email: dentist@example.com
Password: password123
Phone: (555) 987-6543
Clinic Name: Smile Dental Clinic
Specialty: General Dentistry
License Number: DEN-123456
```

#### 2. Test Dentist Dashboard
- Login with dentist account
- View upcoming appointments
- View patient list with contact information
- Update appointment status (scheduled → completed)
- Contact patients using email/phone links

#### 3. Cross-Role Testing
- Register and login as both patient and dentist
- Book an appointment as patient with a registered dentist
- View the appointment in dentist dashboard
- Dentist updates status to completed
- Verify status change appears in patient profile

## 🐛 Troubleshooting

### Backend Connection Issues

**"Cannot connect to MongoDB"**
- Ensure MongoDB service is running
- Check `MONGO_URI` in `.env` file
- Verify MongoDB is accessible at the specified address

**Administrator login fails after copying the project to another PC**
- User accounts are stored in **MongoDB**, not in the repo. Moving folders does **not** move your database unless you export/import it or point `MONGO_URI` at the same Atlas cluster.
- Create **`backend/.env`** on the new machine (copy from **`backend/.env.example`** and set `MONGO_URI`, `JWT_SECRET`).
- Start MongoDB (local or Atlas), then start the backend and watch the console:
  - **`[bootstrap] Default admin created`** — sign in with **`admin@example.com`** / **`admin12345`** (unless you set `DEFAULT_ADMIN_*`).
  - **`Admin user(s) already in database`** — this database already has an admin; use that account’s password (not necessarily the defaults above).
  - **`DISABLE_DEFAULT_ADMIN=true`** — unset this if you expect auto-bootstrap on an empty DB.
- If MongoDB never connects, bootstrap never runs and **every** login will fail until `MONGO_URI` is fixed and the server is restarted.

**"Port 5000 already in use"**
- Change `PORT` in `.env` file
- Or kill the process using port 5000

### Frontend Issues

**"Cannot find module 'axios'"**
```bash
cd frontend
npm install
```

**"Blank page or styling issues"**
- Clear browser cache
- Run `npm run dev` again
- Check browser console for errors

**"401 Unauthorized errors"**
- Ensure you're logged in
- Check if JWT token is stored in localStorage
- Clear localStorage and login again

### Database Issues

**"Appointments not appearing"**
- Verify database connection in MongoDB shell
- Check MongoDB connection string in `.env`
- Ensure appointments are marked as "scheduled" (not "cancelled")

## 🚀 Deployment

### Backend Deployment (Heroku Example)

1. Create a `Procfile`:
```
web: node server.js
```

2. Set environment variables on Heroku:
```bash
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
```

3. Deploy:
```bash
git push heroku main
```

### Frontend Deployment (Vercel Example)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
npm install -g vercel
vercel
```

3. Update API endpoint in frontend if needed

## 📝 Available Scripts

### Backend

```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start production server
```

### Frontend

```bash
npm run dev    # Start development server with Vite
npm run build  # Build for production
npm run preview # Preview production build
```

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React.js Documentation](https://react.dev/)
- [JWT Authentication](https://jwt.io/)
- [Mongoose Documentation](https://mongoosejs.com/)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to fork the project and submit pull requests with improvements.

## 📧 Support

For issues or questions, please create an issue in the project repository.

---

**Happy booking! 🦷✨**

Built with ❤️ using the MERN stack
