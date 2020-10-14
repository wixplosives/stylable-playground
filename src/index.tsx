import './common/reset.st.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { App, AppModel } from './components/app';

const container = document.body.appendChild(document.createElement('div'));
container.id = 'playground';
ReactDOM.render(
    <React.StrictMode>
        <App model={new AppModel()} />
    </React.StrictMode>,
    container
);
