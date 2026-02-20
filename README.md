
## Environment Variables

Create a `.env` file in the root directory with the following required variables:

```
PORT=3000
JWT_SECRET=your_secret
PEPPER_HASHING=your_secret_pepper

MONGO_URI=your_database_name
COLLECTION_USERS=collection_users_name
```

### Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | The port for the connection of the API | `3001` |
| `JWT_SECRET` | JWT hash for protect uris | `1c321eef62ca...` |
| `PEPPER_HASHING` | Adding to passwords extra protection for brute force tactics | `a9ab3f7f7...` |
| `MONGO_URI` | The URI of connection of the database (MONGODB) | `mongodb://127.0.0.1:27017/your-database-name` |
| `COLLECTION_USERS` | The name of the collections inside the database for users | `users` |