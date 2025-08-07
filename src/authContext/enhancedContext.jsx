import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig/firebase";
import { AuthContext } from "./AuthContext";
// Context Provider
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userId = currentUser.uid;

        // Check in providerSignup
        const providerRef = doc(db, "providerSignup", userId);
        const providerSnap = await getDoc(providerRef);

        if (providerSnap.exists()) {
          setUser({ ...providerSnap.data(), role: "provider", uid: userId });
        } else {
          // Check in userSignup
          const userRef = doc(db, "userSignup", userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUser({ ...userSnap.data(), role: "user", uid: userId });
          } else {
            setUser(null); // Not found in either collection
          }
        }
      } else {
        setUser(null); // Logged out
      }
    });

    return () => unsubscribe(); // Clean up listener
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

// useAuth hook moved to useAuth.js for Fast Refresh compatibility
