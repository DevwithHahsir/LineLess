// Simple test file to verify our authentication context works
import { AuthContextProvider, AuthContext } from "./enhancedContext";
import { useAuth } from "./useAuth";

// Test that the context is properly structured
console.log("AuthContext:", AuthContext);
console.log("AuthContextProvider:", AuthContextProvider);
console.log("useAuth:", useAuth);

export { AuthContextProvider, AuthContext, useAuth };
