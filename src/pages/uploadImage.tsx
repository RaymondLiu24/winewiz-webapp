import { useState, useRef } from "react";
import Image from 'next/image';
import { useRouter } from 'next/router'
import SwitchButton from '@/components/switchButton';
import UploadPicture from '@/components/uploadPicture'
import { visionPreview, createImage } from '../../utils/openai'
export default function MakeGiftCard() {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<any>('')
  const [file, setFile] = useState<File>()
  const [generateUrl, setGenerateUrl] = useState(false)
  const selectedIndex = useRef(-1)
  let createdImage = useRef<string>()
  const [customObjContent, setCustomObjContent] = useState<{ className: string, text: string, onClick?: Function, children?: any, loading?: boolean, loadingText?: string }[]>([])
  const imageStyle = ['Anime', 'Watercolor', 'Disney 2D', 'Disney 3D', 'Vector Illustration']
  const handleSave = () => {
    if (createdImage.current) {
      router.push('/makeGiftCard?isSaved=true&image=' + encodeURIComponent(createdImage.current))
    }
  }
  async function handleGenerate() {
    setCustomObjContent([
      {
        className: 'pinot',
        text: 'Save',
        loading: true,
        loadingText: 'Generating',
        onClick: handleSave
      }
    ])
    setGenerateUrl(true)

    if (typeof window !== 'undefined') {
      let contentFromGpt = localStorage.getItem("selectWinJson");
      if (contentFromGpt && (typeof contentFromGpt === 'string')) {
        // 去除末尾空白字符后再截取
        let jsonStr = contentFromGpt.trim();
        const index = jsonStr.lastIndexOf("}");
        if (index !== -1) {
          jsonStr = jsonStr.substring(0, index + 1);
          let jsonFormat = JSON.parse(jsonStr);

          const currentStyle = imageStyle[selectedIndex.current];
          if (file) {
            console.log(avatarUrl);
            let versionRes = await getBase64(file) // `file` your img file
              .then(async (res) => {
                console.log(res);
                let visionPreviewContent = "Identify and describe the main characters shown in the uploaded photo, including any distinguishing features or expressions. Note any significant features of the character. Note the race, skin color, face shape, haircut, hair color, outfit, facial expressions, eyes, ears, nose, mouths, eyebrows, etc. If there is more than one character, describe all the aspects of one person first. Then do it all again for the other. You must output a string in this format “(put all descriptions here)”."
                let resVisionPreview = await visionPreview(res, visionPreviewContent);
                console.log('resVisionPreview' + resVisionPreview);
                return resVisionPreview;
              })
              .catch(err => console.log(err));
            let createImageContent = "make a " + currentStyle + " style picture. Include in the image a bottle of " + jsonFormat.name + ". You must make each person's race strictly correct. Here is the description of the image. " + versionRes + ". Make sure you maintain a vibe for the environment setting of " + jsonFormat.theme + ". Try your best to depict this information correctly for each character: the race, skin color, face shape, haircut, hair color, outfit, facial expressions, eyes, ears, nose, mouths, eyebrows, etc. ";
            // let createImageContent = "make a " + currentStyle + " style picture for these features " + versionRes + " make sure you maintain a vibe for the environment setting of " + jsonFormat.theme + " and include in the image a bottle of " + jsonFormat.name + ". ";
            let createImg = await createImage(createImageContent);
            if (createImg) {
              console.log(createImg);
              createdImage.current = createImg
              localStorage.setItem("image", createImg);
              setAvatarUrl(createImg);
            } else {
              console.log("No image generated");
            }
          }
        }

      }



    }

    //

    setCustomObjContent([
      {
        className: 'pinot',
        text: 'Save',
        onClick: handleSave
      }
    ])
  }
  const handleSelect = (index: number) => {
    if (generateUrl) {
      return
    }
    selectedIndex.current = index

    setCustomObjContent([
      {
        className: 'pinot',
        text: 'Generate',
        onClick: handleGenerate
      }
    ])
  }
  const handlePicture = async (file: File) => {
    setFile(file);
    let url = URL.createObjectURL(file)
    setAvatarUrl(url)
    return {
      url: url,
    }
  }

  async function getBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.onerror = reject
    })
  }

  return (
    <>
      <div className="container bg-[#F7ECE4] overscroll-y-scroll h-screen">
        <h1 className={'text-[#6B003A] text-[24px] font_extra_bold text-center pt-10'}>Image</h1>
        <div className={'text-[#6B003A] text-[14px] font_medium_bold text-left mt-3 pl-5 pr-5 w-screen'}>
          Now, upload a photo and choose a style you want to apply to the image you use on the gift card.
        </div>
        <div className="text-[#6B003A] font_normal_bold text-[18px] ml-5 pt-2">Picture</div>
        <div className={'ml-5 mr-5 bg-[#FFDFC2] h-[245px] rounded-2xl flex flex-row justify-center items-center'}>
          {
            avatarUrl ?
              <img src={`${avatarUrl}`} alt="avatar" className="h-full w-full object-cover" /> :
              <>
                <UploadPicture handleUpload={handlePicture}>
                  <div className="w-[155px] h-[48px] border-solid border-3 border-[#6B003A] rounded-[24px] flex flex-row justify-center items-center">
                    <span className="text-[#6B003A] text-[18px] font_normal_bold">Upload Photo</span>
                  </div>
                </UploadPicture>
              </>
          }
        </div>
        {avatarUrl && <div className="ml-5 mr-5 mt-2 flex flex-row flex-wrap">
          {imageStyle.map((item, index: number) => (
            <span onClick={() => handleSelect(index)} className={`block p-2 mr-2 mb-2 text-[14px] text-[#6B003A] font_normal_bold rounded-2xl ${index === selectedIndex.current ? 'bg-[#FBB1A1]' : 'bg-[#FFFFFF]'}`} key={item}>{item}</span>
          ))}
        </div>
        }
        <div className={'mt-10 w-80 mx-auto pb-10'}>
          <SwitchButton customObjContent={customObjContent} isFreePosition={true} />
        </div>
      </div>
    </>
  );
}
