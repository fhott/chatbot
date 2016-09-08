/* eslint-disable no-console */
'use strict';

let Lime = require('lime-js');
let WebSocketTransport = require('lime-transport-websocket');
let MessagingHubClient = require('messaginghub-client');
let request = require('request-promise');
let s = require('underscore.string');

// These are the MessagingHub credentials for this bot.
// If you want to create your own bot, see http://omni.messaginghub.io.
const IDENTIFIER = 'chatbottestjs';
const ACCESS_KEY = 'YXZFOTIwM1RvbmtBUjlQaTdoOWw=';

const MESSAGINGHUB_ENDPOINT = 'ws://msging.net:8081';

const API_ENDPOINT_WORD = 'http://randomword.setgetgo.com/get.php';
const API_ENDPOINT_IMAGE = 'https://unsplash.it/list';
const API_ENDPOINT_DICE = 'http://rollthedice.setgetgo.com/get.php';

// instantiate and setup client
let client = new MessagingHubClient(MESSAGINGHUB_ENDPOINT, new WebSocketTransport());

let message = {};

const processMessage = (m) => {

    console.log(`>> PROCESSING MESSAGE`);

    if(s.include(m.content, "dice")){

        console.log(`>> DICE!`);

        request
            .get(API_ENDPOINT_DICE)
            .then((res) => {
                message = {
                    id: Lime.Guid(),
                    type: 'text/plain',
                    content: `I'm rolling the dice... And the result is ${res}!`,
                    to: m.from
                };
                console.log(`>> RESPONSE: ${message.to}: ${message.content}`);
                client.sendMessage(message);
            })
            .catch((err) => console.error(err));

    }
    else if ( s.include(m.content, "image")
        || s.include(m.content, "photo")
        || s.include(m.content, "picture") ) {

        console.log(`>> IMAGE!`);
        
        message = {
            id: Lime.Guid(),
            to: m.from,
            type: "application/vnd.lime.collection+json",
            content: {
                itemType: "application/vnd.lime.container+json",
                items: [
                    {
                        type: "application/vnd.lime.media-link+json",
                        value: {
                            text: "Take your picture!",
                            type: "image/jpeg",
                            uri: "http://www.qqxxzx.com/images/picture/picture-19.jpg"
                        }
                    },
                    {
                        type: "application/vnd.lime.select+json",
                        value: {
                            text: "Do you want a another picture?",
                            options: [
                                {
                                    order: 1,
                                    text: "Yes! Send image!"
                                },
                                {
                                    order: 2,
                                    text: "Random word."
                                }
                            ]
                        }
                    }           
                ]
            }
        };
        client.sendMessage(message);

    }
    else if (s.include(m.content, "card")){
        
        console.log(`>> CARD!`);

        message = {
            id: Lime.Guid(),
            to: m.from,
            type: "application/vnd.lime.collection+json",
            content: {
                itemType: "application/vnd.lime.container+json",
                items: [
                    {
                        type: "application/vnd.lime.media-link+json",
                        value: {
                            text: "This is a card sample (or container)!",
                            type: "image/jpeg",
                            uri: "http://petersapparel.parseapp.com/img/item100-thumb.png"
                        }
                    },
                    {
                        type: "application/vnd.lime.select+json",
                        value: {
                            text: "Make your choice",
                            options: [
                                {
                                    order: 1,
                                    text: "See our itens"
                                },
                                {
                                    order: 2,
                                    text: "Follow your order"
                                }
                            ]
                        }
                    }           
                ]
            }
        };

        client.sendMessage(message);
    }
    else {

        console.log(`>> WHEREVER!`);

        request
        .get(API_ENDPOINT_WORD)
        .then((res) => {
            message = {
                id: Lime.Guid(),
                type: 'text/plain',
                content: `I don't know what you say, so I give you a random word: ${res}!`,
                to: m.from
            };
            console.log(`>> RESPONSE: ${message.to}: ${message.content}`);
            client.sendMessage(message);
        })
        .catch((err) => console.error(err));
    }
}

client.addMessageReceiver(() => true, (m) => {
    if (m.type !== 'text/plain') return;

    console.log(`<< MESSAGE \nFROM => ${m.from}: ${m.content} \n Message Obj: ${JSON.stringify(m)}`);

    // consumed notification
    client.sendNotification({
        id: m.id,
        to: m.from,
        event: Lime.NotificationEvent.CONSUMED
    });

    // answer with a random word
    processMessage(m);
});

// connect to the MessagingHub server
client.connectWithKey(IDENTIFIER, ACCESS_KEY)
    .then(() => console.log('Listening...'))
    .catch((err) => console.error(err));
