// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // "client" | "provider"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Check if user exists in clientusers collection
        const clientRef = doc(db, "clientusers", user.uid);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          setUserRole("client");
        } else {
          // Check if user exists in providers collection
          const providerRef = doc(db, "providers", user.uid);
          const providerSnap = await getDoc(providerRef);

          if (providerSnap.exists()) {
            setUserRole("provider");
          } else {
            setUserRole(null); // Unknown role
          }
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context easily
// Moved to useAuth.js for Fast Refresh compatibility
