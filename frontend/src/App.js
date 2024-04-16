import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = "http://127.0.0.1:3001";

function App() {
  const [votes, setVotes] = useState(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on('updateVotes', data => {
      setVotes(data);
    });
    return () => socket.disconnect();
  }, []);

  const handleVote = (nominee) => {
    fetch(`${ENDPOINT}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nominee }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setVoted(true);
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="App p-8">
      <h1 className="text-2xl font-bold mb-5 text-center">Vote for Your Favourite Nominee</h1>
      {!voted ? (
        <div className="flex flex-col items-center space-y-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleVote('nominee1')}>Nominee 1</button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleVote('nominee2')}>Nominee 2</button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleVote('nominee3')}>Nominee 3</button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleVote('nominee4')}>Nominee 4</button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleVote('nominee5')}>Nominee 5</button>
        </div>
      ) : (
        <h2 className="text-lg font-semibold text-green-500 text-center">Thank you for voting!</h2>
      )}
      {votes && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Live Results</h2>
          <ul className="list-disc pl-5">
            {Object.entries(votes.nominees).map(([key, value]) => (
              <li key={key} className="text-md">{key}: {value}</li>
            ))}
          </ul>
          <p className="font-semibold">Total Votes: {votes.totalVotes}</p>
        </div>
      )}
    </div>
  );
}

export default App;
