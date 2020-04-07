import React from 'react';
import Cropper from 'cropperjs';

class ImageField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.imageRef = React.createRef();
    this.cropper = undefined;
  }

  onChangeFile(evt) {
    const files = evt.target.files;
    this.setState({
      imageUrl: files && files.length > 0 ? URL.createObjectURL(files[0]) : null,
      imageCropDetail: null
    });
  }

  componentDidUpdate(prevProps, {imageUrl}) {
    if (imageUrl !== this.state.imageUrl) {
      if (this.cropper) {
        this.cropper.destroy();
      }
      if (this.state.imageUrl) {
        this.cropper = new Cropper(this.imageRef.current, {
          autoCropArea: 1,
          viewMode: 1,
          crop: evt => {
            this.setState({imageCropDetail: evt.detail});
          }
        });
      }
    }
  }

  render() {
    const { imageUrl, imageCropDetail } = this.state;
    const { name, idSchema } = this.props;

    return (
      <div>
        <label htmlFor={idSchema.$id}>{name}</label>
        <div className="panel panel-default">
          <div className="panel-body">
            <input
              className="form-control"
              type="file"
              id={idSchema.$id}
              onChange={this.onChangeFile.bind(this)}
            />
            {imageUrl &&
              <div className="image-field-crop">
                <img src={imageUrl} ref={this.imageRef} />
              </div>}
            {imageCropDetail &&
              <p>Width: {imageCropDetail.width}, height: {imageCropDetail.height}</p>}
          </div>
        </div>
      </div>
    );
  }
}

export default ImageField
