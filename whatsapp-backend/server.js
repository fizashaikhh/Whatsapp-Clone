import express from 'express'
import mongoose from 'mongoose';
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'

//App Config
const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
  appId: "1183198",
  key: "81da7c01f2134cd5e16b",
  secret: "3494fe435c094cff19a0",
  cluster: "ap2",
  useTLS: true
});

//Middleware
app.use(express.json())//takes incoming object as JSON and not a string

app.use(cors())


//DB config
const connection_url = 'mongodb+srv://admin:6NpwRDUl5aT5eWiR@cluster0.j0vsv.mongodb.net/whatsapp-db?retryWrites=true&w=majority';

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.once('open', () => {

  console.log('DB Connected')

  const msgCollection = db.collection("messagecontents")
  const changeStream = msgCollection.watch();//Listens to the collection for any changes
  changeStream.on("change", (change) => { //When there is a change fire-off the function
    console.log(change);
    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument;
      pusher.trigger('messages', 'inserted',//pusher channel is caled messages
        {
          name: messageDetails.name,
          message: messageDetails.message,
          timestamp: messageDetails.timestamp,
          received : messageDetails.received
        });

    }
    else
      console.log('Error triggering Pusher');


  })

})


app.get('/', (req, res) => res.status(200).send('hello world'))


app.get('/messages/sync', (req, res) => {
  Messages.find((err, data) => {
    if (err)
      res.status(500).send(err)
    else
      res.status(200).send(data)
  })
})

app.post('/messages/new', (req, res) => {
  const dbMessage = req.body
  console.log(dbMessage);

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    else {
      res.status(201).send(data)
    }
  })
})




app.listen(port, () => console.log('Listening on Localhost: '+port))