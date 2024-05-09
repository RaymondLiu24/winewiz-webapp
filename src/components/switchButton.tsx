import React from 'react';
import clsx from 'clsx';
import { Button, Space } from 'antd-mobile';
import styles from './switchButton.module.scss'


interface switchButtonProps {
  toNextScreen?: () => void;
  customObjContent?: Array<any>
  isFreePosition?: boolean
}

const switchButton: React.FC<switchButtonProps> = ({ toNextScreen, customObjContent, isFreePosition = false }) => {
  const classes = clsx(styles.myContainer, 'w-80 bottom-6', {
    'fixed': !!!isFreePosition
  })
  return (
    <div className={classes}>
      {customObjContent?.map((item, index) => (
        <Button block loading={item?.loading} loadingText={item.loadingText} size='large' className={`${item.className} text-[18px] font_extra_bold`} onClick={item.onClick} key={index}>
          <Space>
            {/* {item.showIcon && <AudioOutline />} */}
            {item.children}
            <span>{item.text}</span>
          </Space>
        </Button>
      ))}
      {/* <Button block  size='large' className={customClassName} onClick={toNextScreen}>
          Tab to speak
      </Button> */}
    </div>
  );
};

export default switchButton;
