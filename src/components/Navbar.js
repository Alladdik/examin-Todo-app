import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav>
      <ul>
        {user ? (
          <>
            <li>Welcome, {user.username}</li>
            <li><Link to="/profile">Profile</Link></li>
            <li><button onClick={onLogout}>Logout</button></li>
            <li><Link to="/todos">Todo List</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
