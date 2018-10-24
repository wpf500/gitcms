import React from 'react';
import {Col, Nav, NavItem, Row, Tab} from 'react-bootstrap';

import Page from './Page';

const GitCMS = ({schema, uiSchema, pages}) => (
  <Tab.Container id="pages" defaultActiveKey={pages[0].id}>
    <Row className="clearfix">
      <Col sm={12} className="page-tabs">
        <Nav bsStyle="tabs">
          {pages.map(page => (
            <NavItem eventKey={page.id} key={page.id}>{page.name}</NavItem>
          ))}
        </Nav>
      </Col>
      <Col sm={12}>
        <Tab.Content animation={false}>
          {pages.map(page => (
            <Tab.Pane eventKey={page.id} key={page.id}>
              <Page schema={schema} uiSchema={uiSchema} page={page} />
            </Tab.Pane>
          ))}
        </Tab.Content>
      </Col>
    </Row>
  </Tab.Container>
);

export default GitCMS;
