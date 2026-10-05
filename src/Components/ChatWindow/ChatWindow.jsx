import React, { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../../Firebase/firebase";
import { useAuth } from "../../Context/AuthContext";

import "./ChatWindow.scss";


const ChatWindow = ({ selectedUser, conversationId }) => {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  // Controls which three-dot menu is open
  const [openMenu, setOpenMenu] = useState(null);

  const { user } = useAuth();


  // =====================================
  // FORMAT MESSAGE TIME
  // =====================================

  const formatTime = (timestamp) => {

    if (!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  };


  // =====================================
  // GET MESSAGES FROM FIRESTORE
  // =====================================

  useEffect(() => {

    if (!conversationId) {

      setMessages([]);

      return;
    }

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );

    const q = query(
      messagesRef,
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,

      (snapshot) => {

        const messageList = snapshot.docs.map((doc) => ({

          id: doc.id,

          ...doc.data(),

        }));

        setMessages(messageList);

      },

      (error) => {

        console.error(
          "Error fetching messages:",
          error
        );

      }
    );

    return () => unsubscribe();

  }, [conversationId]);


  // =====================================
  // LISTEN FOR TYPING STATUS
  // =====================================

  useEffect(() => {

    if (!conversationId || !user) {

      setTypingUser(null);

      return;
    }

    const conversationRef = doc(
      db,
      "conversations",
      conversationId
    );

    const unsubscribe = onSnapshot(
      conversationRef,

      (snapshot) => {

        if (!snapshot.exists()) {

          setTypingUser(null);

          return;
        }

        const data = snapshot.data();

        // Show only the other user's typing status

        if (
          data.typingUserId &&
          data.typingUserId !== user.uid
        ) {

          setTypingUser(
            data.typingUserName
          );

        } else {

          setTypingUser(null);

        }

      },

      (error) => {

        console.error(
          "Error listening to typing status:",
          error
        );

      }
    );

    return () => unsubscribe();

  }, [conversationId, user]);


  // =====================================
  // NO USER SELECTED
  // =====================================

  if (!selectedUser) {

    return (

      <div className="chat-window empty-chat">

        <h2>
          Select a user to start chatting
        </h2>

      </div>

    );
  }


  // =====================================
  // HANDLE TYPING
  // =====================================

  const handleTyping = async (e) => {

    const value = e.target.value;

    setMessage(value);

    if (!conversationId || !user) return;

    const conversationRef = doc(
      db,
      "conversations",
      conversationId
    );

    try {

      // User is typing

      if (value.trim()) {

        await updateDoc(
          conversationRef,
          {
            typingUserId: user.uid,

            typingUserName:
              user.displayName ||
              "User",
          }
        );

        clearTimeout(
          window.typingTimer
        );

        window.typingTimer =
          setTimeout(
            async () => {

              try {

                await updateDoc(
                  conversationRef,
                  {
                    typingUserId: null,
                    typingUserName: null,
                  }
                );

              } catch (error) {

                console.error(
                  "Error clearing typing status:",
                  error
                );

              }

            },
            1000
          );

      } else {

        // Input is empty

        clearTimeout(
          window.typingTimer
        );

        await updateDoc(
          conversationRef,
          {
            typingUserId: null,
            typingUserName: null,
          }
        );

      }

    } catch (error) {

      console.error(
        "Error updating typing status:",
        error
      );

    }

  };


  // =====================================
  // SEND MESSAGE
  // =====================================

  const handleSend = async () => {

    if (!message.trim()) return;

    if (!user) {

      console.error(
        "User is not logged in"
      );

      return;
    }

    if (!conversationId) {

      console.error(
        "Conversation ID is missing"
      );

      return;
    }

    try {

      const messagesRef = collection(
        db,
        "conversations",
        conversationId,
        "messages"
      );

      await addDoc(
        messagesRef,
        {

          senderId: user.uid,

          text: message.trim(),

          createdAt:
            serverTimestamp(),

        }
      );


      // Clear typing status

      const conversationRef = doc(
        db,
        "conversations",
        conversationId
      );

      await updateDoc(
        conversationRef,
        {
          typingUserId: null,
          typingUserName: null,
        }
      );


      clearTimeout(
        window.typingTimer
      );


      setMessage("");

    } catch (error) {

      console.error(
        "Error sending message:",
        error
      );

    }

  };


  // =====================================
  // DELETE MESSAGE
  // =====================================

  const handleDeleteMessage = async (
    messageId
  ) => {

    if (
      !conversationId ||
      !messageId
    ) {

      return;
    }

    try {

      const messageRef = doc(
        db,
        "conversations",
        conversationId,
        "messages",
        messageId
      );

      // Delete message from Firestore

      await deleteDoc(
        messageRef
      );


      // Close three-dot menu

      setOpenMenu(null);

      console.log(
        "Message deleted successfully"
      );

    } catch (error) {

      console.error(
        "Error deleting message:",
        error
      );

    }

  };


  // =====================================
  // ENTER KEY
  // =====================================

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      handleSend();

    }

  };


  // =====================================
  // UI
  // =====================================

  return (

    <div className="chat-window">


      {/* =====================================
          CHAT HEADER
      ===================================== */}

      <div className="chat-header">

        <div className="chat-user-avatar">

          {selectedUser.name
            ?.charAt(0)
            .toUpperCase()}

        </div>


        <div className="chat-user-info">

          <h2>
            {selectedUser.name}
          </h2>


          <p
            className={
              selectedUser.online
                ? "chat-user-status online"
                : "chat-user-status offline"
            }
          >

            <span className="status-dot"></span>

            {selectedUser.online
              ? "Online"
              : "Offline"}

          </p>

        </div>

      </div>


      {/* =====================================
          MESSAGES
      ===================================== */}

      <div className="messages">

        {messages.length === 0 ? (

          <p className="no-messages">
            No messages yet.
          </p>

        ) : (

          messages.map((msg) => {

            const isMyMessage =
              msg.senderId === user?.uid;


            return (

              <div
                key={msg.id}

                className={
                  isMyMessage
                    ? "message sent"
                    : "message received"
                }
              >


                {/* MESSAGE CONTENT */}

                <div className="message-content">


                  {/* MESSAGE TEXT */}

                  <p className="message-text">
                    {msg.text}
                  </p>


                  {/* =====================================
                      THREE DOT MENU
                      AVAILABLE FOR EVERY MESSAGE
                  ===================================== */}

                  <div className="message-menu-container">

                    <button
                      className="message-menu-button"

                      onClick={() => {

                        setOpenMenu(
                          openMenu === msg.id
                            ? null
                            : msg.id
                        );

                      }}
                    >
                      ⋮
                    </button>


                    {/* DELETE MENU */}

                    {openMenu === msg.id && (

                      <div className="message-menu">

                        <button
                          onClick={() =>
                            handleDeleteMessage(
                              msg.id
                            )
                          }
                        >

                          🗑 Delete

                        </button>

                      </div>

                    )}

                  </div>

                </div>


                {/* MESSAGE TIME */}

                <div className="message-bottom">

                  <span className="message-time">

                    {formatTime(
                      msg.createdAt
                    )}

                  </span>

                </div>


              </div>

            );

          })

        )}

      </div>


      {/* =====================================
          TYPING INDICATOR
      ===================================== */}

      {typingUser && (

        <div className="typing-indicator">

          <span>
            {typingUser} is typing...
          </span>

        </div>

      )}


      {/* =====================================
          MESSAGE INPUT
      ===================================== */}

      <div className="message-input">

        <input
          type="text"

          placeholder="Type a message..."

          value={message}

          onChange={handleTyping}

          onKeyDown={handleKeyDown}
        />


        <button
          onClick={handleSend}
        >
          Send
        </button>

      </div>


    </div>

  );

};


export default ChatWindow;