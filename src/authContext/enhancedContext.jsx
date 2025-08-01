// Enhanced Authentication Context with Role Management
// Replace your authContext/context.jsx with this enhanced version

import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Try to get user role from different collections
          let role = null;

          // Check if user exists in userSignup collection
          const userDoc = await getDoc(doc(db, "userSignup", user.uid));
          if (userDoc.exists()) {
            role = "user";
          }

          // Check if user exists in providerSignup collection
          const providerDoc = await getDoc(doc(db, "providerSignup", user.uid));
          if (providerDoc.exists()) {
            role = "provider";
          }

          // Check if user has business data
          const businessDoc = await getDoc(
            doc(db, "BusinessProviderForm", user.uid)
          );
          if (businessDoc.exists()) {
            role = "provider"; // Override to provider if they have business data
          }

          setUserRole(role);

          // Store role in a central users collection for future reference
          if (role) {
            await setDoc(
              doc(db, "users", user.uid),
              {
                email: user.email,
                role: role,
                lastLogin: new Date(),
                uid: user.uid,
              },
              { merge: true }
            );
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    isUser: userRole === "user",
    isProvider: userRole === "provider",
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// useAuth hook moved to a separate file (useAuth.js)
