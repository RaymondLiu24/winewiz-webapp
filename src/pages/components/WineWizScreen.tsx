import React, { useEffect, useState } from "react";
import { ScreenProps } from "@/types/Screen.props";
import SwitchButton from '@/components/switchButton';
import useDisplayWord from '@/hooks/useDisplayWord';


const WineWizScreen: React.FC<ScreenProps> = ({ toNextScreen, handleWaveHeight }) => {
    const initialText = [
        'Hi, I am Wiz, your personal wine master.',
        'I can pick the perfect gift wine for you with just a few questions answered. Afterwards, I will help you create personalized gift cards to make your gift special!'
    ];
    const { displayTexts, handleReset } = useDisplayWord(initialText);
    let audio: HTMLAudioElement | null = null;
    let flag = false;

    const speakText = async () => {
        const { speakText } = await import('../../../utils/textToSpeech');
        audio = await speakText(initialText.join(' '));

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

    useEffect(() => {
        //页面加载完毕时限制speakText只加载一次
        if (!flag) {
            flag = true;
            speakText();
        }

        return () => {
            // stop speaking
            if (audio) {
                audio.pause();
                audio.load();
                audio = null;
            }

        }
    }, []);

    const [showFullText, setShowFullText] = useState(false);
    const [buttonContent, setButtonContent] = useState([
        { className: 'pinot', text: 'Continue', onClick: () => handleContinue() }
    ]);

    const handleContinue = () => {
        setShowFullText(true);
        setTimeout(toNextScreen, 200);
        //在语音播放前跳转下一页则阻止语音播放
        flag = false;
        handleWaveHeight(450);
    };

    return (
        <>
            <div>
                <h1 className="text-[#6B003A] text-[24px] font_extra_bold text-center pt-10">WineWiz</h1>
                {(showFullText ? initialText : displayTexts).map((item, index) => (
                    <div className="text-[#6B003A] text-[14px] font_medium_bold text-left mt-3 pl-5 pr-5 w-screen" key={index}>
                        {item}
                    </div>
                ))}
            </div>
            <div className="w-80 mx-auto">
                <SwitchButton toNextScreen={toNextScreen} customObjContent={buttonContent} />
            </div>
        </>
    );
};

export default WineWizScreen;
