import axios from 'axios';
import Cropper from 'cropperjs';
import React from 'react';
import { Alert, ControlLabel, Panel, FormControl, FormGroup } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

import PageContext from '../PageContext';

const imageMimeToExt = {
  'image/png': 'png',
  'image/jpeg': 'jpg'
};

const imageExtToMime = Object.assign(
  ...Object.entries(imageMimeToExt).map(([k, v]) => ({[v]: k}))
);

class ImageField extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {};
    this.imageRef = React.createRef();
    this.cropper = null;

    this.context.preSaveHook('Uploading images', this.onSave.bind(this));
  }

  get imageHandlerUrl() {
    const { repoId, branch, pageId } = this.context;
    return `/edit/${repoId}/${branch}/${pageId}/files`;
  }

  get imagePath() {
    return this.props.uiSchema.uploadPath + '/' + this.imageName;
  }

  get imageName() {
    const { uiSchema, formData: { url } } = this.props;
    return url && url.replace(uiSchema.urlPrefix, '');
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
      this.setState({imageChanged: true});

      if (positionChanged) {
        this.setState({
          imageCropX: newCropX,
          imageCropY: newCropY
        });
      }

      if (sizeChanged) {
        this.props.onChange({
          ...formData,
          width: newWidth,
          height: newHeight
        });
      }
    }
  }

  onSave() {
    if (this.state.imageChanged) {
      return new Promise(resolve => {
        this.cropper.getCroppedCanvas({
          maxWidth: this.props.uiSchema.maxWidth
        }).toBlob(resolve, imageExtToMime[this.state.imageExt])
      }).then(blob => {
        let formData = new FormData();
        formData.append('filepath', this.imagePath);
        formData.append('file', blob);
        return axios.post(this.imageHandlerUrl, formData);
      });
    } else {
      return Promise.resolve();
    }
  }

  componentDidMount() {
    // Do here to trigger componentDidUpdate and cropper
    if (this.props.formData.url) {
      const urlParts = this.imagePath.split('.');
      this.setState({
        imageSrc: `${this.imageHandlerUrl}?filepath=${encodeURIComponent(this.imagePath)}`,
        imageExt: urlParts[urlParts.length - 1]
      });
    }
  }

  componentDidUpdate(prevProps, {imageSrc, imageChanged}) {
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

    if (this.state.imageChanged && !imageChanged) {
      this.props.onChange({
        url: this.props.uiSchema.urlPrefix + uuidv4() + '.' + this.state.imageExt
      });
    }
  }

  render() {
    const { imageSrc } = this.state;
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
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

ImageField.contextType = PageContext;

export default ImageField
