import axios from 'axios';
import React from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import Form from 'react-jsonschema-form';
import extrasFields from 'react-jsonschema-form-extras';

const fields = extrasFields;

class GitCMS extends React.Component {
  constructor(props) {
    super(props);
  }

  onSubmit(page, data) {
    console.log(page, data);
    axios.post(`/edit/${this.props.dbRepoId}/${page.id}`, data.formData).then(resp => {
      console.log(resp);
    });
  }

  render() {
    const {schema, uiSchema, pages} = this.props;

    return (
      <Tabs id="pages">
        {pages.map(page => (
          <Tab eventKey={page.id} key={page.id} title={page.name}>
            <Form schema={schema} uiSchema={uiSchema} formData={page.data} fields={fields}
                  onSubmit={this.onSubmit.bind(this, page)}>
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
