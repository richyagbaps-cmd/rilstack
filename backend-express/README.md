RILSTACK SeaTable Express Backend

This is a standalone Express.js backend implementation for SeaTable-backed registration, login, and profile management with NIN uniqueness.

Setup

1. Open terminal in backend-express
2. Install dependencies
   npm install
3. Copy environment template
   copy .env.example .env
4. Fill required env values in .env
5. Start server
   npm start

Endpoints

- POST /auth/register
- POST /auth/login
- GET /profile
- PUT /profile
- GET /health

Notes

- NIN uniqueness and Email uniqueness are enforced at registration.
- Password and PIN are hashed with bcrypt salt rounds 10.
- JWT token expires in 7 days by default.
- KYC_Status defaults to pending.
- Is_Active defaults to true.
- Login updates Last_Login and increments Login_Count.
