import mongoose from 'mongoose';import config from 'config';import { app } from './app';// const start = async () => {//     try {//         await mongoose.connect(config.get('mongoUrl'));//         console.log('Connected to MongoDb', config.get('mongoUrl'));//         app.listen(config.get('port'), () => {//             console.log(`Auth service is listening on port ${config.get('port')}!`);//         })//     } catch (err) {//         console.log(err);//     }//// }// start();const start = async () => {    try {        await mongoose.connect(config.get('mongoUrl'));        console.log('Connected to MongoDb', config.get('mongoUrl'));        app.listen(config.get('port'), () => {            console.log(`Auth service is listening on port ${config.get('port')}!`);        })    } catch (err) {        console.log(err);    }}const a = 0;let b = +a;start().then((data) => {    console.log('test: ',b );}).catch(err => {    console.log('erer');})