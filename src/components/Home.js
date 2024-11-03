import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];

    const createParticle = (x, y) => {
      const hue = Math.random() * 360;
      particles.push({
        x,
        y,
        hue,
        radius: Math.random() * 15 + 5,
        speedX: Math.random() * 3 - 1.5,
        speedY: Math.random() * 3 - 1.5,
        life: 100,
      });
    };

    const updateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;

        if (p.life <= 0) {
          particles.splice(i, 1);
          i--;
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.life / 100})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    const handleMouseMove = (e) => {
      createParticle(e.clientX, e.clientY);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    updateParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="home-container">
      <canvas ref={canvasRef} className="particle-canvas"></canvas>
      <div className="content">
        <h1 className="title">Ласкаво просимо до Todo App</h1>
        <p className="description">
          Це простий додаток для управління завданнями, який допоможе вам
          організувати свій день та підвищити продуктивність.
        </p>
        <div className="buttons">
          <Link to="/login" className="btn btn-primary">Увійти</Link>
          <Link to="/register" className="btn btn-secondary">Зареєструватися</Link>
        </div>
      </div>
      <footer className="developer-info">
        <div className="developer-info-content">
          <p>
            by alladdiks |{' '}
            <a href="https://github.com/Alladdik" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

