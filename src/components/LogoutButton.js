import React from 'react';

const LogoutButton = ({ onLogout }) => {
  return (
    <button onClick={onLogout}>
      Вийти з акаунту
    </button>
  );
};

export default LogoutButton;