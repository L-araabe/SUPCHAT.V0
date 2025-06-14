// Modal.js
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./modal.css"; // for styling
import { toast } from "react-toastify";
import {
  useAddMemberMutation,
  useRemoveMemberMutation,
  useSendGroupInviteMutation,
  useSetPermissionMutation,
} from "../redux/apis/chat";
import { useSelector } from "react-redux";
import ToggleButton from "./ToggleButton";

interface modalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  searchFriends: (search: string) => void;
  chat: any;
  setChat: any;
  userids: any;
  isAdmin: boolean;
  socket: any;
}

const InfoModal = ({
  isOpen,
  onClose,
  children,
  searchFriends,
  chat,
  userids,
  isAdmin,
  setChat,
  socket,
}: modalProps) => {
  const user = useSelector((state) => state?.user?.user);
  const [setPermission, {}] = useSetPermissionMutation();
  const [addMember, {}] = useAddMemberMutation();
  const [removeMember, {}] = useRemoveMemberMutation();

  const [sendGroupInvite, {}] = useSendGroupInviteMutation();
  console.log("user idss", userids);
  const [searchName, setSearchName] = useState<string>("");
  const [displayUsers, setDisplayUsers] = useState(false);

  const [onlyAdminCanMessage, setOnlyAdminCanMessage] = useState<boolean>(
    chat?.onlyAdminCanMessage
  );
  const [users, setUsers] = useState([]);

  const inviteMember = async (userId: string) => {
    try {
      if (userids.includes(userId)) {
        toast("this user is already added");
      }
      console.log("chat id iss", chat?._id);
      await sendGroupInvite({
        groupId: chat?._id,
        invitedUser: userId,
      }).unwrap();
      userids.push(userId);

      const response = await addMember({
        chatId: chat?._id,
        userIdToAdd: userId,
      }).unwrap();
      console.log("our response is", response);
      setChat(response?.data);
      toast("User invited.");
    } catch (e) {
      toast(e?.data?.message);
      console.log("error occured creating group", e);
    }
  };

  const removeUser = async (userId: string, message: string) => {
    try {
      const response = await removeMember({
        chatId: chat?._id,
        userIdToRemove: userId,
      }).unwrap();

      setChat(response?.data);
      socket(chat?.groupAdmin?._id);
      toast(message);
    } catch (e) {
      toast(e?.data?.message);
      console.log("error occured creating group", e);
    }
  };

  const clearAll = () => {
    setDisplayUsers(false);

    setSearchName("");
    setUsers([]);
  };

  useEffect(() => {
    const getUser = async () => {
      const foundUsers = await searchFriends(searchName);
      setUsers(foundUsers);
    };
    if (searchName !== "") {
      setDisplayUsers(true);
      getUser();
    }
  }, [searchName]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-150">
      <div className="modal-content flex flex-col gap-2 w-[350px] relative">
        {children}
        {isAdmin && (
          <>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
              }}
              placeholder="Search members to invite"
              required
            />
            {displayUsers && (
              <div className="absolute top-25  border border-gray-300 rounded-md w-[290px] p-4 h-max-40 overflow-y-auto z-30 bg-white">
                <div
                  className="w-full flex justify-end"
                  onClick={() => setDisplayUsers(false)}
                >
                  <FaTimes />
                </div>
                {users?.length > 0 ? (
                  users?.map((item) => (
                    <div className="w-full flex flex-row justify-between items-center mt-4">
                      <div className="flex flex-row gap-2 items-center">
                        <div className="rounded-[50px] h-10 w-10 overflow-hidden">
                          <img
                            src={
                              item?.profilePicture
                                ? item?.profilePicture
                                : "https://i.pravatar.cc/40"
                            }
                            className="w-full h-full"
                          />
                        </div>
                        <p>{item?.name}</p>
                      </div>
                      <div
                        className="p-1 px-2 rounded-md bg-primary text-center text-white cursor-pointer"
                        onClick={() => {
                          setDisplayUsers(false);
                          inviteMember(item?._id);
                        }}
                      >
                        Invite
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No records found</p>
                )}
              </div>
            )}
          </>
        )}
        {isAdmin && (
          <div>
            <ToggleButton
              intialValue={chat?.onlyAdminCanMessage ? true : false}
              onToggle={async (value: boolean) => {
                setOnlyAdminCanMessage(value);
                await setPermission({
                  chatId: chat?._id,
                  value: value,
                }).unwrap();
                setChat({ ...chat, onlyAdminCanMessage: value });
              }}
              label={"Only admin can message"}
            />
          </div>
        )}
        <p className="font-lg font-bold mt-8">Members</p>
        {chat?.users?.length > 0 ? (
          chat?.users?.map((item) => (
            <div className="w-full flex flex-row justify-between items-center mt-6 ">
              <div className="flex flex-row gap-2 items-center">
                <div className="rounded-[50px] h-10 w-10 overflow-hidden">
                  <img
                    src={
                      item?.profilePicture
                        ? item?.profilePicture
                        : "https://i.pravatar.cc/40"
                    }
                    className="w-full h-full"
                  />
                </div>
                {chat?.groupAdmin?._id !== item?._id ? (
                  <p>{item?.name}</p>
                ) : (
                  <div>
                    <p>{item?.name}</p>
                    <p className="text-xs text-primary">{`${
                      chat?.groupAdmin?._id === item?._id ? "Admin" : ""
                    }`}</p>
                  </div>
                )}
              </div>
              {isAdmin && chat?.groupAdmin?._id !== item?._id && (
                <div
                  className="p-1 px-2 rounded-md bg-red-300 text-center text-white cursor-pointer"
                  onClick={() => {
                    removeUser(item?._id, "User removed.");
                  }}
                >
                  Remove
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="font-bold text-center mb-4">Noone is here</p>
        )}
        {!isAdmin && (
          <button
            type="button"
            onClick={() => {
              removeUser(user?.id, "Group Leaved.");
              setChat({});
              clearAll();
            }}
            className={`w-full bg-red-400 text-white py-2 rounded-lg hover:bg-red-600 transition mt-4`}
          >
            Leave Group
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            onClose();
            clearAll();
          }}
          className={`w-full bg-[var(--color-primary)] text-white py-2 rounded-lg hover:bg-blue-600 transition mt-4`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
