import React from 'react'
import { connectSocket, getSocket } from '../utils/socketClient.js';
import { useEffect, useState, useRef } from 'react';
import { RiSendPlane2Fill } from "react-icons/ri";
import instance from '../utils/Instance.js';
import { FaUserPlus } from "react-icons/fa";
// import {enabled, setEnabled, playrecieve, playsend} from '../utils/soundEffect.js'
import soundObject from '../utils/soundEffect.js'
import { MdOutlineNotificationsActive, MdOutlineNotificationsOff } from "react-icons/md";
import { RiCloseCircleFill } from "react-icons/ri";

//Calling imports

import { MdCall } from "react-icons/md";
import { CurrentCall } from './CurrentCall.jsx';
import { IncomingCallScreen } from './IncomingCallScreen.jsx';
import { VideoCallTile } from './vedioCallTile.jsx';

import useWebRTC from '../hooks/useWebRTC.js'

// import img from ''

// -------------------- Chat UI --------------------
function Avatar({ name }) {
  // console.log("name -",name)
  return (
    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
      {name?.charAt(0) ?? "U"}
    </div>
  );
}

function ChatItem({ chat, onClick, currentChatId, callUser, userId }) {
  // console.log("currentChatId-", currentChatId, " chatid-", chat._id)
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${currentChatId === chat._id ? 'bg-gray-200' : ''}`}
      title="open chat"
    >
      <Avatar name={chat.conversate.name} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium text-gray-800">{chat.conversate.name}</div>
          {chat.newMsgs > 0 && (
            <div className="relative inline-block">
              {/* <BiMessageSquare size={22} className="text-blue-600" /> */}
              <span className="
                absolute top-1 right-1
                bg-blue-600
                text-white 
                text-xs font-bold 
                w-5 h-4 flex items-center justify-center 
                rounded-t-sm rounded-ee-sm
              ">
                {chat.newMsgs}
              </span>
            </div>
          )}
          <MdCall onClick={()=>callUser(userId)}/>
        </div>
        {/* <div className="text-sm text-gray-500">New messages</div> */}
      </div>
    </div>
  );
}

function MessageBubble({ message, isOwn }) {

  // console.log("isown-",message?.userId, userData.id, message?.userId === userData.id)
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`${isOwn ? "text-right" : "text-left"} max-w-[70%]`}>
        <div
          className={`inline-block p-3 rounded-2xl text-sm leading-tight ${isOwn ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}
        >
          {message.text}
        </div>
        <div className={`text-xs mt-1 ${isOwn ? "text-gray-500" : "text-gray-400"}`}>
          <span>{message.time}</span>
          {isOwn && <span className="ml-2">{message.status}</span>}
        </div>
      </div>
    </div>
  );
}

function getUserData() {
  const value = document.cookie
    .split("; ")
    .find(row => row.startsWith("user="))
    ?.split("=")[1];

  const data = JSON.parse(decodeURIComponent(value))
  return data;
}

function Chats() {
  const userData = getUserData();
  // console.log("user data",userData.name);

  // console.log("Sound Object in Chats", soundObject)
  // --- States ---
  // const [chats] = useState([ 
  //   { id: "691c3a7b667a398e5b55eeed", name: "Jesse Pinkman", hasNew: true },
  //   // { id: "2", name: "John Williams", hasNew: true },
  //   // { id: "3", name: "Petricia Brown", hasNew: false },
  //   // { id: "4", name: "Michael Miller", hasNew: false },
  //   // { id: "5", name: "Linda Wilson", hasNew: false },
  //   // { id: "6", name: "William Jones", hasNew: true },
  // ]);

  const [text, setText] = useState("")
  // const [inputValue, setInputValue] = useState("");
  const socket = getSocket();
  const autoScroll = useRef();
  const [selectedChat, setselectedChat] = useState(); // default opened chat
  const [cnvstId, setCnvstId] = useState();
  const [Chats, setChats] = useState([]);
  const [ChatList, setChatList] = useState([]);
  // const [tempId, seTempId] = useState("iiii");
  const tempIdRef = useRef("");
  const selectedChatRef = useRef("");

  // start new chat 
  // New Chat Panel State
  const [showNewChatPanel, setShowNewChatPanel] = useState(false);
  const [searchMail, setSearchMail] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  //  Sound Effect
  const { playrecieve, playsend, enabled, setEnabled } = soundObject();
  // console.log("Sound Object in Chats", play)

  useEffect(() => {
    // #region message recieve
    const handleMessageRecieved = ({ chatId, message }) => {
      console.log("message_received", chatId, message)
      setChats((prev) =>
        prev?.map(c => {
          // console.log("chatid-", c._id, chatId, (c._id === chatId))
          return (c._id === chatId) ? {
            ...c, messages: [...c.messages, message]
          } : c
        })
      )
      const sltdcid = selectedChatRef.current || selectedChat?._id
      console.log("selectedchatid-", selectedChat?._id, " chatId", chatId, "sltdcid", sltdcid, (sltdcid === chatId))
      if (sltdcid === chatId) {
        socket?.emit("message_seen", { chatId, userId: message.userId })  // emit message seen event when chat is open;
      }
      else {
        // mark new message in chat list
        // console.log("marking new message in chat list")
        setChatList(prev => prev?.map(c => c._id == chatId ? { ...c, newMsgs: c.newMsgs + 1 } : c));
      }

      playrecieve();
    }

    const handleStatusUpdate = ({ chatId, msgId, status }) => {
      const tId = tempIdRef.current;
      console.log("status update -", tId, chatId, status)

      setChats(prev => prev?.map(c => c._id === chatId ? {
        ...c,
        messages: c.messages?.map(m => {
          return m._id === tId ? { ...m, status } : { ...m, status }
        })
      } : c
      )
      )
      // setChats([prev =>{
      //   console.log("chat id-",prev, c._id, chatId, (c._id === chatId))
      //   return []
      //   }])
    }
    const handleNewChatOpened = ({ chatId }) => {
      const sltdcid = tempIdRef.current
      console.log("new chat opened id :", chatId, "selectedchatId :", selectedChat._id, sltdcid)  // same issue as status update, need to user userRef - try to usr tempid
      setChatList(prev => (prev.map(c => c._id === sltdcid ? { ...c, _id: chatId } : c)))
      setChats(prev => (prev.map(c => c._id === sltdcid ? { ...c, _id: chatId } : c)))
      setselectedChat(prev => ({ ...prev, _id: chatId }))
    }

    socket?.on("message_received", handleMessageRecieved); // second person
    socket?.on("message_status_update", handleStatusUpdate); // for self
    socket?.on("new_chat_opened", handleNewChatOpened)

    return () => {
      socket?.off("message_received", handleMessageRecieved);
      socket?.off("message_status_update", handleStatusUpdate);
      socket?.off("new_chat_opened", handleNewChatOpened)

    }

    // socket?.on("message_received",({chatId})=>{
    //   if(selectedChat?.id == chatId){
    //     console.log("ChatAlreadOpen")
    //     // socket?.emit("open_chat", ({aId:userData.id, bId:cnvstId}))
    //   }
    //   console.log("message_received")
    //   getChats()   
    // })


    //  socket?.on('message_status_update', ()=>{
    //   console.log("message_status update")  
    //   getChats()
    //  })
  }, [socket])


  const getChats = async () => {
    try {
      const resp = await instance.post('/get-chats', { id: userData.id });
      // console.log("resp data-", resp.data?.data)
      if (resp.data?.success) {
        const result = resp.data.data;
        // console.log("result-", result)
        setChats(result);
        setselectedChat({
          _id: result[0]?._id,
          cnvstName: result[0]?.conversate?.name
        })
        setCnvstId(result[0]?.conversate.id)
        const clist = result.map(c => {
          return {
            _id: c._id,
            conversate: c.conversate,
            newMsgs: 0
          }
        })
        // console.log("clist-", clist)
        setChatList(clist);
      }
    }
    catch (err) {
      console.log(`error in fetching chats - ${err}`)
    }
  }

  // --- Handler functions (left empty for now as requested) ---
  function handleSelectChat(chat, cnvstId) {
    // TODO: implement selecting a chat (setSelected_id)
    // console.log("ChatSelected-", chat._id)
    socket?.emit("open_chat", ({ aId: userData.id, bId: cnvstId }))
    const chatobj = {
      _id: chat._id,
      cnvstName: chat.conversate.name
    }
    tempIdRef.current = chat._id;
    selectedChatRef.current = chat._id;
    setselectedChat(chatobj);
    setCnvstId(cnvstId);
    setChatList(prev => prev?.map(c => c._id == chat._id ? { ...c, newMsgs: 0 } : c));
  }

  // #region message send
  function handleSendMessage() {
    // TODO: implement sending a message    
    if (text == "") {
      return
    }
    const myId = userData.id;
    const cId = selectedChat._id
    console.log("sendingmessage payload", myId, cnvstId, cId, text)
    const tId = Date.now().toString();
    // console.log("tempid-", tId, typeof tId)
    // seTempId(tId)
    tempIdRef.current = tId;

    // console.log("Chats", Chats)
    // console.log("c._id-", c._id, cId, (c._id === cId)) 
    // console.log("prev", prev)

    setChats((prev) =>
      prev?.map(c => {
        return (c._id === cId) ? {
          ...c, messages: [...c.messages, {
            userId: myId,
            text: text,
            _id: tId,
            status: "sending"
          }]
        } : c
      })
    )


    socket?.emit('send_message', { myId, cnvstId, cId, text })
    // console.log("palying send sound")
    playsend();
    // play("send")
    setText("");
    // getChats()

  }

  function handleInputChange(e) {
    // TODO: implement input change (setInputValue)
    setText(e.target.value)
  }

  function handleNewChat() {
    // TODO: implement creating a new chat
  }

  const handleFindUser = async () => {
    if (!searchMail.trim()) return;

    try {
      setSearching(true);
      setSearchError("");
      setFoundUser(null);

      const resp = await instance.post("/find-user", { mail: searchMail });

      if (resp.data?.success) {
        console.log("found user-", resp.data.data)
        setFoundUser(resp.data.data);
      } else {
        setSearchError("No user exist with this email id");
      }
    } catch (err) {
      setSearchError("Error searching user");
    }

    setSearching(false);
  };


  const handleStartChat = async (user) => {
    try {
      const myId = userData.id;
      const otherId = user._id;

      // API → create/get chat

      // socket?.emit("open_chat", { aId: myId, bId: otherId });
      // const resp = await instance.post("/start-chat", {
      //   aId: myId,
      //   bId: otherId
      // });

      // if (!resp.data?.success) return alert("Unable to start chat");

      // const newChat = resp.data.chat;

      const newChat = {
        _id: Date.now().toString(), // temp id, will be replaced by server id
        conversate: { id: user._id, name: user.name },
        messages: []
      }

      // Update Chat list dynamically
      setChatList(prev => [...prev, {
        _id: newChat._id,
        conversate: { id: user._id, name: user.name }
      }]);

      setChats(prev => [...prev, newChat]);

      // Select it
      handleSelectChat(newChat, user._id);

      // Close panel
      setShowNewChatPanel(false);
      setSearchMail("");
      setFoundUser(null);
      setSearchError("");

    } catch (err) {
      console.log("start chat error", err);
    }
  };


  useEffect(() => {
    // call this after you've logged-in (cookie will have been set by server)
    const s = connectSocket();
    s.on('connect', () => {
      // console.log('connected', s)
      console.log("Socket connected  - ", getUserData().name, "logged in!")
    });
    // console.log("initail load")
    getChats()

    // return () => s?.disconnect();
  }, []);

  useEffect(() => {
    console.log("chats updated-", Chats)
    // if (Chats.length) {
    //   setSelectedChat(Chats[0])
    //   setCnvstId(Chats[0]?.conversate.id)
    // }
    autoScroll.current?.scrollIntoView({ behavior: "smooth" });

  }, [Chats]);

  // --- Derived data ---

  const {  localStreamRef,
  remoteStreamRef,
  callUser,
  endCall,
  incoming,
  inCall,
  callStatus,
  // localStream,
  // remoteStream,
  muted,
  videoEnabled,
  setMuted,
  setAccepted,
  setVideoEnabled } = useWebRTC();

  return (
    <div className=" bg-gray-200 p-4">
      <div className="mx-auto bg-white rounded-2xl shadow-xl overflow-hidden  w-full" style={{ height: 581 }}>
        <div className="flex h-full">
          {/* Left panel - 30% width */}
          <div className="w-[30%] border-r border-gray-200 bg-white ">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="text-2xl font-semibold">INDChat</div>
              {/* <button className="p-2 rounded hover:bg-gray-100">✎</button> */}
              {/* <img src='https://imgs.search.brave.com/MN7-JY9NlFWKEoCbNlgy5l3anUUwtczKtDzBMUx4G64/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZs/YXRpY29uLmNvbS8x/MjgvMTY2ODkvMTY2/ODk1MDcucG5n' width={27} alt="IndChat" />
            </div> */}
              <div className="flex items-center gap-3">
                <button onClick={() => setEnabled(!enabled)} title="message sound status">
                  {enabled ? <MdOutlineNotificationsActive size={22} /> : <MdOutlineNotificationsOff size={22} />}
                </button>
                <button
                  onClick={() => setShowNewChatPanel(true)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                  title="Start New Chat"
                >
                  <FaUserPlus size={18} />
                </button>
                <img src='https://res.cloudinary.com/dwhp05lqs/image/upload/v1764242078/fsfs_uwh7wk.png' width={35} alt="IndChat" />
              </div>
            </div>


            <div className="overflow-auto h-[calc(100%-60px)]">
              {ChatList?.length ? (ChatList?.map((chat, key) => (
                <ChatItem
                  key={key}
                  chat={chat}
                  onClick={() => handleSelectChat(chat, chat.conversate.id)}
                  currentChatId={selectedChat?._id}
                  callUser={callUser}
                  userId={userData.id}
                />
              ))) : <div className='w-full flex items-center align-center' > You have no chat, find people to start conversation</div>}
            </div>
          </div>

          {/* Right panel - chat area */}
          <div className="flex-1 flex flex-col bg-white ">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-2 border-b">
              {/* {console.log("chalist", ChatList)} */}
              <Avatar name={selectedChat?.cnvstName} />
              <div className="text-xl font-semibold">{selectedChat?.cnvstName}</div>
              <div className="ml-auto p-2">•••</div>
            </div>

            {/* Messages list */}
            <div className="flex-1 px-8 py-6 overflow-auto bg-white">
              {
                Chats?.map(c => (c._id === selectedChat._id) ? (
                  c?.messages?.map((m, i) => (
                    <MessageBubble
                      key={i}
                      message={m}
                      // isOwn={m.from === "me"}
                      isOwn={m?.userId === userData?.id}
                    />
                  ))
                ) : null
                )
              }
              {/* {selectedChat?.messages?.map((m, i) => (
                <MessageBubble
                  key={i}
                  message={m}
                  // isOwn={m.from === "me"}
                  isOwn={m?.userId === userData?.id}
                />
              ))} */}
              <div ref={autoScroll} />
            </div>

            {/* Input area */}
            <div className="px-6 py-4 border-t bg-white">
              <div className="flex items-center gap-4">
                <input
                  value={text}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();   // prevents newline if using a textarea
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type message"
                  className="flex-1 p-3 rounded-2xl border border-gray-300 focus:outline-none"
                />
                <button onClick={handleSendMessage} className="p-3 rounded-full hover:bg-gray-300" title="send message">
                  <RiSendPlane2Fill />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* NEW CHAT SIDE PANEL */}
      {showNewChatPanel && (
        <div className="fixed inset-0 bg-black/20 flex justify z-50  ">

          {/* Searchpanel Panel */}
          <div className="w-[350px] h-4/5 bg-white shadow-xl p-4 m-4 rounded-2xl mt-17 animate-slideLeft">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Start New Chat</h2>
              <button
                onClick={() => {
                  setShowNewChatPanel(false);
                  setSearchMail("");
                  setFoundUser(null);
                  setSearchError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <RiCloseCircleFill size={24} />
              </button>
            </div>

            {/* Input */}
            <input
              type="email"
              value={searchMail}
              onChange={(e) => setSearchMail(e.target.value)}
              placeholder="Enter user's email"
              className="w-full p-3 rounded-xl border border-gray-300 mb-3"
            />

            {/* Find Button */}
            <button
              onClick={handleFindUser}
              disabled={searching}
              className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
            >
              {searching ? "Searching..." : "Find"}
            </button>

            {/* Search result */}
            <div className="mt-5">
              {searchError && (
                <div className="text-red-600 text-center">{searchError}</div>
              )}

              {foundUser && (
                <div className="flex items-center justify-between border p-3 rounded-xl">
                  <Avatar name={foundUser?.name} />

                  <div className="flex-1 ml-3">
                    <div className="font-semibold">{foundUser?.name}</div>
                    <div className="text-gray-500 text-sm">{foundUser?.mail}</div>
                  </div>

                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                    onClick={() => handleStartChat(foundUser)}
                  >
                    Start
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Chats


// Yo Yo Yo 1-4-8 3 to the 3 to the 6 to the 9. Representing the ABQ. What up BIATCH! Leave at the tone.











