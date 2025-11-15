# 🖼️ Visual Step-by-Step Guide

## 📋 Step 1: Set Up Database Tables

### 1.1 Open the SQL Editor

**Click this link:** https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga/sql/new

**What you'll see:**
- A page with "SQL Editor" at the top
- A big empty text box in the middle
- A green "RUN" button at the bottom right

---

### 1.2 Get the SQL Code

**On your computer:**
1. Find the file `supabase-schema-fixed.sql` in your project folder
2. Right-click on it
3. Choose "Open with" → "Notepad" (Windows) or "TextEdit" (Mac)

**What you'll see:**
- A text file with lots of SQL code
- Lines starting with `CREATE TABLE`, `CREATE POLICY`, etc.

---

### 1.3 Copy the SQL Code

**In the text editor:**
1. Press `Ctrl+A` (Windows) or `Cmd+A` (Mac)
   - This selects all the text
   - Everything should be highlighted in blue
2. Press `Ctrl+C` (Windows) or `Cmd+C` (Mac)
   - This copies the text
   - Nothing visible happens, but it's copied!

---

### 1.4 Paste in Supabase

**Back in your web browser (Supabase SQL Editor):**
1. Click inside the big empty text box
2. Press `Ctrl+V` (Windows) or `Cmd+V` (Mac)
   - The SQL code should appear in the box
   - You should see lots of text

---

### 1.5 Run the SQL

**In Supabase:**
1. Look at the bottom right corner
2. Click the green "RUN" button
3. Wait 5-10 seconds

**What you should see:**
- A green message saying "Success. No rows returned"
- OR "Success" with some numbers

**If you see errors:**
- Look for the word "ERROR" in red
- Copy the error message
- Send it to me and I'll help fix it

---

## 🔐 Step 2: Enable Email Login

### 2.1 Open Authentication Settings

**Click this link:** https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga/auth/providers

**What you'll see:**
- A page titled "Auth Providers"
- A list of login methods (Email, Google, etc.)

---

### 2.2 Check Email is Enabled

**Look for "Email" in the list:**
- If it has a green dot or says "Enabled" → Good! Move to next step
- If it says "Disabled" → Click on it, then click "Enable"

---

### 2.3 Disable Email Confirmation (For Testing)

**Click this link:** https://supabase.com/dashboard/project/ltxvnsqiufatmtkmrwga/auth/url-configuration

**Scroll down until you see:**
- "Enable email confirmations"
- A toggle switch (like a light switch)

**Turn it OFF:**
- Click the toggle so it moves to the LEFT
- It should turn gray
- Click "Save" button at the bottom

**Why?** This lets you test without checking email every time.

---

## 🎮 Step 3: Test Your App

### 3.1 Open Your App

**On your computer:**
1. Go to your project folder
2. Find the file `index.html`
3. Double-click it
   - It should open in your web browser (Chrome, Firefox, etc.)

**What you'll see:**
- Your Campus Hub website
- A navigation bar at the top
- "Login" button in the top right

---

### 3.2 Create an Account

**Click "Login" button**

**What you'll see:**
- A login form
- Two tabs: "User" and "Admin"
- Make sure "User" tab is selected

**Click "Sign Up" link at the bottom**

**Fill in the form:**
- **Full Name:** Type your name (e.g., "John Doe")
- **Email:** Type any email (e.g., "test@example.com")
- **Password:** Type any password (at least 6 characters)

**Click "Create Account" button**

---

### 3.3 Success!

**If it works, you'll see:**
- A popup saying "Account created!"
- The page changes to the home page
- "Login" button changes to "Logout"

**Now you can:**
- Click "Explore" to see events
- Click "Jobs" to see job listings
- Click "Workspace" to use budget tracker and todos
- Try posting an event to earn rewards!

---

## ❌ Common Problems and Solutions

### Problem 1: "Supabase not initialized"
**Solution:**
- Make sure you completed Step 1 (SQL setup)
- Refresh the page (press F5)
- Check that `js/env.js` file exists

### Problem 2: "Authentication failed"
**Solution:**
- Make sure you completed Step 2 (Enable email)
- Try a different email address
- Make sure password is at least 6 characters

### Problem 3: SQL errors when running
**Solution:**
- Make sure you copied ALL the SQL code
- Try copying and pasting again
- If you see "already exists" errors, that's OK!

### Problem 4: Nothing happens when I click buttons
**Solution:**
- Open browser console (press F12)
- Look for red error messages
- Take a screenshot and send it to me

---

## ✅ Checklist

Before asking for help, make sure you:
- [ ] Ran the SQL in Supabase (Step 1)
- [ ] Enabled Email authentication (Step 2)
- [ ] Disabled email confirmation (Step 2.3)
- [ ] Opened index.html in a web browser
- [ ] Tried creating an account

---

## 🆘 Still Need Help?

If you're stuck:
1. Tell me which step you're on (1, 2, or 3)
2. Tell me what you see on your screen
3. If there's an error, copy the exact error message
4. I'll help you fix it!

---

**Remember:** You only need to do Steps 1 and 2 ONCE. After that, just open index.html and use your app!