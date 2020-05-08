import Cropper from 'cropperjs';
import React from 'react';
import { Alert, Button, ControlLabel, Panel, FormControl, FormGroup } from 'react-bootstrap';

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

  onChangeCrop({detail}) {
    const { formData, uiSchema: { maxWidth } } = this.props;
    const { imageCropX, imageCropY } = this.state;

    const scale = maxWidth ? Math.max(1, detail.width / maxWidth) : 1;
    const newWidth = Math.round(detail.width * scale);
    const newHeight = Math.round(detail.height * scale);
    const newCropX = Math.round(detail.x);
    const newCropY = Math.round(detail.y);

    const sizeChanged = formData.width !== newWidth || formData.height !== newHeight;
    const positionChanged = imageCropX !== newCropX || imageCropY !== newCropY;

    if (sizeChanged || positionChanged) {
      this.setState({
        imageChanged: true,
        imageCropX: newCropX,
        imageCropY: newCropY
      });
    }
  }

  onClickUpload() {
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
      this.setState({imageChanged: false});
    }).catch(error => {
      console.log(error);
    });
  }

  componentDidMount() {
    // Do here to trigger componentDidUpdate and cropper
    const imageUrl = this.props.formData.url;
    if (imageUrl) {
      const urlParts = imageUrl.split('.');
      this.setState({
        imageSrc: imageUrl,
        imageExt: urlParts[urlParts.length - 1]
      });
    }
  }

  componentDidUpdate({formData}, {imageSrc}) {
    if (formData.url !== this.props.formData.url) {
      this.setState({imageUrl: this.props.formData.url});
    }

    if (imageSrc !== this.state.imageSrc) {
      if (this.cropper) {
        this.cropper.destroy();
      }
      if (this.state.imageSrc) {
        const aspectRatio = this.props.uiSchema.aspectRatio;
        this.cropper = new Cropper(this.imageRef.current, {
          aspectRatio: aspectRatio && aspectRatio[0] / aspectRatio[1],
          autoCropArea: 1,
          rotatable: false,
          scalable: false,
          viewMode: 1,
          zoomable:false,
          // Only set crop listener on ready to avoid initial crop event
          ready: () => {
            this.imageRef.current.addEventListener('crop', this.onChangeCrop.bind(this));
          }
        });
        this.setState({
          imageCropX: 0,
          imageCropY: 0
        });
      }
    }
  }

  render() {
    const { imageChanged, imageSrc } = this.state;
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
                <Button bsStyle="danger" onClick={this.onClickUpload.bind(this)}>Upload</Button>}
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

export default ImageField
