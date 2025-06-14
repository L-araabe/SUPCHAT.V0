import { use, useEffect, useRef, useState } from "react";
import { socket } from "../../../script/socket";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { resetUser } from "../../redux/slices/user";
import { useLazyGetUserByEmailQuery } from "../../redux/apis/auth";
import CreateChannelModal from "../../component/ChannelModal";
import { toast } from "react-toastify";
import {
  useLazyGetChatsQuery,
  useCreateChatMutation,
  useLazyReceiveInviteQuery,
  useAcceptInviteMutation,
  useRejectInviteMutation,
} from "../../redux/apis/chat";
import {
  useLazyGetMessagesQuery,
  useLazyGetUnreadMessagesQuery,
  useMarAsSeenMutation,
} from "../../redux/apis/message";
import Modal from "../../component/NewGroup";
import ProfileModal from "../../component/profileModa";
import ProfileDetailModal from "../../component/profileDetailModal";
import InfoModal from "../../component/UsersModal";
import infoIcon from "../../assets/icons/info_Icon.png";
import { uploadToCloudinary } from "../../../script/cloudinaryUpload";
import DashboardHeader from "./components/DashboardHeader";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";

const ChatDashboard = () => {
  const user = useSelector((state) => state?.user?.user);
  const [
    getUserByEmail,
    { isLoading: emailSearchLoading, data, isError, isSuccess, error },
  ] = useLazyGetUserByEmailQuery();
  const [searchChats, setSearchChats] = useState("");
  const [originalChats, setOriginalChats] = useState([]);
  const [receiveInvite, {}] = useLazyReceiveInviteQuery();
  const [getUnreadMessages, {}] = useLazyGetUnreadMessagesQuery();
  const [marAsSeen, {}] = useMarAsSeenMutation();
  const [acceptInvite, {}] = useAcceptInviteMutation();
  const [rejectInvite, {}] = useRejectInviteMutation();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isProfileDetailVisible, setIsProfileDetailVisible] = useState(false);
  const [activeProfileData, setActiveProfileData] = useState({});
  const [isInfoModalVIsible, setIsInfoModalVisible] = useState<boolean>(false);
  const [isCreateChannelVisible, setCreateChannelVisible] =
    useState<boolean>(false);
  const [
    getChats,
    {
      // isLoading: gettingChatLoading,
      // isError: getChatIsError,
      // isSuccess: getChatIsSuccess,
      // error: getChatError,
    },
  ] = useLazyGetChatsQuery();
  const [getMessages, {}] = useLazyGetMessagesQuery();
  const [
    createChat,
    {
      // isLoading: creatChatLoading,
      // isError: isCreateChatError,
      // isSuccess: isCreateChatSuccess,
      // error: createChatError,
    },
  ] = useCreateChatMutation();

  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const dispatch = useDispatch();
  const [selectedChat, setSelectedChat] = useState(null);
  const [friendSearch, setFriendSearch] = useState<string>("");
  const [displayFriendsList, setDisplayFriendsList] = useState<boolean>(false);
  const [searchedFriendsList, setSearchedFriendsList] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedChatID, setSelectedChatId] = useState<string>("");
  const [newGroupModal, setNewGroupModal] = useState<boolean>(false);
  const [isSideBarVisible, setIsSideBarVisible] = useState(false);
  const [groupStatus, setGroupStatus] = useState<string>("");
  const [receivedInviteId, setReceiveInviteid] = useState("");

  const logout = () => {
    dispatch(resetUser());
  };
  // const [searhResult,setSearchResut]
  const [chats, setChats] = useState([]);

  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(messages);
  const selectedChatIdRef = useRef(selectedChatID);
  const messageEndRef = useRef(null);

  const addChatToChats = (chat: any) => {
    setDisplayFriendsList(false);
    if (chat?._id === user?.id) {
      toast("cannot add your self");
      return;
    }
    const filterd = chats.find((item) =>
      item?.users?.some((user) => user._id === chat._id)
    );

    if (filterd !== undefined) {
      if (Object?.keys(filterd)?.length > 0) {
        toast("already added.");
        return;
      }
    }
    const newChat = {
      isGroupChat: false,
      isChannel: false,
      createChat: false,
      chatName: chat?.name,
      users: [user?.id, chat._id],
      groupAdmin: "",
      onlyAdminCanMessage: false,
    };
    createChatFunction(newChat);
  };

  const getUnreadMessagesCount = async (chatid) => {
    try {
      const response = await getUnreadMessages({ chatId: chatid }).unwrap();

      return response?.data?.unreadMessages;
    } catch (e) {
      toast(e?.data?.message);
      console.log("errorc occured getting unread messages", e);
    }
  };

  const getChatFunction = async () => {
    try {
      console.log("inside chat function");
      const response = await getChats({}).unwrap();
      const chatss = await Promise.all(
        response?.data?.map(async (item) => {
          const data = await getUnreadMessagesCount(item?._id);

          return { ...item, unreadMessages: data };
        })
      );

      setChats(chatss);
      setOriginalChats(chatss);
      console.log("selected chat", selectedChat);
      setSelectedChat(null);
      if (selectedChat !== null) {
        const filtered = chatss.filter(
          (item) => item?._id === selectedChat._id
        );
        console.log("filtered is ", filtered);
        setSelectedChat(filtered[0]);
      }
    } catch (e) {
      toast(e?.data?.message);
      toast("error occured getting chats");
    }
  };

  const createChatFunction = async (chat: any) => {
    try {
      const response = await createChat(chat).unwrap();
      if (response.status === "success") {
        setChats([response?.data, ...chats]);
        setOriginalChats([response?.data, ...chats]);
      } else {
        toast("error occured creating chat");
      }
    } catch (e) {
      toast(e?.data?.message);
      console.log("error occured creatign chat", e);
    }
  };
  const messageCountIncrement = (chatId: string) => {
    setChats((prev) => {
      const newData = prev?.map((item) => {
        if (item?._id === chatId) {
          return { ...item, unreadMessages: item?.unreadMessages + 1 };
        }
        return item;
      });
      return newData;
    });
  };
  const getMessagesFunction = async (chatId: string, isGroupChat: boolean) => {
    try {
      if (isGroupChat) {
        const response = await receiveInvite({ id: chatId }).unwrap();
        // console.log("Staus iss", response?.data[0]);
        setReceiveInviteid(response?.data[0]?._id);
        if (response?.data[0]?.status === "pending") {
          setGroupStatus("pending");
        } else if (response?.data[0]?.status === "accepted") {
          setGroupStatus("accepted");
        } else if (response?.data[0]?.status === "rejected") {
          setGroupStatus("rejected");
        }
      }
      if (!isGroupChat) {
        setGroupStatus("");
        setReceiveInviteid("");
      }
      const response = await getMessages({ chatId: chatId }).unwrap();
      if (response.status === "success") {
        setMessages(response?.data);
      } else {
        toast("Error occured fetching messages");
      }
    } catch (e) {
      toast(e?.data?.message);
      console.log("error occured", e);
    }
  };

  const filterChats = () => {
    console.log("hggghghghg", chats[0]);
    if (searchChats.trim() === "") {
      setChats(originalChats);
    } else {
      const filteredList = originalChats.filter((item) =>
        item?.users?.some((user) =>
          user?.name?.toLowerCase().includes(searchChats.toLowerCase())
        )
      );
      setChats(filteredList);
    }
  };

  useEffect(() => {
    filterChats();
  }, [searchChats]);
  useEffect(() => {
    getChatFunction();
  }, []);

  useEffect(() => {
    // Connect and emit "setup" with userId when component mounts

    socket.on("connect", () => {
      console.log("🟢 Connected to socket:", socket.id);
      socket.emit("setup", user?.id);
    });

    // Optional: listen for any server events here
    socket.on("message", (msg) => {
      console.log("New message:", msg);
    });
    socket.on("userRemoved", (data) => {
      console.log("received data", data);
      getChatFunction();
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from socket");
    });
    socket.on("receive-message", (data) => {
      // toast(`Message Received.`);
      console.log("📥 Real-time message received:", data?.chat?._id);

      if (selectedChatIdRef.current === data?.chat._id) {
        const updatedMessages = [...messagesRef.current, data];
        setMessages(updatedMessages);
      } else {
        toast("Message Received");
        messageCountIncrement(data?.chat._id);
      }

      // Here, update your chat state or UI with new message
    });
    return () => {
      socket.off("connect");
      socket.off("message");
      socket.off("disconnect");
      socket.off("receive-message");
      socket.off("userRemoved");
      // Optional: socket.disconnect(); if you want to disconnect on unmount
    };
  }, [user]);

  const senMessage = async () => {
    if (message.trim() === "") {
      return;
    }
    let imageUrl = "";
    if (selectedImage !== "") {
      imageUrl = await uploadToCloudinary(imageFile);
    }
    setMessage("");
    setSelectedImage("");
    setIMageFile("");

    socket.emit("message", {
      sender: user?.id,
      receiverId:
        selectedChat?.isGroupChat || selectedChat?.isChannel
          ? selectedChat?.users
              .filter((item) => item?._id !== user?.id)
              .map((item) => item?._id)
          : selectedChat._id,
      chat: selectedChatID,
      content: message,
      imageUrl: imageUrl,
      seenBy: [user?.id],
    });
    setMessages([
      ...messages,
      {
        sender: { _id: user?.id },
        chat: selectedChatID,
        content: message,
        seenBy: [user?.id],
        createdAt: new Date().toISOString(),
        imageUrl: imageUrl,
      },
    ]);
  };

  const searchFriendEmail = async (friendSearch: string) => {
    setDisplayFriendsList(true);
    try {
      const result = await getUserByEmail({ email: friendSearch }).unwrap();

      setSearchedFriendsList(result?.data?.users || []);
      return result?.data?.users;
    } catch (e) {
      toast(e?.data?.message);
      console.log("error occured", e);
    }
  };

  const searchFriends = async (friendSearch: string) => {
    // setDisplayFriendsList(true);
    try {
      const result = await getUserByEmail({ email: friendSearch }).unwrap();

      // setSearchedFriendsList(result?.data?.users || []);
      return result?.data?.users;
    } catch (e) {
      toast(e?.data?.message);
      console.log("error occured", e);
    }
  };

  const currentMessageCountZero = (chatId: string) => {
    setChats((prev) => {
      const newData = prev?.map((item) => {
        if (item?._id === chatId) {
          return { ...item, unreadMessages: 0 };
        }
        return item;
      });
      return newData;
    });
  };

  const markAsSeenFunction = async (messageIds: any) => {
    try {
      await marAsSeen({ messageIds: messageIds }).unwrap();
    } catch (e) {
      console.log("Error occured", e);
    }
  };

  const AcceptInvitation = async (id) => {
    try {
      const response = await acceptInvite({ id: id }).unwrap();

      if (response.status === "success") {
        setGroupStatus("");
        setReceiveInviteid("");
      }
    } catch (e) {
      toast(e?.data?.message);
      console.log("error occured while accepting id", e);
    }
  };
  const RejectInvitation = async (id) => {
    try {
      const response = await rejectInvite({ id: id }).unwrap();

      if (response.status === "success") {
        setGroupStatus("");
        setSelectedChat(null);
        setMessages([]);
        setChats((prev) =>
          prev.filter((item) => item._id !== selectedChat?._id)
        );
        toast("You rejected to join that group");
        socket.emit("userRemoved", {
          adminId: selectedChat?.groupAdmin?._id,
        });
        setReceiveInviteid("");
      }
    } catch (e) {
      toast(e?.data?.message);
      console.log("error occured while accepting id", e);
    }
  };

  const sendMessageToAdmin = (adminID) => {
    socket.emit("userRemoved", {
      adminId: adminID,
    });
  };

  useEffect(() => {
    if (friendSearch !== "") {
      searchFriendEmail(friendSearch);
    }
  }, [friendSearch]);
  useEffect(() => {
    if (isError) {
      toast(error?.data?.message);
    }
  }, [isError, isSuccess]);
  useEffect(() => {
    selectedChatIdRef.current = selectedChatID;
    messagesRef.current = messages;
    messageEndRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });

    const notSeenMessagesIds = messages
      .filter((item) => {
        if (!item?.seenBy?.includes(user?.id)) {
          return item?._id;
        }
      })
      .map((item) => item?._id);

    markAsSeenFunction(notSeenMessagesIds);
  }, [messages, selectedChatID]);

  const [selectedImage, setSelectedImage] = useState("");
  const [imageFile, setIMageFile] = useState("");
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setIMageFile(file);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <ProfileModal isOpen={isProfileModalVisible} onClose={() => setIsProfileModalVisible(false)} />
      <CreateChannelModal
        isOpen={isCreateChannelVisible}
        onClose={() => setCreateChannelVisible(false)}
        searchFriends={searchFriends}
        setChats={setChats}
        chats={chats}
      >
        <p>Create Channel</p>
      </CreateChannelModal>
      <InfoModal
        isOpen={isInfoModalVIsible}
        onClose={() => setIsInfoModalVisible(false)}
        searchFriends={searchFriends}
        chat={selectedChat}
        userids={selectedChat?.users?.map((item) => item?._id)}
        isAdmin={selectedChat?.groupAdmin?._id === user?.id ? true : false}
        setChat={setSelectedChat}
        socket={sendMessageToAdmin}
      >
        <p></p>
      </InfoModal>
      <ProfileDetailModal
        isOpen={isProfileDetailVisible}
        onClose={() => setIsProfileDetailVisible(false)}
        name={activeProfileData?.name}
        imageURL={activeProfileData?.profilePicture}
        email={activeProfileData?.email}
      />

      <DashboardHeader
        isSideBarVisible={isSideBarVisible}
        setIsSideBarVisible={setIsSideBarVisible}
        setFriendSearch={setFriendSearch}
        displayFriendsList={displayFriendsList}
        setDisplayFriendsList={setDisplayFriendsList}
        searchedFriendsList={searchedFriendsList}
        addChatToChats={addChatToChats}
        user={user}
        isLogoutVisible={isLogoutVisible}
        setIsLogoutVisible={setIsLogoutVisible}
        logout={logout}
        setIsProfileModalVisible={setIsProfileModalVisible}
        newGroupModal={newGroupModal}
        setNewGroupModal={setNewGroupModal}
        searchFriends={searchFriends}
        chats={chats}
        setChats={setChats}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <ChatSidebar
          searchChats={searchChats}
          setSearchChats={setSearchChats}
          chats={chats}
          setNewGroupModal={setNewGroupModal}
          setCreateChannelVisible={setCreateChannelVisible}
          user={user}
          setSelectedChat={setSelectedChat}
          setSelectedChatId={setSelectedChatId}
          currentMessageCountZero={currentMessageCountZero}
          getMessagesFunction={getMessagesFunction}
          isSideBarVisible={isSideBarVisible}
          setIsSideBarVisible={setIsSideBarVisible}
        />

        <ChatWindow
          selectedChat={selectedChat}
          setActiveProfileData={setActiveProfileData}
          setIsProfileDetailVisible={setIsProfileDetailVisible}
          infoIcon={infoIcon}
          setIsInfoModalVisible={setIsInfoModalVisible}
          messages={messages}
          user={user}
          groupStatus={groupStatus}
          AcceptInvitation={AcceptInvitation}
          RejectInvitation={RejectInvitation}
          receivedInviteId={receivedInviteId}
          message={message}
          setMessage={setMessage}
          selectedImage={selectedImage}
          handleFileChange={handleFileChange}
          senMessage={senMessage}
          messageEndRef={messageEndRef}
        />
      </div>
    </div>
  );
};

export default ChatDashboard;
