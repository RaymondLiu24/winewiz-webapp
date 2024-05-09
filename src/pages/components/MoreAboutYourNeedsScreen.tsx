import React from "react";
import { useState, useEffect } from 'react'
import { AudioOutline } from 'antd-mobile-icons'
import SwitchButton from '@/components/switchButton';
import { ScreenProps } from "@/types/Screen.props";
import useDisplayWord from '@/hooks/useDisplayWord'


const MoreAboutYourNeedsScreen: React.FC<ScreenProps> = ({ toNextScreen, handleWaveHeight }) => {
    let text: string[] = [];
    let audio: HTMLAudioElement | null = null;
    let flag: boolean = false;

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

    if (typeof window !== 'undefined') {
        text = [
            "So you picked " + localStorage.getItem("budget_label") + ", usually costing " + localStorage.getItem("budget_key") + ".",
            "Apart from that, what other things can you think of about this gift? For instance:",
            "1. What purpose is this gift for?",
            "2. Know Their Preference: Does your friend prefer red, white, rosé, or perhaps sparkling wine?",
            "3. Food Pairing: What's on the menu?",
            "4. Special Touch: Consider a wine from a region or a year that is meaningful to your friend. For instance, a wine from a region they have visited or dream of visiting, or a vintage from a significant year in their life."
        ]
    }
    const { displayTexts, handleReset } = useDisplayWord(text)
    const [customObjContent, setCustomObjContent] = useState<{ className: string, text: string, onClick: Function, children?: any }[]>([
        {
            className: 'bordered',
            text: 'Repeat your last message',
            onClick: handleReStart
        },
        {
            className: 'white',
            text: 'Tap to speak',
            children: <AudioOutline />,
            onClick: handleSpeak
        }
    ])



    function handleReStart() {
        const newCustomObjContent: { className: string, text: string, onClick: Function }[] = customObjContent.map((item, index) => {
            if (index === 0) {
                return { ...item, className: 'bordered opacity' };
            }
            return item;
        });
        setCustomObjContent(newCustomObjContent)
        handleReset()
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    }

    function handleSpeak() {
        toNextScreen()
        //在语音播放前跳转下一页则阻止语音播放
        flag = false;
    }
    return (
        <>
            <h1 className={'text-[#6B003A] text-[24px] font_extra_bold text-center pt-10'}>More about your needs</h1>
            {displayTexts.map((item: string, index: number) => (
                <div className={'text-[#6B003A] text-[14px] font_medium_bold text-left mt-3 pl-5 pr-5 w-screen'} key={index}>{item}</div>
            ))}
            <div className={'mt-16 w-80 mx-auto'}>
                <SwitchButton toNextScreen={toNextScreen} customObjContent={customObjContent} />
            </div>
        </>
    )
}

export default MoreAboutYourNeedsScreen;
