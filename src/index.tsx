import './common/reset.st.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/app';

const container = document.body.appendChild(document.createElement('div'));
container.id = 'playground';
ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    container
);
