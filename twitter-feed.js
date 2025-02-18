import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Heart, Repeat, MessageCircle } from 'lucide-react';

const CATEGORIES = {
  all: '#IndiaNews',
  sports: '#CricketIndia',
  entertainment: '#Bollywood',
  weather: '#WeatherAlert',
};

const TwitterFeed = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: tweets, isLoading, error, refetch } = useQuery(
    ['tweets', activeCategory],
    async () => {
      const response = await axios.get(`/api/news/tweets/${activeCategory}`);
      return response.data;
    },
    {
      refetchInterval: 120000, // Auto refresh every 2 minutes
      staleTime: 60000, // Consider data stale after 1 minute
    }
  );

  useEffect(() => {
    const timer = setInterval(() => {
      refetch();
      setLastRefresh(new Date());
    }, 120000);

    return () => clearInterval(timer);
  }, [refetch]);

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  const handleInteraction = async (tweetId, action) => {
    try {
      await axios.post(`/api/news/tweet/${tweetId}/${action}`);
    } catch (error) {
      console.error(`Failed to ${action} tweet:`, error);
    }
  };

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-red-500">Failed to load tweets</p>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Latest Updates</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full justify-start px-4">
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <TabsTrigger key={key} value={key}>
              {value}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="flex-grow">
          <ScrollArea className="h-[500px]">
            {tweets?.map((tweet) => (
              <Card key={tweet.id} className="m-4 p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={tweet.author.profileImageUrl}
                    alt={tweet.author.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{tweet.author.name}</span>
                      <span className="text-muted-foreground">
                        @{tweet.author.username}
                      </span>
                    </div>
                    <p className="mt-2">{tweet.text}</p>
                    {tweet.media && tweet.media.length > 0 && (
                      <div className="mt-2">
                        <img
                          src={tweet.media[0].url}
                          alt="Tweet media"
                          className="rounded-lg max-h-[300px] object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-6 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInteraction(tweet.id, 'like')}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        {tweet.likeCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInteraction(tweet.id, 'retweet')}
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        {tweet.retweetCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInteraction(tweet.id, 'reply')}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />