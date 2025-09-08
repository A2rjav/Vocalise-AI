// Config for production deployment
export const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://vocalise-ai-backend.onrender.com'  // Update this with your actual backend URL after deployment
    : 'http://localhost:3001'
};
