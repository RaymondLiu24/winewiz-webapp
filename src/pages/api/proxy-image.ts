// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import nextBase64 from 'next-base64';

export default async (req: NextApiRequest, res: NextApiResponse) => {

  // res.status(200).json({ message: 'Hello from API!' });

  try {
    const { imageUrl } = req.query;
    
  
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid imageUrl parameter' });
    }
     
    console.log(nextBase64.decode(imageUrl));
    console.log("=============================");
    // console.log(url);
    // 代理并转发图片请求
    const response = await fetch(nextBase64.decode(imageUrl));
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    // 将图片响应转发给客户端
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

};