import React from "react";
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import SwitchButton from '@/components/switchButton';
import { ScreenProps } from "@/types/Screen.props";
import useDisplayWord from '@/hooks/useDisplayWord'
import { completions } from '../../../utils/openai'

const PickingScreen: React.FC<ScreenProps> = ({ toNextScreen, handleWaveHeight }) => {
  const router = useRouter()
  let text = [""]
  let audio: HTMLAudioElement | null = null;
  let flag = false;

  const speakText = async () => {
    const { speakText } = await import('../../../utils/textToSpeech');
    audio = await speakText(text.join(' '));
    // 在语音开始播放时设置高度
    audio.addEventListener('play', () => handleWaveHeight(350));
    // 在语音播放结束时设置高度
    audio.addEventListener('ended', () => handleWaveHeight(450));

    //判断语音文件解析完之前是否跳转到了下一页
    if (flag) {
      audio.play();
    } else {
      audio.load();
      audio = null;
    }
  }

  const [wineAttribute, setWineAttribute] = useState([])
  const { displayTexts, handleReset, setTexts } = useDisplayWord(text)
  const info = useRef<any>();
  const displayTextRef = useRef<any>()
  const [customObjContent, setCustomObjContent] = useState<{ className: string, text: string, onClick?: Function, showIcon?: boolean }[]>([
    {
      className: 'picking',
      text: 'Purchase this',
      onClick: handlePurchase
    },
    {
      className: 'bordered',
      text: 'Repeat your last message',
      onClick: handleReStart
    },
    {
      className: 'pinot',
      text: 'Make Gift Card',
      onClick: handleMakeGiftcard
    }
  ])

  useEffect(() => {

    if (typeof window !== 'undefined') {
      let contentFromGpt = localStorage.getItem("selectWinJson");
      if (contentFromGpt && (typeof contentFromGpt === 'string')) {
        // 去除末尾空白字符后再截取
        let jsonStr = contentFromGpt.trim();
        const index = jsonStr.lastIndexOf("}");
        if (index !== -1) {
          jsonStr = jsonStr.substring(0, index + 1);
          let jsonFormat = JSON.parse(jsonStr);
          info.current = jsonFormat
          setWineAttribute(jsonFormat.keywords.split(', '));
          if (info.current?.name) {
            text = [`${info.current.msg}`];
            setTexts(text);
            if (!flag) {
              flag = true;
              speakText();
            }
          }
        }
      }



      return () => {
        // stop speaking
        if (audio) {
          audio.pause();
          audio.load();
          audio = null;
        }
      };
    }

  }, [])
  useEffect(() => {
    displayTextRef?.current.scrollTo(0, displayTextRef?.current.scrollHeight);

  }, [displayTexts])
  function handleReStart() {
    const newCustomObjContent: { className: string, text: string, onClick?: Function }[] = customObjContent.map((item, index) => {
      if (index === 1) {
        return { ...item, className: 'bordered opacity' };
      }
      return item;
    });
    setCustomObjContent(newCustomObjContent)
    handleReset();
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }
  function handlePurchase() {
    if (audio) {
      audio.pause()
    }
    window.open(info.current.url, '_blank');
  }
  async function handleMakeGiftcard() {
    if (audio) {
      audio.pause()
    }
    let content = "Write a heartwarming message suitable for a gift card to accompany the gift wine " + info.current.category_3 + " that celebrates the " + info.current.theme + ". Express gratitude, reminisce about shared memories, and convey the joy of having each other in your lives. Encourage the recipient to cherish the bond you share and express optimism for the future adventures you'll embark on together. Please be concise in one or two paragraphs. You must only output the body text paragraphs of the card. You must not include the header and footer or other parts of the card."
    let res = await completions(content);
    if (typeof window !== 'undefined' && res) {
      localStorage.setItem("cardsInfo", res);
    }
    router.push('/makeGiftCard');
  }

  function btnToNextScreen() {
    toNextScreen();
    flag = false;
  }

  return (
    <>
      <div>
        <h1 className={'text-[#6B003A] text-[24px] font_normal_bold text-center pt-10'}>WineWiz</h1>
        <div className={'h-11 overflow-auto'} ref={displayTextRef}>
          {displayTexts.map((item: string, index: number) => (
            <div className={'text-[#6B003A] text-[14px] font_medium_bold text-left mt-1 pl-5 pr-5 w-screen'} key={index}>{item}</div>
          ))}
        </div>
      </div>
      <div className="flex flex-row items-stretch ml-5 mr-5 mt-5 rounded-2xl">
        <div className="bg-[#FFDFC2] rounded-l-2xl flex flex-row items-center">
          <img
            className={"image_logo m-auto w-56"}
            src={info.current?.img}
            alt="wine"
          />
        </div>
        <div className="bg-[#FFFFFF] rounded-r-2xl h-auto pt-5 pl-5 pb-5">
          <h3 className="text-[#6B003A] text-[18px] font_normal_bold leading-5">{info.current?.name}</h3>
          <p className="text-[#6B003A] text-[12px] font_medium_bold w-56">{info.current?.volume}</p>
          <p className="text-[#6B003A] text-[14px] font_normal_bold">${info.current?.price}</p>
          <div className="flex flex-row flex-wrap">
            {wineAttribute.map(item => (
              <span key={item} className="bg-[#FBB1A1] text-[#FFFFFF] text-[12px] font_normal_bold rounded-full pt-1 pb-1 pl-2 pr-2 mr-2 mt-2">{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className={'mt-16 w-80 mx-auto'}>
        <SwitchButton toNextScreen={btnToNextScreen} customObjContent={customObjContent} />
      </div>
    </>
  )
}


export default PickingScreen;
