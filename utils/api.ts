import axios from 'axios';
import xmlbuilder from 'xmlbuilder';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local'});
// const speechRegion = process.env.NEXT_PUBLIC_SPEECH_REGION;
// const subscriptionKey = process.env.NEXT_PUBLIC_SUBSCRIPTION_KEY;
const speechRegion = 'westus3';
const subscriptionKey = 'c98d03497e0f41cda6fff7c0e2cf96ad';
const endpoint = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

export async function textToSpeech(text: string) {
    const ssml = xmlbuilder.create('speak')
      .att('version', '1.0')
      .att('xml:lang', 'en-US')
      .ele('voice')
          .att('xml:lang', 'en-US')
          .att('xml:gender', 'Female')
          .att('name', 'en-US-AvaNeural')
          .txt(text)
      .end();

    const response = await axios.post(endpoint, ssml.toString(), {
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        responseType: 'arraybuffer'  // Important: This tells Axios to expect a binary response (streaming audio)
    });

    return response.data;
}