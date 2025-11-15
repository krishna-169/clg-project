# Campus Hub - Supabase Integration Setup Guide

This guide will help you set up Supabase for your Campus Hub application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js installed (for local development)

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Campus Hub (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (takes ~2 minutes)

## Step 2: Set Up Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the SQL
6. You should see "Success. No rows returned" message

This will create all necessary tables:
- `profiles` - User profiles with name and phone
- `events` - Campus events
- `jobs` - Job listings
- `marketplace` - Marketplace items
- `bids` - Bids on marketplace items
- `feedback` - User feedback
- `budget_expenses` - Budget tracker expenses
- `todos` - User todo items
- `rewards` - User rewards

## Step 3: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 4: Configure Your Application

### For Local Development:

1. Create a file `js/env.js` in your project:

```javascript
// js/env.js
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key-here';
```

2. **Important**: Add `js/env.js` to your `.gitignore` file to avoid committing credentials:

```
# .gitignore
js/env.js
```

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add two environment variables:
   - **Name**: `SUPABASE_URL`, **Value**: Your Supabase project URL
   - **Name**: `SUPABASE_ANON_KEY`, **Value**: Your Supabase anon key
4. The `scripts/write-env.js` script will automatically generate `js/env.js` during build

### For Other Hosting Platforms:

Set the following environment variables in your hosting platform:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Then ensure the build script runs: `node scripts/write-env.js`

## Step 5: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

## Step 6: Test Your Integration

1. Start your application locally or deploy it
2. Try these features:
   - **Sign Up**: Create a new account
   - **Login**: Sign in with your credentials
   - **Post Event**: Create a new event (requires login)
   - **Post Job**: Create a job listing (requires login)
   - **Marketplace**: Add an item to sell (requires login)
   - **Budget Tracker**: Add expenses (requires login)
   - **Todo List**: Add tasks (requires login)

## Features Integrated with Supabase

### ✅ Authentication
- User signup with email verification
- Login/logout
- Password reset
- Session management

### ✅ User Profiles
- Store user name and phone number
- Update profile information

### ✅ Events
- Create campus events
- View all events
- Automatic reward system for posting events

### ✅ Jobs
- Post job listings
- Filter jobs by type and skills
- View all available jobs

### ✅ Marketplace
- List items for sale
- Password-protected bidding rooms
- Place bids on items

### ✅ Feedback
- Submit feedback (works for both logged-in and anonymous users)

### ✅ Personal Workspace
- **Budget Tracker**: Track expenses by category (food, school, other)
- **Todo List**: Manage personal tasks
- Data synced across devices

### ✅ Rewards System
- Automatic rewards for posting events
- Track all earned rewards

## Database Security

All tables have Row Level Security (RLS) enabled with the following policies:

- **Profiles**: Users can only view/update their own profile
- **Events**: Anyone can view, only authenticated users can create
- **Jobs**: Anyone can view, only authenticated users can create
- **Marketplace**: Anyone can view active items, only owners can modify
- **Bids**: Users can only see bids on their items or their own bids
- **Budget/Todos**: Users can only access their own data
- **Feedback**: Anyone can submit, users can view their own

## Troubleshooting

### "Supabase not initialized" error
- Check that `js/env.js` exists and contains valid credentials
- Verify your Supabase project is active
- Check browser console for detailed error messages

### Authentication not working
- Verify email provider is enabled in Supabase dashboard
- Check that email confirmation is not required (or handle confirmation emails)
- Ensure your Supabase project URL and anon key are correct

### Data not saving
- Check browser console for errors
- Verify RLS policies are set up correctly
- Ensure user is authenticated for protected operations

### Build errors on Vercel
- Verify environment variables are set correctly
- Check that `scripts/write-env.js` is running during build
- Ensure `package.json` has the correct build script

## Optional: Email Confirmation

By default, Supabase requires email confirmation. To disable for testing:

1. Go to **Authentication** → **Settings**
2. Scroll to "Email Auth"
3. Toggle off "Enable email confirmations"

**Note**: For production, keep email confirmation enabled for security.

## Support

For issues specific to:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Campus Hub**: Check the main README or create an issue

## Next Steps

1. Customize email templates in Supabase dashboard
2. Set up storage buckets for image uploads (optional)
3. Configure custom domain for Supabase project (optional)
4. Set up database backups
5. Monitor usage in Supabase dashboard

---

**Security Note**: Never commit your Supabase credentials to version control. Always use environment variables for production deployments.