import axios from 'axios';
import Cropper from 'cropperjs';
import React from 'react';
import { Alert, ControlLabel, Panel, FormControl, FormGroup } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

import PageContext from '../PageContext';

const fileExts = {
  'image/png' : 'png',
  'image/jpeg' : 'jpg'
};

class ImageField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageUrl: this.props.url ? 'THE URL' : null,
      imageName: this.props.url ? 'THE NAME' : null
    };

    this.imageRef = React.createRef();
    this.cropper = null;
  }

  onChangeFile(evt) {
    const files = evt.target.files;
    if (files && files.length > 0) {
      const imageName = uuidv4() + '.' + fileExts[files[0].type];
      this.props.onChange({
        url: (this.props.uiSchema.urlPrefix || '') + imageName
      });
      this.setState({
        imageUrl: URL.createObjectURL(files[0]),
        imageName,
        imageType: files[0].type
      });
    }
  }

  onChangeCrop(evt) {
    this.props.onChange({
      url: this.props.formData.url,
      width: Math.round(evt.detail.width),
      height: Math.round(evt.detail.height)
    });
  }

  onSave({page, repoId, branch}) {
    return new Promise(resolve => {
      this.cropper.getCroppedCanvas().toBlob(resolve, this.state.imageType)
    }).then(blob => {
      let formData = new FormData();
      formData.append('filepath', this.props.uiSchema.uploadPath);
      formData.append('filename', this.state.imageName);
      formData.append('file', blob);
      return axios.post(`/edit/${repoId}/${branch}/${page.id}/files`, formData);
    });
  }

  componentDidMount() {
    this.context.registerSaveHandler('Uploading images', this.onSave.bind(this));
  }

  componentDidUpdate(prevProps, {imageUrl}) {
    if (imageUrl !== this.state.imageUrl) {
      if (this.cropper) {
        this.cropper.destroy();
      }
      if (this.state.imageUrl) {
        const aspectRatio = this.props.uiSchema.aspectRatio;
        this.cropper = new Cropper(this.imageRef.current, {
          aspectRatio: aspectRatio && aspectRatio[0] / aspectRatio[1],
          autoCropArea: 1,
          rotatable: false,
          viewMode: 1,
          crop: this.onChangeCrop.bind(this)
        });
      }
    }
  }

  render() {
    const { imageUrl } = this.state;
    const { name, idSchema, formData, uiSchema } = this.props;

    return (
      <div>
        <ControlLabel>{name}</ControlLabel>
        <Panel>
          <Panel.Body>
            <FormGroup>
              <FormControl
                type="file"
                id={idSchema.$id}
                accept="image/png,image/jpeg"
                onChange={this.onChangeFile.bind(this)}
              />
            </FormGroup>
            {uiSchema.aspectRatio &&
              <Alert>Fixed aspect ratio: {uiSchema.aspectRatio.join('/')}</Alert>}
            {imageUrl &&
              <div className="image-field-crop">
                <img src={imageUrl} ref={this.imageRef} />
              </div>}
            {formData &&
              <div>
                <p>URL: {formData.url}</p>
                <p>Width: {formData.width}, height: {formData.height}</p>
              </div>}
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

ImageField.contextType = PageContext;

export default ImageField
