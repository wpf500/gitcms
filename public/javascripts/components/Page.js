import axios from 'axios';
import React from 'react';
import {Alert, Button, Tab} from 'react-bootstrap';
import Form from 'react-jsonschema-form';
import extrasFields from 'react-jsonschema-form-extras';

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
      <div className="page-container">
        <Form schema={schema} uiSchema={uiSchema} formData={formData} fields={fields}
              onChange={this.onChange}>
          {isSuccess && <Alert bsStyle="success">Changes saved</Alert>}
          {error && <Alert bsStyle="danger">Changes could not be saved</Alert>}
          {hasChanged &&
            <div className="page-save">
              <Alert bsStyle="info">
                <div className="clearfix">
                  <div className="pull-right">
                    <Button bsStyle="primary" onClick={this.onSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  Unsaved changes
                </div>
              </Alert>
            </div>}
        </Form>
      </div>
    );
  }
}

export default Page;
