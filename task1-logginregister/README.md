# Task 1 – Login and Registration System

A simple full-stack login and registration application built with **JavaScript**, **Node.js**, **Express**, and **SQLite**. The frontend uses plain HTML, CSS, and JavaScript (no React).

## Features

- User registration with name, email, and password
- Login for users who have registered successfully
- User information stored in an SQLite database (`data/users.db`)
- Passwords hashed using bcrypt before being stored
- Login session stored in an HTTP-only cookie
- Session restoration when the page is refreshed
- Logout functionality
- Input validation, parameterized SQL queries, and basic rate limiting
- Responsive interface

## Technology stack

| Part | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite (`better-sqlite3`) |
| Password hashing | bcryptjs |
| Session token | JSON Web Token in an HTTP-only cookie |

## Requirements

- Node.js 20 or later
- npm (included with Node.js)

## Run the project locally

1. Open a terminal in this project folder.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create your environment file by copying `.env.example` to `.env`.

   Windows Command Prompt:

   ```bat
   copy .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

4. Open `.env` and replace `JWT_SECRET` with a long random value (at least 32 characters). Keep `.env` private and do not upload it to GitHub.
5. Start the application:

   ```bash
   npm start
   ```

6. Open **http://localhost:3000** in your browser.

The SQLite database and `users` table are created automatically the first time the server starts.

## How to test

1. Open the application and select **Register**.
2. Enter a name, a valid email address, and a password containing at least 8 characters.
3. Submit the form. A successful registration message should appear, and the email will be filled into the login form.
4. Log in using the same email and password.
5. The dashboard should display the logged-in user's name and email.
6. Refresh the browser. The user should remain logged in because the session cookie is still valid.
7. Select **Logout**. The login form should appear again.
8. Try registering with the same email again; the app should report that the account already exists.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Verify credentials and log in |
| GET | `/api/auth/me` | Get the current user's profile |
| POST | `/api/auth/logout` | End the current login session |

### Example registration request

```json
{
  "name": "Alex Thomas",
  "email": "alex@example.com",
  "password": "examplePassword123"
}
```

## Project structure

```text
task1-login-registration/
├── data/                 # SQLite database is created here
├── public/
│   ├── app.js             # Frontend JavaScript
│   ├── index.html         # Frontend page
│   └── styles.css         # Styling
├── src/
│   └── db.js              # SQLite database setup
├── .env.example           # Example environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js              # Express server and authentication API
```

## Important security notes

- Passwords are never stored as plain text; bcrypt hashes are saved instead.
- SQL statements use placeholders to avoid SQL injection through user input.
- The session cookie is HTTP-only and uses `SameSite=Strict`.
- Authentication routes have a basic rate limit.
- For a public production deployment, use HTTPS, a strong unique secret, and review the authentication and deployment configuration for your environment.

## GitHub upload

Create an empty repository on GitHub, then run these commands from this project folder (replace the URL with your own repository URL):

```bash
git init
git add .
git commit -m "Add login and registration application"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/task1-login-registration.git
git push -u origin main
```

Do not add your `.env` file or `node_modules` folder to GitHub. The `.gitignore` file already excludes them.
