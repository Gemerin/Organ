export const cookieConfig = {
  httpOnly: true, // Prevent access via JavaScript
  secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
  sameSite: 'Strict', // Prevent CSRF
  maxAge: 3600000 // 1 hour (in milliseconds)
}
