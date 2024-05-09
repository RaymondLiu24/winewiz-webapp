import { useState } from "react";
import Image from 'next/image';
import imageLogo from '/WineWiz.png';
import WavyAnimation from '@/components/WavyAnimation/WavyAnimation';
import WineWizScreen from "@/pages/components/WineWizScreen";
import BudgetScreen from "@/pages/components/BudgetScreen";
import MoreAboutYourNeedsScreen from "@/pages/components/MoreAboutYourNeedsScreen";
import WizListeningScreen from "@/pages/components/WizListeningScreen";
import WizThinkingScreen from "@/pages/components/WizThinkingScreen";
import WineWizIndex from "@/pages/components/WineWizIndex";
import PickingScreen from "@/pages/components/PickingScreen";
import MakeGiftCard from "@/pages/makeGiftCard";
import PurchasingScreen from '@/pages/components/PurchasingScreen';

const SCREENS = {
    INDEX: 'index',
    WINE_WIZ: 'wineWiz',
    BUDGET: 'budget',
    MORE_ABOUT_YOUR_NEED: 'moreAboutYourNeed',
    WIZ_LISTENING: 'wizListening',
    WIZ_THINKING: 'wizThinking',
    PICKING_WINE: 'pickingWine',
    PURCHASING_WINE: 'purchasingwine',
    MAKE_GIFT: 'makegift',
};

const SCREENS_MAP = {
    [SCREENS.INDEX]: SCREENS.WINE_WIZ,
    [SCREENS.WINE_WIZ]: SCREENS.BUDGET,
    [SCREENS.BUDGET]: SCREENS.MORE_ABOUT_YOUR_NEED,
    [SCREENS.MORE_ABOUT_YOUR_NEED]: SCREENS.WIZ_LISTENING,
    [SCREENS.WIZ_LISTENING]: SCREENS.WIZ_THINKING,
    [SCREENS.WIZ_THINKING]: SCREENS.PICKING_WINE,
    [SCREENS.PICKING_WINE]: SCREENS.PURCHASING_WINE,
    [SCREENS.PURCHASING_WINE]: SCREENS.MAKE_GIFT

}

export default function ChattingPage() {
    const [currentScreen, setCurrentScreen] = useState(SCREENS.INDEX);
    const [amplitudes, setAmplitudes] = useState({
        [SCREENS.INDEX]: 450,
        [SCREENS.WINE_WIZ]: 450,
        [SCREENS.BUDGET]: 450,
        [SCREENS.MORE_ABOUT_YOUR_NEED]: 450,
        [SCREENS.WIZ_LISTENING]: 250,
        [SCREENS.WIZ_THINKING]: 150,
        [SCREENS.PICKING_WINE]: 450,
        [SCREENS.PURCHASING_WINE]: 450
    })
    const toNextScreen = () => {
        const nextScreen = SCREENS_MAP[currentScreen];
        setCurrentScreen(nextScreen);
    }

    const handleWaveHeight = (val: number) => {
        const newAmplitudes = { ...amplitudes, [currentScreen]: val }
        setAmplitudes(newAmplitudes)
    }

    const SCREENS_COMPONENTS = {
        [SCREENS.INDEX]: <WineWizIndex toNextScreen={toNextScreen} handleWaveHeight={handleWaveHeight} />,
        [SCREENS.WINE_WIZ]: <WineWizScreen toNextScreen={toNextScreen} handleWaveHeight={handleWaveHeight} />,
        [SCREENS.BUDGET]: <BudgetScreen toNextScreen={toNextScreen} handleWaveHeight={handleWaveHeight} />,
        [SCREENS.MORE_ABOUT_YOUR_NEED]: <MoreAboutYourNeedsScreen toNextScreen={toNextScreen} handleWaveHeight={handleWaveHeight} />,
        [SCREENS.WIZ_LISTENING]: <WizListeningScreen toNextScreen={toNextScreen} handleWaveHeight={handleWaveHeight} />,
        [SCREENS.WIZ_THINKING]: <WizThinkingScreen toNextScreen={toNextScreen} handleWaveHeight={handleWaveHeight} />,
        [SCREENS.PICKING_WINE]: <PickingScreen toNextScreen={toNextScreen} handleWaveHeight={handleWaveHeight} />,
        [SCREENS.PURCHASING_WINE]: <PurchasingScreen toNextScreen={toNextScreen} handleWaveHeight={handleWaveHeight} />,
        [SCREENS.MAKE_GIFT]: <MakeGiftCard toNextScreen={toNextScreen} />,
    };


    const currentScreenComponent = SCREENS_COMPONENTS[currentScreen];


    return (
        <div className="container h-screen">
            <WavyAnimation amplitude={amplitudes[currentScreen]} />
            {currentScreenComponent}
        </div>
    );
}
