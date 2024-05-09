import React from "react";
import { ScreenProps } from "@/types/Screen.props";


const WineWizIndex: React.FC<ScreenProps> = ({ toNextScreen, handleWaveHeight }) => {
    return (
        <div onClick={toNextScreen} className={"content flex-row w-screen h-screen"}>
            <div className={"enterShow flex flex-col justify-center pt-36"}>

                <img
                    className={"image_logo m-auto mb-8 w-60"}
                    src={'/WineWiz.png'}
                    alt="WineWizICon"
                />

                <img
                    className={"image_logo m-auto w-40"}
                    src={'/WineWizICon.png'}
                    alt="WineWizICon"
                />
            </div>
            <p
                className={'text-center mt-10 text-[#6B003A] text-[18px] font_extra_bold'}>tap anywhere to continue
            </p>
        </div>
    )
}

export default WineWizIndex;