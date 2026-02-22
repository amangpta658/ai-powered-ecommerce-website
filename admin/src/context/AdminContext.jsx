import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext";
import axios from "axios";

export const adminDataContext = createContext();

function AdminContext({ children }) {

  const [adminData, setAdminData] = useState(null);
  const { serverUrl } = useContext(authDataContext);

  const getAdmin = async () => {
    try {
      if (!serverUrl) return;   //  important safety

      const result = await axios.get(
        serverUrl + "/api/user/getadmin",
        { withCredentials: true }
      );

      setAdminData(result.data);
      console.log("Admin Data:", result.data);

    } catch (error) {
      console.log("Admin Fetch Error:", error);
      setAdminData(null);
    }
  };

  useEffect(() => {
    if (serverUrl) {
      getAdmin();
    }
  }, [serverUrl]);  //  dependency add ki

  return (
    <adminDataContext.Provider value={{ adminData, setAdminData, getAdmin }}>
      {children}
    </adminDataContext.Provider>
  );
}

export default AdminContext;