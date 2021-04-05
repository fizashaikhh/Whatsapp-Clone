import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({//create a schema
message: String,
name: String,
timestamp: String,
received: Boolean
});

const msgContents = mongoose.model('messagecontent', whatsappSchema) //create a model using that schema

export default msgContents;