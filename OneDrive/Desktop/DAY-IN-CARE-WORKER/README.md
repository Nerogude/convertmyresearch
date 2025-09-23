# Care Worker Training Platform

A comprehensive training simulator for care workers with licensing system.

## Features
- 22 training scenarios
- Trial system (2 free scenarios)
- Stripe payment integration
- Manager dashboard
- Progress tracking

## Deployment

This app is configured for Render deployment using `render.yaml`.

### Manual Setup (Alternative)
If Blueprint doesn't work, you can deploy manually:

1. **Create New Web Service** on Render
2. **Connect GitHub repo**: `Nerogude/care-worker-training`
3. **Build Command**: `cd server && npm install`
4. **Start Command**: `cd server && npm start`
5. **Add Environment Variables**:
   - `NODE_ENV=production`
   - `STRIPE_PUBLISHABLE_KEY=your_key`
   - `STRIPE_SECRET_KEY=your_key`
   - `STRIPE_WEBHOOK_SECRET=your_secret`
   - `DATABASE_URL=your_mysql_url`

## Tech Stack
- Node.js + Express
- MySQL
- Stripe Payments
- JWT Authentication