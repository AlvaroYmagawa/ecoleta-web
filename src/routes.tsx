import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom'; 

// PAGES
import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';

const src: React.FC = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact/>
      <Route component={CreatePoint} path="/create-point" exact/>
    </BrowserRouter>
  )
}

export default src;