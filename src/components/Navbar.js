import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, CheckSquare, LogIn, UserPlus } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');  // Перенаправлення на головну сторінку після виходу
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <CheckSquare className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">TodoApp</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/todos" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Список справ
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Вийти</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  <LogIn className="h-4 w-4" />
                  <span>Увійти</span>
                </Link>
                <Link to="/register" className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  <UserPlus className="h-4 w-4" />
                  <span>Зареєструватися</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
