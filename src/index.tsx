import './common/reset.st.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/app';
import { AppModel } from './lib/app-model';

const container = document.body.appendChild(document.createElement('div'));
container.id = 'playground';
ReactDOM.render(
    <React.StrictMode>
        <App model={new AppModel()} />
    </React.StrictMode>,
    container
);
