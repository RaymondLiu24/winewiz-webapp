import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/router'
import { DownlandOutline } from 'antd-mobile-icons'
import SwitchButton from '@/components/switchButton';
import html2canvas from '../../utils/html2canvas.js';
import imagesReady from '../../utils/html2canvas.js';
import nextBase64 from 'next-base64';
export default function MakeGiftCard({ toNextScreen }: { toNextScreen: any }) {
  const router = useRouter()
  const [image, setImage] = useState("");
  const { isSaved } = router.query

  const [cardInfo, setCardInfo] = useState("")
  const [customObjContent, setCustomObjContent] = useState<{ className: string, text: string, onClick?: Function, children?: any }[]>([
    {
      className: 'shallowPiont',
      text: 'Download Gift Card',
      children: <DownlandOutline />,
      onClick: handleShare
    }
  ])

  const info = useRef<any>();

  const [item, setItems] = useState<any>();
  const imgBox = useRef<any>()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedImage = localStorage.getItem("image");
      if (storedImage !== null) {
        // const url = storedImage.replace('https://oaidalleapiprodscus.blob.core.windows.net', 'api')
        console.log(storedImage)
        storedImage = "/api/proxy-image?imageUrl=" + nextBase64.encode(storedImage)
        setImage(storedImage as string);
      }
    }
  }, [image])

  useEffect(() => {

    if (typeof window !== 'undefined') {
      let cardsInfo = localStorage.getItem("cardsInfo") as string;
      setCardInfo(cardsInfo);
      let contentFromGpt = localStorage.getItem("selectWinJson");
      if (contentFromGpt && (typeof contentFromGpt === 'string')) {
        // 去除末尾空白字符后再截取
        let jsonStr = contentFromGpt.trim();
        const index = jsonStr.lastIndexOf("}");
        if (index !== -1) {
          jsonStr = jsonStr.substring(0, index + 1);
          let jsonFormat = JSON.parse(jsonStr);

          jsonFormat.img = "/api/proxy-image?imageUrl=" + nextBase64.encode(jsonFormat.img)
          info.current = jsonFormat
          console.log(jsonFormat.img)

          // 将info的信息转换为item数组
          const item = [
            { label: 'Country/State', value: info.current.country_state },
            { label: 'Wine Type', value: info.current.category_2 },
            { label: 'Varietal', value: info.current.category_3 },
            { label: 'Brand', value: info.current.brand },
            { label: 'Style', value: info.current.style },
            { label: 'Body', value: info.current.body },
            { label: 'Taste', value: info.current.taste },
            { label: 'Food Pairings', value: info.current.food_pairings },
            { label: 'ABV', value: info.current.abv }
          ];
          setItems(item);
        }
      }
    }

    if (isSaved) {
      setCustomObjContent([
        {
          className: 'pinot',
          text: 'Download Gift Card',
          children: <DownlandOutline />,
          onClick: handleShare
        }
      ])
    }
  }, [])

  function handleShare() {
    downloadAsImage();
  }

  const handleEditPicture = () => {
    if (isSaved) return
    router.push('/uploadImage')
  }

  const downloadAsImage = async () => {
    const captureElement = document.getElementById('capture-area');
    if (captureElement) {
      await imagesReady(document.body);

      const canvas = await html2canvas(captureElement, {
        useCORS: true,
        allowTaint: true,
        // backgroundColor: null,
        // canvas: canvas2,
      })
      if (canvas) {
        // Convert the canvas to a Blob
        canvas.toBlob((blob: Blob) => {
          if (blob) {
            // Create a temporary URL for the Blob
            const url = URL.createObjectURL(blob);

            // Create a temporary anchor element
            const a = document.createElement('a');
            a.href = url;
            a.download = 'WineWiz_GiftCard.png';

            // Trigger the download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Clean up the temporary URL
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      }

    }
  };

  function downloadIamge(imgsrc: string, name: string) {  //下载图片地址和图片名
    const image = new Image();
    image.setAttribute("crossOrigin", "anonymous");
    image.onload = function () {
      let canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(image, 0, 0, image.width, image.height);
        const url = canvas.toDataURL("image/png"); //得到图片的base64编码数据
        const a = document.createElement("a"); // 生成一个a元素
        const event = new MouseEvent("click"); // 创建一个单击事件
        a.download = name || "photo"; // 设置图片名称
        a.href = url; // 将生成的URL设置为a.href属性
        a.dispatchEvent(event); // 触发a的单击事件
      }
    };
    image.src = imgsrc;
  }


  return (
    <div className="container bg-[#F7ECE4] overscroll-y-scroll h-full">
      <h1 className={'text-[#6B003A] text-[24px] font_extra_bold text-center pt-10'}>Make Gift Card</h1>
      <div className={'text-[#6B003A] text-[14px] font_medium_bold text-left mt-3 pl-5 pr-5 w-screen'}>Here is how your gift card will look like</div>
      <div id="capture-area" className={'ml-5 mr-5 pt-5 pb-5 pr-2 pl-2 mt-5 bg-[#FFFFFF] rounded-2xl'}>
        <div onClick={handleEditPicture} className={'ml-5 mr-5 bg-[#FFDFC2] h-[245px] rounded-2xl flex flex-row justify-center items-center'}>
          {isSaved ? <img src={image} alt="generatedImg" className="h-full w-full object-cover" /> :
            <div className="w-[155px] h-[48px] border-solid border-3 border-[#6B003A] rounded-[24px] flex flex-row justify-center items-center">
              <span className="text-[#6B003A] text-[18px] font_normal_bold">Edit Picture</span>
            </div>
          }
        </div>
        <div className="mt-5">
          <div>
            <p className="text-[#6B003A] text-[14px] font_medium_bold text-left italic ml-5 mr-5">{cardInfo}</p><br />
          </div>
        </div>
        <div className="border-t-2 border-[#6B003A]" />
        <div className="flex flex-row mt-5">
          <img
            className={"image_logo m-auto w-32"}
            src={info.current?.img}
            alt="wine"
          />
          <div>
            <h3 className="text-[#6B003A] text-[18px] font_normal_bold leading-4">{info.current?.name}</h3>
            <p className="text-[#6B003A] text-[12px] font_medium_bold w-56">{info.current?.volume}</p>
            <p className="text-[#6B003A] text-[14px] font_medium_bold w-48 leading-5">{info.current?.msg}</p>
          </div>
        </div>
        <div className="mt-5">
          {
            item && item.map((item: any) => (
              <p key={item.label} className="flex flex-row justify-between">
                <span className="text-[#6B003A] text-[14px] text-left font_normal_bold pl-5">{item.label}</span>
                <span className="text-[#6B003A] text-[14px] text-right font_medium_bold pr-5">{item.value}</span>
              </p>
            ))
          }
        </div>
      </div>
      <div className={'mt-10 w-80 mx-auto pb-10'}>
        <SwitchButton customObjContent={customObjContent} isFreePosition={true} />
      </div>
    </div>
  );
}
