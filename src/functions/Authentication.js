const { app } = require('@azure/functions');
const fs = require('fs');
const { readData } = require('../handler/ReadUserTable');

// app.http('Login', {
//     methods: ['GET', 'POST'],
//     authLevel: 'anonymous',
//     handler: async (request, context) => {
//         context.log(`Http function processed request for url "${request.url}"`);

//         readData();
//         const name = request.query.get('name') || await request.text() || 'world';

//         return { body: `Hello hhh, ${name}!` };
//     }
// });

