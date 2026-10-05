import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../../Firebase/firebase";
import { useAuth } from "../../Context/AuthContext";

import "./UserList.scss";

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");

        const snapshot = await getDocs(usersRef);

        console.log("Firestore users count:", snapshot.size);

        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("All Firestore users:", usersData);
        console.log("Current logged-in user:", user);

        // Remove currently logged-in user
        const otherUsers = usersData.filter(
          (otherUser) => otherUser.uid !== user.uid
        );

        console.log("Other users:", otherUsers);

        setUsers(otherUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="user-list">
        <div className="user-list-header">
          <h2>User</h2>
        </div>

        <p className="user-loading">
          Loading users...
        </p>
      </div>
    );
  }

  // =====================================
  // USER LIST
  // =====================================

  return (
    <div className="user-list">

      {/* USER LIST HEADING */}
      <div className="user-list-header">
        <h2>User</h2>
      </div>

      {users.length === 0 ? (
        <p className="no-users">
          No users found
        </p>
      ) : (
        users.map((otherUser) => (
          <div
            className="user-item"
            key={otherUser.id}
            onClick={() => onSelectUser(otherUser)}
          >

            {/* USER AVATAR */}
            <div className="user-avatar">
              {otherUser.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            {/* USER NAME */}
            <div className="user-info">
              <p className="user-name">
                {otherUser.name}
              </p>
                <p
                className={
                  otherUser.online
                    ? "user-status online"
                    : "user-status offline"
                }
              >
                <span className="status-dot"></span>
          
                {otherUser.online ? "Online" : "Offline"}
              </p>
            </div>

          </div>
        ))
      )}

    </div>
  );
};

export default UserList;