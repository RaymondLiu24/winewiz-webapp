import React from "react";
import { useState, useEffect, useRef } from 'react'
import { AudioOutline } from 'antd-mobile-icons'
import SwitchButton from '@/components/switchButton';
import { ScreenProps } from "@/types/Screen.props";
import useDisplayWord from '@/hooks/useDisplayWord'
import { startRecording, stopRecording } from '../../../utils/audio';
import { transcribeAudio, createThread, createMessageSingle, runThread, listMessage } from '../../../utils/openai'
const PickingScreen: React.FC<ScreenProps> = ({ toNextScreen, handleWaveHeight }) => {

    let audio: HTMLAudioElement | null = null;
    let flag: boolean = false;

    const { displayTexts, handleReset, setDisplayTexts, setTexts } = useDisplayWord([])
    const [showPicking, setShowPicking] = useState(false)
    const [displayPickText, setDisplayPickText] = useState("");
    const audioText = useRef<any>([])
    let recording = useRef<MediaRecorder | null>();
    const [audioBlob, setAudioBlob] = useState<Blob | null>();
    const displayTextRef = useRef<any>();
    const [customObjContent, setCustomObjContent] = useState<{ className: string, text: string, onClick?: Function, children?: any }[]>([
        {
            className: 'picking',
            text: 'Start Picking',
            onClick: handlePick
        },
        {
            className: 'bordered',
            text: 'Repeat your last message',
            onClick: handleReStart
        },
        {
            className: 'white',
            children: <AudioOutline />,
            text: 'Tap to speak',
            onClick: recordVoice
        }
    ])


    const speakText = async () => {
        const { speakText } = await import('../../../utils/textToSpeech');
        audio = await speakText(audioText.current[audioText.current.length - 1]);

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
        displayTextRef?.current.scrollTo(0, displayTextRef?.current.scrollHeight);

    }, [displayTexts])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            let contentFromGpt = localStorage.getItem("contentFromGpt");
            if (contentFromGpt && (typeof contentFromGpt === 'string')) {
                let jsonFormat = JSON.parse(contentFromGpt);
                audioText.current.push(jsonFormat.msg)
                setTexts([jsonFormat.msg]);
                //页面加载完毕时限制speakText只加载一次
                if (!flag) {
                    flag = true;
                    speakText();
                }
            }

            let index = 0;
            const interval = setInterval(() => {

                if (contentFromGpt && (typeof contentFromGpt === 'string')) {
                    let jsonFormat = JSON.parse(contentFromGpt);
                    localStorage.setItem("PickText", displayPickText + jsonFormat.keywords);
                    if (index <= jsonFormat.keywords.length) {
                        setDisplayPickText(jsonFormat.keywords.substring(0, index));
                        index++;

                    } else {
                        clearInterval(interval);
                    }
                }

            }, 100);

            return () => {
                clearInterval(interval);

                if (audio) {
                    audio.pause();
                    audio.load();
                    audio = null;
                }
            };
        }
    }, []);

    async function recordVoice() {
        console.log(recording);
        if (audio) {
            audio.pause()
        }
        if (!recording.current) {
            recording = { current: await startRecording() };

            const newCustomObjContent: { className: string, text: string, onClick?: Function, children?: any }[] = customObjContent.map((item, index) => {
                if (index === 2) {
                    return { ...item, text: 'Tap to send', className: 'bubblyrose' };
                }
                return item;
            });
            setCustomObjContent(newCustomObjContent)
            handleWaveHeight(250)
        } else {
            const blob = await stopRecording(recording.current);
            setAudioBlob(blob);
            recording.current = null;
            const newCustomObjContent: { className: string, text: string, onClick?: Function, children?: any }[] = customObjContent.map((item, index) => {
                if (index === 2) {
                    return { ...item, text: 'Tap to speak', className: 'white' };
                }
                return item;
            });
            setCustomObjContent(newCustomObjContent)
            handleWaveHeight(150)

            if (blob) {
                // Send audio for transcription
                const file = new File([blob], "userspeak.mp3");
                const transcription = await transcribeAudio(file);
                console.log('transcription' + transcription);
                if (transcription) {
                    //构建数据传递 gpt
                    localStorage.setItem("contentFromGpt", '');
                    let threadId = localStorage.getItem("thread_id");
                    let msgFromGpt = await createMessageSingle(threadId, transcription);
                    console.log('msgFromGpt' + JSON.stringify(msgFromGpt));
                    if (typeof window !== 'undefined') {
                        let assistantId = localStorage.getItem('assistant_id');
                        let run = await runThread(threadId, assistantId);
                        if (run.status === 'completed') {
                            let messages = await listMessage(run.thread_id);
                            let content = (messages.data[0].content[0] as any).text.value;
                            if (typeof window !== 'undefined') {

                                console.log(content);


                                if (content && (typeof content === 'string')) {
                                    let jsonFormat = JSON.parse(content);
                                    audioText.current.push(jsonFormat.msg)
                                    handleReset()
                                    setTexts([jsonFormat.msg]);
                                    speakText();
                                    handleWaveHeight(350);
                                    let index = 0;
                                    const interval = setInterval(() => {


                                        if (content && (typeof content === 'string')) {
                                            let jsonFormat = JSON.parse(content);
                                            localStorage.setItem("PickText", displayPickText + jsonFormat.keywords);
                                            if (index <= jsonFormat.keywords.length) {
                                                setDisplayPickText(jsonFormat.keywords.substring(0, index));
                                                index++;
                                            } else {
                                                clearInterval(interval);
                                            }
                                        }

                                    }, 100);
                                    return () => {
                                        clearInterval(interval);
                                    };
                                }
                            }
                        } else {
                            console.log(run.status);
                        }
                    }
                }
            }
        }
    }
    function handleReStart() {
        const newCustomObjContent: { className: string, text: string, onClick?: Function }[] = customObjContent.map((item, index) => {
            if (index === 1) {
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
    async function handlePick() {
        setCustomObjContent(prevContent => ([]))
        setShowPicking(() => true)
        handleWaveHeight(150)
        if (audio) {
            audio.pause()
        }
        if (typeof window !== 'undefined') {
            //选酒
            const threadId = await createThread();
            //发送关键词
            const message = await createMessageSingle(threadId, localStorage.getItem("PickText"));
            let run = await runThread(threadId, "asst_diffUTSlsMltQsgL3Hs4tVLP");
            if (run.status === 'completed') {
                let messages = await listMessage(run.thread_id);
                let contentFromGpt = (messages.data[0].content[0] as any).text.value;
                if (typeof window !== 'undefined') {
                    contentFromGpt = contentFromGpt.replace('【4:3tsource】', '')
                    localStorage.setItem("selectWinJson", contentFromGpt);
                    console.log(contentFromGpt);
                }
            } else {
                console.log(run.status);
            }
        }
        toNextScreen();
        //在语音播放前跳转下一页则阻止语音播放
        flag = false;

    }
    return (
        <>
            <div>
                <h1 className={'text-[#6B003A] text-[24px] font_normal_bold text-center pt-10'}>WineWiz</h1>
                <div className={'h-11 overflow-auto'} ref={displayTextRef}>
                    {displayTexts && displayTexts?.map((item: string, index: number) => (
                        <div className={'text-[#6B003A] text-[14px] font_medium_bold text-left mt-2 pl-5 pr-5 w-screen'} key={index}>{item}</div>
                    ))}
                </div>
            </div>
            <div className={'w-80 h-56 mx-auto mt-10 border-dashed border-2 border-white rounded-lg p-2'}>
                <span className={'text-[#6B003A] text-[14px] font_normal_bold'}>{displayPickText}</span>
            </div>
            {showPicking && <p className={'text-white text-[18px] font_extra_bold text-center mt-10 ='}>Wiz is picking...</p>}
            <div className={'mt-16 w-80 mx-auto'}>
                <SwitchButton toNextScreen={toNextScreen} customObjContent={customObjContent} />
            </div>
        </>
    )
}

export default PickingScreen;
