import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {

    try {

      return (
        JSON.parse(
          localStorage.getItem("skillhire_user")
        ) || null
      );

    } catch {

      return null;

    }

  });


  const [loading, setLoading] = useState(true);


  /* --------------------------------
     Check existing login
  -------------------------------- */

  useEffect(() => {

    const token =
      localStorage.getItem("skillhire_token");

    if (!token) {

      setLoading(false);
      return;

    }


    getProfile()

      .then((data) => {

        const serverUser =
          data.user || data;


        const savedProfile =
          JSON.parse(
            localStorage.getItem(
              "skillhire_profile"
            ) || "null"
          );


        const mergedUser = {

          ...serverUser,

          ...(savedProfile || {}),

        };


        setUser(mergedUser);


        localStorage.setItem(
          "skillhire_user",
          JSON.stringify(mergedUser)
        );

      })

      .catch(() => {

        localStorage.removeItem(
          "skillhire_token"
        );

        localStorage.removeItem(
          "skillhire_user"
        );

        setUser(null);

      })

      .finally(() => {

        setLoading(false);

      });

  }, []);


  /* --------------------------------
     Login
  -------------------------------- */

  const login = (data) => {

    const savedProfile =
      JSON.parse(
        localStorage.getItem(
          "skillhire_profile"
        ) || "null"
      );


    const mergedUser = {

      ...(data.user || {}),

      ...(savedProfile || {}),

    };


    localStorage.setItem(
      "skillhire_token",
      data.token
    );


    localStorage.setItem(
      "skillhire_user",
      JSON.stringify(mergedUser)
    );


    setUser(mergedUser);

  };


  /* --------------------------------
     Update profile
  -------------------------------- */

  const updateProfile = (profileData) => {

    const updatedUser = {

      ...(user || {}),

      ...profileData,

    };


    localStorage.setItem(
      "skillhire_profile",
      JSON.stringify(updatedUser)
    );


    localStorage.setItem(
      "skillhire_user",
      JSON.stringify(updatedUser)
    );


    setUser(updatedUser);

  };


  /* --------------------------------
     Logout
  -------------------------------- */

  const logout = () => {

    localStorage.removeItem(
      "skillhire_token"
    );

    localStorage.removeItem(
      "skillhire_user"
    );

    localStorage.removeItem(
      "skillhire_profile"
    );

    setUser(null);

  };


  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfile,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  return useContext(AuthContext);

}