import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ username }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');

  useEffect(() => {
    if (gameMode === 'computer' && !xIsNext && !winner) {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [board, xIsNext, winner, gameMode]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (winner || board[i] || (gameMode === 'computer' && !xIsNext)) return;

    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else if (newBoard.every(square => square !== null)) {
      setWinner('draw');
    }
  };

  const makeComputerMove = () => {
    const move = getBestMove(board, 'O');
    if (move !== null) {
      const newBoard = [...board];
      newBoard[move] = 'O';
      setBoard(newBoard);
      setXIsNext(true);

      const newWinner = calculateWinner(newBoard);
      if (newWinner) {
        setWinner(newWinner);
      } else if (newBoard.every(square => square !== null)) {
        setWinner('draw');
      }
    }
  };

  const getBestMove = (currentBoard, player) => {
    const opponent = player === 'X' ? 'O' : 'X';
    const availableMoves = currentBoard.reduce((acc, square, index) => {
      if (!square) acc.push(index);
      return acc;
    }, []);

    // Check for immediate win
    for (let move of availableMoves) {
      const newBoard = [...currentBoard];
      newBoard[move] = player;
      if (calculateWinner(newBoard) === player) {
        return move;
      }
    }

    // Check for immediate block
    for (let move of availableMoves) {
      const newBoard = [...currentBoard];
      newBoard[move] = opponent;
      if (calculateWinner(newBoard) === opponent) {
        return move;
      }
    }

    // Strategy based on difficulty
    if (difficulty === 'easy') {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      // Medium and Hard: Try to take strategic positions
      if (!currentBoard[4]) return 4; // Center
      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter(corner => !currentBoard[corner]);
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  };

  const renderSquare = (i) => (
    <button className="profile-square" onClick={() => handleClick(i)}>
      {board[i]}
    </button>
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
  };

  const renderStatus = () => {
    if (winner) {
      return winner === 'draw' ? 'Нічия!' : `Переможець: ${winner}`;
    } else {
      return `Наступний гравець: ${xIsNext ? 'X' : 'O'}`;
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-heading">Ласкаво просимо, {username}!</h1>
      <p>Ця вкладка була зроблена просто так. То пограємо хрестики-нулики?)</p>
      {!gameMode ? (
        <div>
          <h2 className="profile-heading">Виберіть режим гри:</h2>
          <button className="profile-button" onClick={() => setGameMode('computer')}>Грати проти комп'ютера</button>
          <button className="profile-button" onClick={() => setGameMode('player')}>Грати проти іншого гравця</button>
        </div>

      ) : (
        <div className="profile-game">
          {gameMode === 'computer' && (
            <div className="profile-difficulty-settings">
              <h3 className="profile-heading">Складність:</h3>
              <div className="profile-difficulty-buttons">
                <button 
                  className={`profile-difficulty-button ${difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => setDifficulty('easy')}
                >
                  Легко
                </button>
                <button 
                  className={`profile-difficulty-button ${difficulty === 'medium' ? 'active' : ''}`}
                  onClick={() => setDifficulty('medium')}
                >
                  Середньо
                </button>
                <button 
                  className={`profile-difficulty-button ${difficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => setDifficulty('hard')}
                >
                  Складно
                </button>
              </div>
            </div>
          )}
          <div className="profile-game-board">
            <div className="profile-board-row">
              {renderSquare(0)}
              {renderSquare(1)}
              {renderSquare(2)}
            </div>
            <div className="profile-board-row">
              {renderSquare(3)}
              {renderSquare(4)}
              {renderSquare(5)}
            </div>
            <div className="profile-board-row">
              {renderSquare(6)}
              {renderSquare(7)}
              {renderSquare(8)}
            </div>
          </div>
          <div className="profile-game-info">
            <div>{renderStatus()}</div>
            <button className="profile-button" onClick={resetGame}>Нова гра</button>
            <button className="profile-button" onClick={() => { setGameMode(null); resetGame(); }}>Змінити режим</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

