import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPaperPlane, 
  FaUser, 
  FaClock, 
  FaCheck, 
  FaCheckDouble,
  FaEllipsisV,
  FaSearch,
  FaComments,
  FaUserGraduate,
  FaUserTie
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user, isStudent, socket } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.other_user_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (incomingMessage) => {
      // If the incoming message belongs to the current conversation
      if (selectedConversation && (incomingMessage.sender_id === selectedConversation.other_user_id || incomingMessage.receiver_id === selectedConversation.other_user_id)) {
          setMessages(prev => [...prev, incomingMessage]);
      }
      // Refresh conversation list to update unread counts and last message snippet
      fetchConversations();
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await messageAPI.getConversation(otherUserId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const messageData = {
        receiverId: selectedConversation.other_user_id,
        message: newMessage.trim()
      };

      const response = await messageAPI.sendMessage(messageData);
      setNewMessage('');
      
      // Add message to local state
      setMessages(prev => [...prev, response.data.data]);
      
      // Update conversation list
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatusIcon = (message) => {
    if (message.sender_id === user.id) {
      if (message.read_status) {
        return <FaCheckDouble className="w-3 h-3 text-blue-500" />;
      } else {
        return <FaCheck className="w-3 h-3 text-gray-400" />;
      }
    }
    return null;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MessageBubble = ({ message }) => {
    const isOwn = message.sender_id === user.id;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          <p className="text-sm">{message.message}</p>
          <div className={`flex items-center justify-between mt-1 text-xs ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span>{formatTime(message.sent_at)}</span>
            <div className="flex items-center ml-2">
              {getMessageStatusIcon(message)}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const ConversationItem = ({ conversation }) => {
    const isSelected = selectedConversation?.other_user_id === conversation.other_user_id;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => selectConversation(conversation)}
        className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-semibold">
              {conversation.other_user_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {conversation.other_user_name}
              </p>
              <div className="flex items-center space-x-1">
                {conversation.other_user_role === 'alumni' ? (
                  <FaUserTie className="w-3 h-3 text-green-600" />
                ) : (
                  <FaUserGraduate className="w-3 h-3 text-blue-600" />
                )}
                {conversation.unread_count > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {conversation.other_user_email}
            </p>
            <p className="text-xs text-gray-400">
              Last message: {formatTime(conversation.last_message_time)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">
                  {isStudent() ? 'Chat with connected alumni' : 'Chat with connected students'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {conversations.length} conversations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence>
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <ConversationItem key={conversation.other_user_id} conversation={conversation} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <FaComments className="w-12 h-12 mb-4" />
                      <p className="text-center">
                        {searchTerm ? 'No conversations found' : 'No conversations yet'}
                      </p>
                      <p className="text-sm text-center mt-2">
                        {isStudent() 
                          ? 'Connect with alumni to start messaging'
                          : 'Students need to connect with you to start messaging'
                        }
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {selectedConversation.other_user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {selectedConversation.other_user_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.other_user_email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedConversation.other_user_role === 'alumni' ? (
                          <>
                            <FaUserTie className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-600">Alumni</span>
                          </>
                        ) : (
                          <>
                            <FaUserGraduate className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">Student</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FaPaperPlane className="w-4 h-4" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FaComments className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p className="text-sm">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
