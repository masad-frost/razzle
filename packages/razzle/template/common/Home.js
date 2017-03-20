import React from 'react';
import ReactLogo from './react.svg';

const Home = () => (
  <div style={{ fontFamily: 'sans-serif' }}>
    <h1 style={{ color: '#FF00F5' }}>
      Welcome to Razzle.
      {' '}
      <img src={ReactLogo} alt="React Logo" height="30px" width="30px" />
    </h1>
    <p>
      To get started, edit {' '}
      <code>common/App.js and common/Home.js</code>
      {' '}and save to reload.
    </p>
    <ul style={{ marginBottom: '1rem' }}>
      <li><a href="https://github.com/jaredpalmer/razzle">Docs</a></li>
      <li><a href="https://github.com/jaredpalmer/razzle/issues">Issues</a></li>
      <li><a href="https://palmer.chat">Community Slack</a></li>
    </ul>
    Follow
    <a
      style={{
        color: '#fff',
        marginLeft: '.5rem',
        borderRadius: 4,
        textDecoration: 'blink',
        cursor: 'pointer',
        padding: '.5rem .75rem',
        backgroundColor: '#56CCF2',
      }}
      target="_blank"
      href="https://twitter.com/jaredpalmer"
    >
      @jaredpalmer
    </a>
  </div>
);

export default Home;
