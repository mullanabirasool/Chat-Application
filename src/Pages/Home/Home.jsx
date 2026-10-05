import React, { useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp,} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth,db } from "../../Firebase/firebase";
import UserList from "../../Components/UserList/UserList";
import ChatWindow from "../../Components/ChatWindow/ChatWindow";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {doc,updateDoc} from "firebase/firestore"

import "./Home.scss";

const Home = () => {

  const [selectedUser, setSelectedUser] = useState(null);

  const [conversationId, setConversationId] = useState(null);

  const { user } = useAuth();

  const navigate = useNavigate();

 const handleSelectUser = async (otherUser) => {
  if (!user) {
    console.error("User is not logged in");
    return;
  }

  try {
    // Clear previous conversation
    setConversationId(null);

    // Select the new user
    setSelectedUser(otherUser);

    const conversationsRef = collection(
      db,
      "conversations"
    );

    const q = query(
      conversationsRef,
      where(
        "participants",
        "array-contains",
        user.uid
      )
    );

    const snapshot = await getDocs(q);

    let existingConversation = null;

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.participants.includes(otherUser.uid)) {
        existingConversation = {
          id: doc.id,
          ...data,
        };
      }
    });

    // Existing conversation
    if (existingConversation) {
      console.log(
        "Existing conversation:",
        existingConversation.id
      );

      setConversationId(
        existingConversation.id
      );

      return;
    }

    // Create new conversation
    const newConversation = await addDoc(
      conversationsRef,
      {
        participants: [
          user.uid,
          otherUser.uid,
        ],
        createdAt: serverTimestamp(),
      }
    );

    console.log(
      "New conversation created:",
      newConversation.id
    );

    setConversationId(newConversation.id);

  } catch (error) {
    console.error(
      "Error creating/finding conversation:",
      error
    );
  }
};
 const handleLogout = async () => {
  try {
    if (user) {
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        online: false,
      });
    }

    await signOut(auth);

    console.log("User logged out successfully");

    setSelectedUser(null);
    setConversationId(null);

    navigate("/login");

  } catch (error) {
    console.error("Logout error:", error);
  }
};
  return (
    <div className="home-container">

  <div className="home-header">

    <h1>Chat Application</h1>

    <button
      className="logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>

  </div>

  <div className="chat-body">

    <UserList
      onSelectUser={handleSelectUser}
    />

    <ChatWindow
      selectedUser={selectedUser}
      conversationId={conversationId}
    />

  </div>

</div> 
 );
};

export default Home;