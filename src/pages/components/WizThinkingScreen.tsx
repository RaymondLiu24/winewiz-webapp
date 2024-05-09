
import { ScreenProps } from "@/types/Screen.props";
import useDisplayWord from '@/hooks/useDisplayWord'
import React, { useEffect } from 'react';

const WizThinkingScreen: React.FC<ScreenProps> = ({ toNextScreen, handleWaveHeight }) => {

    const { displayTexts } = useDisplayWord(['Wiz is thinking'])

    useEffect(() => {
        let timer = setInterval(async function () {
            if (typeof window !== 'undefined') {
                let result = localStorage.getItem("contentFromGpt"); // 检查数据，如果有结果则返回
                if (result && result != '') {
                    clearInterval(timer);  // 停止执行
                    toNextScreen();
                }
            }
        }, 2000);

        return () => {
            clearInterval(timer); // 组件卸载时停止定时器
        };


    }, []);


    return (
        <>
            <div className={'text-[#fff] text-[24px] font_normal_bold text-center pt-80'}>{displayTexts[0]}</div>
        </>
    )
}
export default WizThinkingScreen;
