import React from 'react';
import {Tabs, Tab} from 'react-bootstrap';

import Page from './Page';

const GitCMS = ({schema, uiSchema, dbRepoId, pages}) => (
  <Tabs id="pages">
    {pages.map(page => (
      <Tab eventKey={page.id} key={page.id} title={page.name}>
        <Page schema={schema} uiSchema={uiSchema} dbRepoId={dbRepoId} page={page} />
      </Tab>
    ))}
  </Tabs>
);

export default GitCMS;
