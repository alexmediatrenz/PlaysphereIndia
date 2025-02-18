import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GameManager = ({ gameId, onGameEnd }) => {
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    socket.emit('game:join', { gameId, userId: user.id });

    socket.on('game:state', handleGameState);
    socket.on('game:players', handlePlayers);
    socket.on('game:error', handleError);

    return () => {
      socket.emit('game:leave', { gameId, userId: user.id });
      socket.off('game:state');
      socket.off('game:players');
      socket.off('game:error');
    };
  }, [socket, gameId, user.id]);

  const handleGameState = (state) => {
    setGameState(state);
    setIsHost(state.hostId === user.id);
  };

  const handlePlayers = (playerList) => {
    setPlayers(playerList);
  };

  const handleError = (error) => {
    toast({
      title: 'Game Error',
      description: error.message,
      variant: 'destructive',
    });
  };

  const startGame = () => {
    if (!isHost) return;
    socket.emit('game:start', { gameId });
  };

  const endGame = () => {
    if (!isHost) return;
    socket.emit('game:end', { gameId });
    onGameEnd?.();
  };

  const kickPlayer = (playerId) => {
    if (!isHost) return;
    socket.emit('game:kick', { gameId, playerId });
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Game Room</h2>
        {isHost && (
          <div className="flex gap-2">
            <Button
              onClick={startGame}
              disabled={gameState?.status === 'playing'}
            >
              Start Game
            </Button>
            <Button
              variant="destructive"
              onClick={endGame}
            >
              End Game
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Players</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{player.name}</span>
                  {player.id === gameState?.hostId && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Host
                    </span>
                  )}
                </div>
                {isHost && player.id !== user.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => kickPlayer(player.id)}
                  >
                    Kick
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Game Status</h3>
          <div className="p-4 bg-muted rounded-lg">
            <p>Status: {gameState?.status}</p>
            <p>Round: {gameState?.round || 1}</p>
            <p>Time Remaining: {gameState?.timeRemaining || 'N/A'}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GameManager;
