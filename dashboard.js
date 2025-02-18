import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GameLibrary from '../components/games/GameLibrary';
import ChatSystem from '../components/chat/ChatSystem';
import TwitterFeed from '../components/news/TwitterFeed';
import UserStats from '../components/profile/UserStats';
import { Trophy, Users, Activity, Clock } from 'lucide-react';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery(
    ['userStats'],
    async () => {
      const response = await axios.get('/api/users/stats');
      return response.data;
    }
  );

  const { data: achievements, isLoading: achievementsLoading } = useQuery(
    ['achievements'],
    async () => {
      const response = await axios.get('/api/users/achievements');
      return response.data;
    }
  );

  const renderStats = () => {
    if (statsLoading) return <div>Loading stats...</div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.gamesLastWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Friends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeFriends}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onlineFriends} online now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Play Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayTime}h</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      {renderStats()}

      <Tabs defaultValue="games" className="space-y-4">
        <TabsList>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-4">
          <GameLibrary />
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div>Loading achievements...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <achievement.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChatSystem />
            <UserStats />
          </div>
        </TabsContent>

        <TabsContent value="news">
          <TwitterFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
