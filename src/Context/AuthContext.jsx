import React, {createContext,useContext,useEffect,useState,} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

import { auth, db } from "../Firebase/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================
  // AUTH STATE
  // =====================================

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          const userRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          await updateDoc(userRef, {
            online: true,
          });

          console.log("User is online");
        } catch (error) {
          console.error(
            "Error setting online status:",
            error
          );
        }
      }
    }
  );

  return () => unsubscribe();
}, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};