import React from 'react';

const Profile = ({ username }) => {
  return (
    <div>
      <h1>Welcome, {username}</h1>
      <p>This is your profile page.</p>
    </div>
  );
};

export default Profile;
