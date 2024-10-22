import React, { useState } from 'react';
import './Profile.css';
import axios from 'axios';

const Profile = ({ username }) => {
  const [nickname, setNickname] = useState(username);
  const [avatar, setAvatar] = useState('');
  const [background, setBackground] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setBackground(reader.result);
    reader.readAsDataURL(file);
  };

  const saveChanges = async () => {
    try {
      await axios.put('http://localhost:3001/api/profile', {
        username,
        nickname,
        avatar,
        background
      });
      alert("Профіль оновлено успішно!");
    } catch (err) {
      console.error('Помилка оновлення профілю:', err);
    }
  };

  return (
    <div className="profile-container" style={{ backgroundImage: `url(${background})` }}>
      <h1>Ласкаво просимо, {nickname}</h1>
      {avatar && <img className="profile-avatar" src={avatar} alt="Аватар" />}
      <p>Це ваша профільна сторінка.</p>

      <div>
        <label>Змінити нікнейм: </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      <div>
        <label>Завантажити аватар: </label>
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>

      <div>
        <label>Завантажити фон: </label>
        <input type="file" accept="image/*" onChange={handleBackgroundChange} />
      </div>

      <Button onClick={saveChanges}>Зберегти зміни</Button>
    </div>
  );
};

export default Profile;
