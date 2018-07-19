import React from 'react';
import ReactDOM from 'react-dom';

import GitCMS from './components/GitCMS';

ReactDOM.render(
  <GitCMS {...window.GitCMS} />,
  document.getElementById('content')
);
