const { app } = require('@azure/functions');
const fs = require('fs');
const { readData } = require('../handler/ReadUserTable');
const { getProducts, getProductsByID } = require('../handler/productSQLHandler');

app.http('getProducts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'product/getProducts',
    handler: async (request) => {
        const name = request.query.get('name') || await request.text() || 'world';

        return {
            status: 200,
            body: await await getProducts() ,
            headers: { 'content-type': 'application/json' }
        };
    }
});

app.http('getProductsByID', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'product/getProductsByID/{product_ID}',
    handler: async (request) => {
        const product_ID_Array = [request?.params.product_ID]
        return {
            status: 200,
            body: await getProductsByID(product_ID_Array) ,
            headers: { 'content-type': 'application/json' }
        };
    }
});

app.http('getProductsByIDs', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'product/getProductsByID',
    handler: async (request) => {
        let body = await request.json();
        const product_ID_Array = body.product_ID;
        console.log('ProductID: ', product_ID_Array);
        return {
            status: 200,
            body: await getProductsByID(product_ID_Array) ,
            headers: { 'content-type': 'application/json' }
        };
    }
});