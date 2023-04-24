import amqplib from 'amqplib';
import config from '../config/index.js';

//Message Broker
// export const CreateChannel = async () => {
//     try {
//         const connection = await amqplib.connect(config.RABBITMQ.URL);
//         connection.on('error', function (err) {
//             console.log('amqp connection error');
//             return setTimeout(() => {
//                 console.log('reconnecting from error');
//                 CreateChannel();
//             }, 1000);
//             throw new Error(err);
//         });
//         connection.on('close', function (err) {
//             console.log('amqp connection close');
//             return setTimeout(() => {
//                 console.log('reconnecting from close');
//                 CreateChannel();
//             }, 1000);
//             throw new Error(err);
//         });
//         const channel = await connection.createChannel();
//         await channel.assertQueue(config.RABBITMQ.EXCHANGE_NAME, 'direct', {
//             durable: true,
//         });
//         return channel;
//     } catch (error) {
//         throw error;
//     }
// };

export const PublishMessage = async (data, event, routingKey) => {
    try {
        const connection = await amqplib.connect(config.RABBITMQ.URL);
        const channel = await connection.createChannel();
        const exchangeName = 'my_exchange';
        const exchangeType = 'direct';
        // await channel.assertExchange(exchangeName, exchangeType, {
        //     durable: true,
        // });
        // const queueName = 'my_queue';
        await channel.assertQueue(exchangeName, 'direct', { durable: true });
        // await channel.assertQueue(queueName, { durable: true });
        // await channel.bindQueue(queueName, exchangeName, '');
        const msg = {
            data,
            event,
        };
        await channel.publish(
            exchangeName,
            routingKey,
            Buffer.from(JSON.stringify(msg)),
        );
        console.log(`Sent message: ${JSON.stringify(msg)}`);
        await channel.close();
        await connection.close();
    } catch (error) {
        throw error;
    }
};

export const SubscribeMessage = async (subscribeEvents, routingKey) => {
    try {
        const connection = await amqplib.connect(config.RABBITMQ.URL);
        const channel = await connection.createChannel();
        const exchangeName = 'my_exchange';

        // await channel.consume(queueName, (message) => {
        //     console.log(`Received message: ${message.content.toString()}`);
        //     channel.ack(message);
        // });
        const timeout = 30000; // 30 seconds
        await channel.assertExchange(exchangeName, 'direct', {
            durable: true,
        });
        const q = await channel.assertQueue('', { exclusive: true });
        console.log(`Waiting for messages in queue: ${q.queue}`);

        channel.bindQueue(q.queue, exchangeName, routingKey);
        channel.consume(
            q.queue,
            (msg) => {
                if (msg.content) {
                    console.log('the message is:', msg.content.toString());
                    subscribeEvents(msg.content.toString());
                }
                console.log('[X] received');
                channel.ack(msg);
            },
            // {
            //     noAck: true,
            // },
        );
        // Wait indefinitely for messages
        while (true) {
            // console.log('Waiting for messages...');
            // console.log()
            await new Promise((resolve) => setTimeout(resolve, timeout));
        }
        // connection.on('error', (error) => {
        //     if (error.code === 'ECONNRESET') {
        //         console.error('Connection was reset');
        //         // Try to reconnect
        //         setTimeout(
        //             () => SubscribeMessage(subscribeEvents, routingKey),
        //             5000,
        //         );
        //     } else {
        //         console.error('An error occurred:', error);
        //     }
        // });
    } catch (error) {
        console.error('Failed to consume:', error);
        // setTimeout(() => SubscribeMessage(subscribeEvents, routingKey), 5000);
    }

    // const connection = await amqp.connect('amqp://localhost');
    // const channel = await connection.createChannel();
    // const exchangeName = 'my_exchange';
    // const exchangeType = 'direct';
    // await channel.assertExchange(exchangeName, exchangeType, { durable: true });
    // const queueName = 'my_queue';
    // await channel.assertQueue(queueName, { durable: true });
    // await channel.bindQueue(queueName, exchangeName, '');
    // await channel.consume(queueName, (message) => {
    //     console.log(`Received message: ${message.content.toString()}`);
    //     channel.ack(message);
    // });
};

// export const PublishMessage = (channel, service, msg) => {
//     try {
//         channel.publish(
//             config.RABBITMQ.EXCHANGE_NAME,
//             service,
//             Buffer.from(msg),
//         );
//         console.log('Sent: ', msg);
//     } catch (error) {
//         throw error;
//     }
// };

// export const SubscribeMessage = async (channel, subscribeEvents) => {
//     try {
//         await channel.assertExchange(config.RABBITMQ.EXCHANGE_NAME, 'direct', {
//             durable: true,
//         });
//         const q = await channel.assertQueue('', { exclusive: true });
//         console.log(`Waiting for messages in queue: ${q.queue}`);

//         channel.bindQueue(
//             q.queue,
//             config.RABBITMQ.EXCHANGE_NAME,
//             config.RABBITMQ.CHANNEL.AUTH_SERVICE,
//         );

//         channel.consume(
//             q.queue,
//             (msg) => {
//                 if (msg.content) {
//                     console.log('the message is:', msg.content.toString());
//                     subscribeEvents(msg.content.toString());
//                 }
//                 console.log('[X] received');
//             },
//             {
//                 noAck: true,
//             },
//         );
//     } catch (error) {
//         throw error;
//     }
// };
