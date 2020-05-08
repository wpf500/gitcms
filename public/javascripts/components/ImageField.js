import axios from 'axios';
import Cropper from 'cropperjs';
import React from 'react';
import { Alert, Button, ControlLabel, Panel, FormControl, FormGroup } from 'react-bootstrap';
import isEqual from 'react-fast-compare';


const imageMimeToExt = {
  'image/png': 'png',
  'image/jpeg': 'jpg'
};

const imageExtToMime = Object.assign(
  ...Object.entries(imageMimeToExt).map(([k, v]) => ({[v]: k}))
);

class ImageField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.imageRef = React.createRef();
    this.cropper = null;
  }

  onChangeFile(evt) {
    const files = evt.target.files;
    if (files && files.length > 0) {
      this.setState({
        imageSrc: URL.createObjectURL(files[0]),
        imageExt: imageMimeToExt[files[0].type],
        imageChanged: true
      });
    }
  }

  onChangeCrop() {
    const cropDetail = this.cropper.getData(true);
    if (this.state.imageCropDetail && !isEqual(this.state.imageCropDetail, cropDetail)) {
      this.setState({
        imageChanged: true,
        imageCropDetail: cropDetail
      });
    }
  }

  onClickUpload() {
    this.setState({imageUploading: true});
    new Promise(resolve => {
      this.cropper.getCroppedCanvas({
        maxWidth: this.props.uiSchema.maxWidth
      }).toBlob(resolve, imageExtToMime[this.state.imageExt])
    }).then(blob => {
      let formData = new FormData();
      formData.append('ext', this.state.imageExt);
      formData.append('file', blob);
      return axios.post('/upload', formData);
    }).then(res => {
      this.props.onChange({
        url: res.data.url,
        width: 0,
        height: 0
      });
    }).catch(error => {
      console.log(error);
      this.setState({imageUploading: false});
    });
  }

  setImageStateFromProps() {
    const imageUrl = this.props.formData.url;
    if (imageUrl) {
      const urlParts = imageUrl.split('.');
      this.setState({
        imageSrc: imageUrl,
        imageExt: urlParts[urlParts.length - 1],
        imageChanged: false,
        imageUploading: false
      });
    }
  }

  componentDidMount() {
    // Do here to trigger componentDidUpdate and cropper
    this.setImageStateFromProps();
  }

  componentDidUpdate({formData}, {imageSrc}) {
    if (!isEqual(formData, this.props.formData)) {
      this.setImageStateFromProps();
    }

    if (imageSrc !== this.state.imageSrc) {
      if (this.cropper) {
        this.cropper.destroy();
        this.setState({imageCropDetail: null});
      }
      if (this.state.imageSrc) {
        const aspectRatio = this.props.uiSchema.aspectRatio;
        this.cropper = new Cropper(this.imageRef.current, {
          aspectRatio: aspectRatio && aspectRatio[0] / aspectRatio[1],
          autoCropArea: 1,
          rotatable: false,
          scalable: false,
          viewMode: 1,
          zoomable: false,
          // Only set crop listener on ready to avoid initial crop event
          ready: () => {
            this.setState({imageCropDetail: this.cropper.getData(true)});
            this.imageRef.current.addEventListener('crop', this.onChangeCrop.bind(this));
          }
        });
      }
    }
  }

  render() {
    const { imageChanged, imageUploading, imageSrc } = this.state;
    const { name, idSchema, uiSchema } = this.props;

    return (
      <div>
        <ControlLabel>{name}</ControlLabel>
        <Panel>
          <Panel.Body>
            <FormGroup>
              <FormControl
                type="file"
                id={idSchema.$id}
                accept={Object.keys(imageMimeToExt).join(',')}
                onChange={this.onChangeFile.bind(this)}
              />
            </FormGroup>
            {uiSchema.aspectRatio &&
              <p><b>Fixed aspect ratio: {uiSchema.aspectRatio.join('/')}</b></p>}
            {imageSrc &&
              <div className="image-field-crop">
                <img src={imageSrc} ref={this.imageRef} />
              </div>}
            {imageChanged &&
              <Alert bsStyle="warning">
                <p>Your image will not be saved until your upload it</p>
                <p>
                  <Button bsStyle="warning" onClick={this.onClickUpload.bind(this)} disabled={imageUploading}>
                    {imageUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </p>
              </Alert>}
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

export default ImageField
