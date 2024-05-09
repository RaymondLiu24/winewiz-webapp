import React, { useState } from 'react'
import type { FC } from 'react'
import { ImageUploader } from 'antd-mobile'
import { ImageUploadItem } from 'antd-mobile/es/components/image-uploader'

interface UploadPictureProps {
  handleUpload: (file: File) => Promise<ImageUploadItem>;
  children?: any
}

const UploadPicture: FC<UploadPictureProps> = ({ handleUpload, children }) => {
  return (
    <ImageUploader
      maxCount={1}
      upload={handleUpload}
    >
      { children }
    </ImageUploader>
  )
}

export default UploadPicture
