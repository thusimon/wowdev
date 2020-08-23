import React from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom';
import WowToken from './components/wowtoken';

function App() {
  return (
    <main>
      <Switch>
        <Route exact path='/' component={WowToken}/>
        <Route path='/wowtoken' component={WowToken}/>
      </Switch>
    </main>
  );
}

export default App;
