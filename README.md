
## Environment Variables

Create a `.env` file in the root directory with the following required variables:

### Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | The port for the connection of the API | `3001` |
| `JWT_SECRET` | JWT hash for protect uris | `1c321eef62ca...` |
| `JWT_TIME` | Expiration time (in seconds) for generated JWT tokens | `3600` |
| `PEPPER_HASHING` | Adding to passwords extra protection for brute force tactics | `a9ab3f7f7...` |
| `MONGO_URI` | The URI of connection of the database (MONGODB) | `mongodb://127.0.0.1:27017/your-database-name` |
| `REDIS_URI` | Redis connection URI for rate limiter storage | `redis://127.0.0.1:6379` |
| `COLLECTION_USERS` | The name of the collections inside the database for users | `users` |
| `COOKIE_TIME` | Cookie lifetime in milliseconds | `86400000` |
| `COOKIE_DOMAIN` | Domain used for auth cookies | `.seyiwb.com` |
| `COOKIE_SECURE` | Whether to use secure cookies (`true` in production) | `true` |
| `CORS_ORIGINS` | Allowed CORS origins separated by commas | `https://seyiwb.com,https://app.seyiwb.com` |
| `EMAIL_VERIFICATION_URL` | Frontend URL where users verify email; token is appended as query param | `https://app.seyiwb.com/verify-email` |
| `EMAIL_VERIFICATION_TOKEN_TTL_MS` | Email verification token lifetime in milliseconds | `86400000` |
| `BREVO_API_KEY` | API key for Brevo email campaigns API | `xkeysib-...` |
| `BREVO_SENDER_EMAIL` | Sender email address used by Brevo | `no-reply@yourdomain.com` |
| `BREVO_SENDER_NAME` | Sender display name used by Brevo | `Seyiwb` |
| `BREVO_VERIFICATION_LIST_ID` | ID of the Brevo contact list targeted by verification email campaigns | `2` |

## Auth Endpoints

- `POST /auth/signin`: Creates a user and sends verification email.
- `GET /auth/verify-email?token=...`: Verifies the email using token.
- `POST /auth/resend-verification`: Sends a new verification email. Body: `{ "email": "user@example.com" }`.
- `POST /auth/login`: Requires verified email before login succeeds.