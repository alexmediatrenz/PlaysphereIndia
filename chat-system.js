import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ChatSystem = () => {
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:typing', handleTypingStatus);
    socket.on('chat:channels', handleChannels);

    // Join default channel
    socket.emit('chat:join', 'general');

    return () => {
      socket.off('chat:message');
      socket.off('chat:typing');
      socket.off('chat:channels');
    };
  }, [socket]);

  const handleNewMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
    scrollToBottom();
  };

  const handleTypingStatus = ({ user, isTyping }) => {
    setIsTyping(isTyping);
  };

  const handleChannels = (channelList) => {
    setChannels(channelList);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit('chat:message', {
      channel: activeChannel,
      content: message,
      sender: user.id,
      timestamp: new Date().toISOString(),
    });

    setMessage('');
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('chat:typing', {
      channel: activeChannel,
      isTyping: e.target.value.length > 0,
    });
  };

  const switchChannel = (channel) => {
    socket.emit('chat:leave', activeChannel);
    socket.emit('chat:join', channel);
    setActiveChannel(channel);
    setMessages([]);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <Tabs defaultValue={activeChannel} className="w-full">
        <TabsList className="w-full">
          {channels.map(channel => (
            <TabsTrigger
              key={channel.id}
              value={channel.id}
              onClick={() => switchChannel(channel.id)}
            >
              {channel.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeChannel} className="flex-grow">
          <ScrollArea className="h-[500px] p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${msg.sender === user.id ? 'text-right' : ''}`}
              >
                <div className={`inline-block max-w-[70%] ${
                  msg.sender === user.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                } rounded-lg p-3`}>
                  <p className="text-sm font-semibold">{msg.senderName}</p>
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-sm text-muted-foreground">
                Someone is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="flex-grow"
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChatSystem;
