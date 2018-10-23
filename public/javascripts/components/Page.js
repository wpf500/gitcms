import axios from 'axios';
import React from 'react';
import {Alert, Button, Tab} from 'react-bootstrap';
import Form from 'react-jsonschema-form';
import extrasFields from 'react-jsonschema-form-extras';

import StickyAlert from './StickyAlert';

const fields = extrasFields;

class Page extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: props.page.data
    };

    this.onSave = this.onSave.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onSave() {
    const {page} = this.props;
    const {formData} = this.state;

    this.setState({isSaving: true, isSuccess: false, error: null});

    axios.post(window.location.href + '/' + page.id, formData)
      .then(() => this.setState({isSuccess: true, hasChanged: false}))
      .catch(error => this.setState({error}))
      .then(() => this.setState({isSaving: false}));
  }

  onChange({formData}) {
    this.setState({formData, hasChanged: true});
  }

  render() {
    const {schema, uiSchema} = this.props;
    const {formData, isSaving, hasChanged, isSuccess, error} = this.state;

    return (
      <div>
        {hasChanged && <StickyAlert bsStyle="warning">Unsaved changes</StickyAlert>}
        <Form schema={schema} uiSchema={uiSchema} formData={formData} fields={fields}
              onChange={this.onChange}>
          {isSuccess && <Alert bsStyle="success">Changes saved</Alert>}
          {error && <Alert bsStyle="danger">Changes could not be saved</Alert>}
          <Button bsStyle="primary" bsSize="large" onClick={this.onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Form>
      </div>
    );
  }
}

export default Page;
