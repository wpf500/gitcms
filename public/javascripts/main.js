import React from 'react';
import ReactDOM from 'react-dom';

import Form from 'react-jsonschema-form';
import {Tabs, Tab} from 'react-bootstrap';

function onSubmit(pageId, data) {
  var savingEl = document.getElementById('edit_' + pageId + '_saving');
  var successEl = document.getElementById('edit_' + pageId + '_success');
  var failureEl = document.getElementById('edit_' + pageId + '_failure');

  savingEl.classList.remove('hidden');
  successEl.classList.add('hidden');
  failureEl.classList.add('hidden');

  reqwest({
    'url': '/edit/{{ dbRepo.id }}/' + pageId,
    'method': 'post',
    'type': 'json',
    'contentType': 'application/json',
    'data': JSON.stringify(data.formData)
  }).then(function (resp) {
    savingEl.classList.add('hidden');
    successEl.classList.remove('hidden');
  }, function () {
    savingEl.classList.add('hidden');
    failureEl.classList.remove('hidden');
  });
}

class GitCMS extends React.Component {
  constructor() {
    this.state = {
      'pages': this.props.pages
    };
  }

  onChange(page, data) {
  }

  render() {
    const {schema, uiSchema} = this.props;
    const {pages} = this.state;

    return (
      <Tabs id="pages">
        {pages.map(page => (
          <Tab eventKey={page.id} key={page.id} title={page.name}>
            <Form schema={schema} uiSchema={uiSchema} formData={page.data}>
            </Form>
          </Tab>
        ))}
      </Tabs>
    );
  }
}

ReactDOM.render(
  <GitCMS {...window.GitCMS} />,
  document.getElementById('content')
);
