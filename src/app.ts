import express,{Request,Response} from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';
import {createProxyMiddleware} from 'http-proxy-middleware'

import axios from 'axios'


require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());


const textDecoder = new TextDecoder('utf-8');

const headers = {
  Referer:'https://e69975b881.nl/'
};


app.get('/',(req,res)=>{
  res.send('i am samir')
})
app.get<{}, MessageResponse>('/:link', async (req: Request, res: Response) => {
  const link: string = req.params.link;
  const decodedLink: string = decodeURIComponent(link.trim()); // Decode the entire link

  console.log(decodedLink);
  console.log(decodedLink.endsWith('.m3u8'));


  try {
    // Use the decodedLink in your axios request
    const response = await axios.get(decodedLink, { headers: headers,responseType:'arraybuffer' });
    var data:|BufferSource = response.data;
    const host = 'https://'+req.hostname+'/'

    const pattern = /\/h\/list/    
    // Handle the response based on whether the link ends with .m3u8
    console.log('fuck fuck ' + pattern.test(decodedLink)) 
    
    
    if (decodedLink.endsWith('.m3u8') && !pattern.test(decodedLink)) {
      let data2 = textDecoder.decode(data)
      let splited = data2.split('\n')
      console.log('This is a .m3u8 link');
      splited.map((str,index)=>{
        const trimed = str.trim()
        if(trimed.startsWith('https://')){
          let decoded = encodeURIComponent(trimed)
          splited[index] = host+decoded
          
        }
      })
      // console.log(splited)
      const joined = splited.join('\n')
      res.send(joined)
    }
    else if(pattern.test(decodedLink)){
      let splited = decodedLink.split(/\/list/)
      let hostLink:string = host+ encodeURIComponent(splited[0]+'/').trim()
      let data2 = textDecoder.decode(data)
      let splitedLines = data2.split('\n')

      splitedLines.map((line,index)=>{
        if(line.trim().endsWith('.m3u8')){
          splitedLines[index] = hostLink+encodeURIComponent(line)
        }
      })
      let joined = splitedLines.join('\n')
      res.send(joined) 


    }
    else{
      res.send(data);
    }

  } catch (error) {
    console.error('Error:', error);
    // Handle errors
    res.status(500).send('Internal Server Error');
  }
  // res.send(link)
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
 