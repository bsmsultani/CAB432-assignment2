import express from 'express';

const app = express();
 


app.post('/api/video/upload', (req, res) => {
    // get the video which is sent 
    res.json({success: true});
});




app.listen(3000, () => console.log('Server ready, visit http://localhost:3000'))
