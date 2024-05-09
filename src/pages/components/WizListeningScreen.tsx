import React from "react";
import { useState, useEffect } from 'react';
import SwitchButton from '@/components/switchButton';
import { AudioOutline } from 'antd-mobile-icons'
import { ScreenProps } from "@/types/Screen.props";
import useDisplayWord from '@/hooks/useDisplayWord';
import { transcribeAudio, createMessages, runThread, listMessage } from '../../../utils/openai'
import { startRecording, stopRecording } from '../../../utils/audio';

const WizListeningScreen: React.FC<ScreenProps> = ({ toNextScreen, handleWaveHeight }) => {
    const text = ['Wiz is listening'];
    const { displayTexts, handleReset, setDisplayTexts } = useDisplayWord(text);

    const [recording, setRecording] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    useEffect(() => {
        const start = async () => {
            const recordingObject = await startRecording();
            setRecording(recordingObject);
        };

        start();

        return () => {
            // Ensure to clean up and handle the promise correctly when unmounting
            const stop = async () => {
                if (recording) {
                    const blob = await stopRecording(recording);
                    setAudioBlob(blob);
                }
            };
            stop();
        };
    }, []);

    const handleSend = async () => {
        if (recording) {
            const blob = await stopRecording(recording); // Correctly wait for the promise to resolve
            setRecording(null);
            setAudioBlob(blob);

            if (blob) {
                // setDisplayTexts(['Wiz is thinking']);
                // Send audio for transcription
                toNextScreen();
                const file = new File([blob], "userspeak.mp3");
                const transcription = await transcribeAudio(file);
                if (transcription) {
                    //构建数据传递 gpt
                    localStorage.setItem("contentFromGpt", '');
                    let threadId = localStorage.getItem("thread_id");
                    let msgFromGpt = await createMessages(threadId, transcription);
                    console.log('msgFromGpt' + JSON.stringify(msgFromGpt));
                    if (typeof window !== 'undefined') {
                        let assistantId = localStorage.getItem('assistant_id');
                        let run = await runThread(threadId, assistantId);
                        if (run.status === 'completed') {
                            let messages = await listMessage(run.thread_id);
                            // for (const message of messages.data.reverse()) {
                            //     debugger
                            //     console.log(`${message.role} > ${(message.content[0] as any).text.value}`);
                            // }
                            let contentFromGpt = (messages.data[0].content[0] as any).text.value;
                            if (typeof window !== 'undefined') {
                                localStorage.setItem("contentFromGpt", contentFromGpt);
                                console.log(contentFromGpt);
                            }
                        } else {
                            console.log(run.status);
                        }
                    }

                }
            }
        }
    };

    const customObjContent = [
        {
            className: 'bubblyrose',
            text: 'Tap to send',
            children: <AudioOutline />,
            onClick: handleSend
        }
    ];

    return (
        <>
            <div className={'text-[#6B003A] text-[24px] font_normal_bold text-center pt-80'}>{displayTexts[0]}</div>
            <div className={'mt-16 w-80 mx-auto'}>
                <SwitchButton toNextScreen={toNextScreen} customObjContent={customObjContent} />
            </div>
        </>
    )
}

export default WizListeningScreen;