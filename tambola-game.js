import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const TambolaGame = ({ gameSession, onWin }) => {
  const [ticket, setTicket] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [claims, setClaims] = useState({
    earlyFive: false,
    topLine: false,
    middleLine: false,
    bottomLine: false,
    fullHouse: false,
  });
  
  const socket = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    // Generate ticket when game starts
    socket.on('tambola:ticket', (generatedTicket) => {
      setTicket(generatedTicket);
    });

    // Listen for called numbers
    socket.on('tambola:number', (number) => {
      setCurrentNumber(number);
      setCalledNumbers((prev) => [...prev, number]);
    });

    // Listen for winning claims
    socket.on('tambola:claim', ({ type, player, valid }) => {
      if (valid) {
        setClaims((prev) => ({ ...prev, [type]: true }));
        toast({
          title: `${player} won ${type}!`,
          variant: 'success',
        });
      }
    });

    return () => {
      socket.off('tambola:ticket');
      socket.off('tambola:number');
      socket.off('tambola:claim');
    };
  }, [socket]);

  const checkNumber = (number) => {
    return calledNumbers.includes(number);
  };

  const handleClaim = (claimType) => {
    if (claims[claimType]) {
      toast({
        title: 'Already claimed!',
        description: 'This prize has already been won',
        variant: 'warning',
      });
      return;
    }

    socket.emit('tambola:claim', {
      type: claimType,
      ticket,
      calledNumbers,
    });
  };

  const renderTicket = () => {
    return (
      <div className="grid grid-cols-9 gap-1">
        {ticket.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-col">
            {row.map((number, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 flex items-center justify-center
                  border rounded-md m-1
                  ${number === 0 ? 'bg-gray-200' : ''}
                  ${checkNumber(number) ? 'bg-green-500 text-white' : ''}
                `}
              >
                {number !== 0 && number}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="p-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Current Number</h2>
          <div className="text-4xl font-bold text-primary mt-2">
            {currentNumber || '-'}
          </div>
        </div>

        {renderTicket()}

        <div className="flex flex-wrap gap-4 mt-6 justify-center">
          <Button
            onClick={() => handleClaim('earlyFive')}
            disabled={claims.earlyFive}
            variant={claims.earlyFive ? 'outline' : 'default'}
          >
            Early Five
          </Button>
          <Button
            onClick={() => handleClaim('topLine')}
            disabled={claims.topLine}
            variant={claims.topLine ? 'outline' : 'default'}
          >
            Top Line
          </Button>
          <Button
            onClick={() => handleClaim('middleLine')}
            