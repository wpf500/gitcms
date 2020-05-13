import axios from 'axios';
import React from 'react';
import {Alert, Button, Tab} from 'react-bootstrap';
import Form from 'react-jsonschema-form';
import extrasFields from 'react-jsonschema-form-extras';

import ImageField from './ImageField';

const fields = {
  ...extrasFields,
  image: ImageField
};

class Page extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: props.page.data
    };

    this.onClearError = this.onClearError.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onRevert = this.onRevert.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  get saveUrl() {
    return `/edit/${this.props.repoId}/branch/${this.props.branch}/${this.props.page.id}`;
  }

  onClearError() {
    this.setState({error: null});
  }

  onSave() {
    this.setState({
      isSaving: true,
      isSuccess: false,
      error: null
    });

    axios.post(this.saveUrl, this.state.formData)
      .then(() => {
        this.setState({isSuccess: true, hasChanged: false});
        setTimeout(() => this.setState({isSuccess: false}), 5000);
      })
      .catch(error => {
        this.setState({error});
      })
      .then(() => {
        this.setState({isSaving: false});
      });
  }

  onRevert() {
    if (confirm('Are you sure you want to revert all changes?')) {
      this.setState({formData: this.props.page.data, hasChanged: false});
    }
  }

  onChange({formData}) {
    this.setState({formData, hasChanged: true});
  }

  render() {
    const {schema, uiSchema} = this.props.page;
    const {formData, isSaving, hasChanged, isSuccess, error} = this.state;

    const clazz = 'page-container' + (isSaving ? ' is-saving' : '');

    return (
      <div className={clazz}>
        <Form schema={schema} uiSchema={uiSchema} formData={formData} fields={fields}
              onChange={this.onChange}>
          <div />
        </Form>
        {(isSuccess || error || hasChanged) &&
          <div className="page-save">
            {isSuccess && <Alert bsStyle="success">Changes saved</Alert>}
            {error &&
              <Alert bsStyle="danger">
                <div className="clearfix">
                  <div className="pull-right">
                    <Button bsStyle="danger" onClick={this.onClearError}>Clear</Button>
                  </div>
                  Changes could not be saved: {error.message}
                </div>
              </Alert>}
            {hasChanged &&
              <Alert bsStyle="info">
                <div className="clearfix">
                  <div className="pull-right">
                    {!isSaving &&
                      <span>
                        <Button bsStyle="default" bsSize="small" onClick={this.onRevert}>
                          Revert
                        </Button>
                        {' '}
                      </span>}
                    <Button bsStyle="primary" onClick={this.onSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  Unsaved changes
                </div>
              </Alert>}
          </div>}
      </div>
    );
  }
}

export default Page;
