# 📝 Step-by-Step Setup Instructions

## Step 1: Set Up Your Database Tables

### What to do:
You need to create tables in your Supabase database. Think of tables like Excel sheets where your app will store data.

### How to do it:

1. **Open Supabase SQL Editor:**
   - Click this link: https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga/sql/new
   - You should see a page with a big text box

2. **Copy the SQL code:**
   - Open the file `supabase-schema-fixed.sql` (I just created this for you)
   - Press `Ctrl+A` (Windows) or `Cmd+A` (Mac) to select all
   - Press `Ctrl+C` (Windows) or `Cmd+C` (Mac) to copy

3. **Paste in Supabase:**
   - Click inside the big text box in Supabase
   - Press `Ctrl+V` (Windows) or `Cmd+V` (Mac) to paste
   - You should see a lot of SQL code

4. **Run the code:**
   - Click the green "RUN" button at the bottom right
   - Wait 5-10 seconds
   - You should see "Success" message

### What if I see an error?
- If you see "already exists" errors, that's OK! It means some tables are already created.
- If you see other errors, copy the error message and show it to me.

---

## Step 2: Enable Email Login

### What to do:
Allow users to sign up with email and password.

### How to do it:

1. **Open Authentication Settings:**
   - Click this link: https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga/auth/providers

2. **Check Email is enabled:**
   - Look for "Email" in the list
   - Make sure it has a green checkmark or says "Enabled"
   - If not, click on it and enable it

3. **Disable email confirmation (for testing):**
   - Click this link: https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga/auth/url-configuration
   - Scroll down to find "Enable email confirmations"
   - Turn it OFF (toggle to the left)
   - Click "Save"

---

## Step 3: Test Your App

1. **Open your app:**
   - Double-click `index.html` file
   - It should open in your web browser

2. **Create an account:**
   - Click "Login" button at the top
   - Click "Sign Up" tab
   - Enter:
     - Name: Your name
     - Email: your.email@example.com
     - Password: any password (at least 6 characters)
   - Click "Create Account"

3. **If it works:**
   - You'll see "Account created!" message
   - You can now use all features!

4. **If it doesn't work:**
   - Take a screenshot of any error message
   - Show it to me and I'll help fix it

---

## ✅ You're Done!

Once you complete these 3 steps, your Campus Hub will be fully working with:
- User accounts
- Cloud storage
- All features synced across devices

Need help? Just ask me!