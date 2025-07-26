# Firebase Email Configuration Guide

## Why Password Reset Emails Might Not Be Working

There are several reasons why you might not be receiving password reset emails:

### 1. Firebase Authentication Email Templates Not Configured

**Go to Firebase Console:**

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `lineless-f84fc`
3. Go to **Authentication** → **Templates**
4. Click on **Password reset** template
5. Make sure it's **enabled** and configured properly

### 2. Email Verification Settings

**Check these settings in Firebase Console:**

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Make sure your domain is listed (for localhost: `localhost`)
3. Go to **Authentication** → **Sign-in method**
4. Ensure **Email/Password** is enabled

### 3. SMTP Configuration (Advanced)

If you're using custom email templates:

1. Go to **Authentication** → **Templates**
2. Click **Customize** for password reset
3. Configure SMTP settings if needed

### 4. Common Issues & Solutions

#### Issue: Emails going to Spam/Junk

- **Solution**: Check spam/junk folder
- **Prevention**: Add `noreply@lineless-f84fc.firebaseapp.com` to contacts

#### Issue: Email delivery delays

- **Solution**: Wait 5-10 minutes
- **Note**: Firebase emails can take time during peak hours

#### Issue: User not found error

- **Solution**: Make sure the email is exactly the same as used during signup
- **Check**: Case sensitivity matters

#### Issue: Domain not authorized

- **Solution**: Add your domain to Firebase authorized domains
- For development: Add `localhost`
- For production: Add your actual domain

### 5. Testing Steps

1. **Test with a real email account** you have access to
2. **Check multiple email folders** (Inbox, Spam, Promotions, etc.)
3. **Wait a few minutes** before retrying
4. **Try with different email providers** (Gmail, Yahoo, Outlook)

### 6. Firebase Console Checklist

✅ **Authentication is enabled**
✅ **Email/Password sign-in method is enabled**
✅ **Password reset template is enabled**
✅ **Authorized domains include your domain**
✅ **No quota limits exceeded**

### 7. Code Improvements Made

The code has been updated with:

- ✅ Better error handling
- ✅ Action code settings for proper redirects
- ✅ More descriptive success/error messages
- ✅ Spam folder reminder in success message

### 8. If Still Not Working

1. **Check Firebase Console Logs:**

   - Go to **Authentication** → **Users**
   - Look for error logs

2. **Try with Gmail:**

   - Gmail has good Firebase integration
   - Less likely to block Firebase emails

3. **Contact Firebase Support:**
   - If emails still don't work after checking above
   - May be a Firebase service issue

### 9. Alternative Testing

You can test if the function works by:

1. Checking if the success message appears
2. Looking for any error messages
3. Verifying the email exists in Firebase Auth Users

---

**Note:** The most common issue is emails going to spam/junk folder or Firebase email templates not being properly configured in the console.
