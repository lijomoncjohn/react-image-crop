import React, { Component } from 'react'
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container } from 'reactstrap';
import logo from './logo.svg';

class PhotoUpload extends Component {
    constructor() {
        super()
        this.state = {
            modal: false,
            src: null,
            crop: {
                unit: "%",
                width: 40,
                aspect: 1 / 1
            },
            croppedImageUrl: null,
            croppedImage: null
        }
    }

    toggle = () => {
        this.setState({
            src: null,
            modal: !this.state.modal
        })
    }

    // Load cropped image
    handleFile = e => {
        const fileReader = new FileReader()
        fileReader.onloadend = () => this.setState({ src: fileReader.result })
        fileReader.readAsDataURL(e.target.files[0]);
    }

    // handle form actions here
    handleSubmit = e => {
        e.preventDefault()
        // Manage form contents here

        // Call image upload after
        this.addPhotoToUser(this.state.croppedImage)
    }

    // Write your upload opertions here
    addPhotoToUser = (photo) => {
        console.log("Image file: ", photo); // this is the file to upload
    }

    // ReactCrop component actions and their functions START
    onImageLoaded = image => {
        this.imageRef = image
    }

    onCropChange = (crop) => {
        this.setState({ crop });
    }

    onCropComplete = crop => {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = this.getCroppedImg(this.imageRef, crop)
            this.setState({ croppedImageUrl })
        }
        this.makeClientCrop(crop);
    }
    // ReactCrop component actions and their functions END

    async makeClientCrop(crop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                crop,
                'newFile.jpeg'
            );
            this.setState({ croppedImageUrl });
        }
    }

    getCroppedImg(image, crop) {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            canvas.toBlob(blob => {
                if (!blob) {
                    //reject(new Error('Canvas is empty'));
                    console.error('Canvas is empty');
                    return;
                }
                blob.name = image;
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                reader.readAsDataURL(blob)
                reader.onloadend = () => {
                    this.dataURLtoFile(reader.result, 'cropped.jpg')
                }
                resolve(this.fileUrl);
            }, 'image/jpeg');
        });
    }

    dataURLtoFile(dataurl, filename) {
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        let croppedImage = new File([u8arr], filename, { type: mime });
        this.setState({ croppedImage: croppedImage })
    }

    render() {
        const { crop, profile_pic, src, croppedImageUrl } = this.state

        return (
            <Container className="themed-container" style={{ padding: 10 }}>
                <div>
                    {croppedImageUrl && (
                        <img alt="Crop" style={{ height: 220, width: 220 }} src={croppedImageUrl} />
                    )}
                    {!croppedImageUrl && (
                        <img alt="Crop" style={{ height: 220, width: 220 }} src={logo} />
                    )}
                </div>
                <div>
                    <Button className="mt-1" color="danger" onClick={this.toggle}>Select Image</Button>
                    <Button className="ml-3" color="danger" onClick={this.handleSubmit}>Upload Image</Button>
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Crop image</ModalHeader>
                    <ModalBody>
                        <div className="App">
                            <input type='file' id='profile_pic' value={profile_pic}
                                onChange={this.handleFile} />
                            {src && (
                                <ReactCrop
                                    src={src}
                                    crop={crop}
                                    onImageLoaded={this.onImageLoaded}
                                    onComplete={this.onCropComplete}
                                    onChange={this.onCropChange}
                                />
                            )}

                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggle}>Cancel</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Done</Button>
                    </ModalFooter>
                </Modal>
            </Container >
        )
    }
}

export default PhotoUpload