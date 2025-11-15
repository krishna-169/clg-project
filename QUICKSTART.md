# 🚀 Campus Hub - Quick Start Guide

Your Supabase credentials are already configured! Follow these simple steps to get started.

## Step 1: Set Up Database (One-time setup)

1. **Open the setup page:**
   - Open `setup-supabase.html` in your browser
   - OR visit: `file:///path/to/your/project/setup-supabase.html`

2. **Follow the on-screen instructions:**
   - The page will check your connection
   - Copy the SQL schema
   - Paste it in Supabase SQL Editor
   - Click "Run"
   - Return and verify

**Alternative:** Manually run the SQL:
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga/sql/new)
2. Copy all content from `supabase-schema.sql`
3. Paste and click "Run"

## Step 2: Enable Email Authentication

1. Go to [Authentication Settings](https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga/auth/providers)
2. Make sure **Email** provider is enabled
3. (Optional) Disable email confirmation for testing:
   - Go to Authentication → Settings
   - Toggle off "Enable email confirmations"

## Step 3: Start Using Campus Hub!

Open `index.html` in your browser and:

### ✅ Create an Account
- Click "Login" in the navigation
- Switch to "Sign Up" tab
- Enter your details
- Create account

### ✅ Try Features
- **Post an Event** - Earn rewards automatically!
- **Add a Job** - Share opportunities
- **List an Item** - Sell in the marketplace
- **Use Workspace** - Budget tracker & todos sync across devices

## 🎯 What's Working Now

- ✅ User authentication (signup/login)
- ✅ Events with automatic rewards
- ✅ Job board with filters
- ✅ Marketplace with bidding
- ✅ Budget tracker (cloud-synced)
- ✅ Todo list (cloud-synced)
- ✅ Feedback system
- ✅ User profiles

## 🔧 Your Credentials

**Supabase URL:** `https://ltxvnsqiufatmtkmrwga.supabase.co`
**Project Dashboard:** [Click here](https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga)

## 📊 Monitor Your App

Visit your [Supabase Dashboard](https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga) to:
- View database tables
- Check API usage
- Monitor authentication
- See real-time logs

## 🐛 Troubleshooting

**Can't sign up?**
- Check that email provider is enabled
- Disable email confirmation for testing
- Check browser console for errors

**Data not saving?**
- Make sure you're logged in
- Check that SQL schema was run successfully
- Verify in Supabase dashboard that tables exist

**Connection issues?**
- Verify credentials in `js/env.js`
- Check that your Supabase project is active
- Look for errors in browser console

## 🎉 You're All Set!

Your Campus Hub is now powered by Supabase with:
- Cloud database
- User authentication
- Real-time sync
- Secure data storage

Start exploring and building! 🚀