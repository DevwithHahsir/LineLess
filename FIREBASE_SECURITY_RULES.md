# Firebase Security Rules for LineLess Project

## How to Apply These Rules

1. **Go to Firebase Console**: Visit https://console.firebase.google.com/
2. **Select Your Project**: Click on "lineless-f84fc"
3. **Navigate to Firestore**: Go to "Firestore Database" in the left sidebar
4. **Open Rules Tab**: Click on the "Rules" tab
5. **Copy Rules**: Copy the entire content from `firestore.rules` file
6. **Paste and Publish**: Paste into the Firebase console and click "Publish"

## What These Rules Do

### 🔐 **Security Features**

#### **User Authentication & Authorization**

- ✅ Only authenticated users can access sensitive data
- ✅ Users can only access their own profile data
- ✅ Role-based access control (client, provider, admin)
- ✅ Email validation for all user registrations

#### **Business Registration Security**

- ✅ Anyone can read business info (for public discovery)
- ✅ Only authenticated users can register businesses
- ✅ Business owners can update their own business data
- ✅ System can automatically increment/decrement appointment counts
- ✅ Validates business category and required fields

#### **Appointment Security**

- ✅ Clients can only create appointments with their own user ID
- ✅ Clients can view their own appointments
- ✅ Providers can view appointments for their businesses only
- ✅ Proper validation of appointment data structure
- ✅ Controlled status updates (pending → confirmed → completed)

### 📊 **Collections Covered**

1. **`users`** - Role management and user types
2. **`userSignup`** - Detailed user profiles with contact info
3. **`businessRegistrations`** - Main business data and queue counts
4. **`appointments`** - Booking records with client and business info
5. **`providerSignup`** - Legacy provider data (backward compatibility)
6. **`BusinessProviderForm`** - Legacy business data (backward compatibility)

### 🛡️ **Protection Against**

- ❌ Unauthorized data access
- ❌ Users modifying other users' data
- ❌ Invalid email addresses
- ❌ Malicious appointment count manipulation
- ❌ Clients accessing other clients' appointments
- ❌ Providers accessing other providers' business data
- ❌ Invalid appointment status changes
- ❌ Data injection attacks

### 🚀 **Features Enabled**

- ✅ **Public Business Discovery**: Anyone can browse available businesses
- ✅ **Secure Appointment Booking**: Users can book appointments with validation
- ✅ **Provider Dashboard**: Business owners can see their appointments
- ✅ **Client Dashboard**: Users can view their booking history
- ✅ **Automatic Queue Management**: Count increments/decrements safely
- ✅ **Role-based Access**: Different permissions for clients vs providers

### 🔧 **Testing Your Rules**

After applying the rules, test these scenarios:

1. **Try booking an appointment** - Should work for authenticated users
2. **Try viewing business list** - Should work for everyone
3. **Try accessing another user's data** - Should be denied
4. **Try updating appointment count manually** - Should be denied
5. **Try creating invalid appointment data** - Should be denied

### ⚠️ **Important Notes**

- These rules assume you're using Firebase Authentication
- Make sure your app handles authentication properly
- Test thoroughly in a development environment first
- Monitor Firebase console for any security rule violations
- Update rules if you add new collections or change data structure

### 🔄 **Future Updates**

If you add new features or collections, update the rules accordingly:

- Add new collection rules following the same security patterns
- Test new rules thoroughly
- Consider adding more granular permissions if needed

---

## Quick Commands for Testing

```bash
# Test rules locally (if you have Firebase CLI)
firebase emulators:start --only firestore

# Deploy rules to production
firebase deploy --only firestore:rules
```

These rules provide comprehensive security for your LineLess application while maintaining the functionality needed for appointment booking and business discovery.
