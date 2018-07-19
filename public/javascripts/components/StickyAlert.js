import React from 'react';
import {Alert} from 'react-bootstrap';

const StickyAlert = (props) => (
  <div className="sticky-alert">
    <Alert {...props}>
      {props.children}
    </Alert>
  </div>
);

export default StickyAlert;
