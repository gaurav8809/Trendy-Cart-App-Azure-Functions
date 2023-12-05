const { app } = require('@azure/functions');
const fs = require('fs');
const { readData } = require('../handler/ReadUserTable');
const { 
    authenticate, 
    register, 
    addProductIntoCart, 
    removeProductFromCart, 
    getCartData, 
    getWishListData, 
    addProductIntoWishlist, 
    removeProductFromWishlist 
} = require('../handler/userSQLHandler');

app.http('authenticate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'user/authenticate',
    handler: async (request) => {
        let body = await request.json();
        console.log('body: ', body);
        let sqlResponse = await authenticate(body);
        return {
            body:  sqlResponse,
            headers: { 'content-type': 'application/json' },
            status: sqlResponse.status,
        };
    }
});

app.http('register', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'user/register',
    handler: async (request) => {
        let body = await request.json();
        console.log('body: ', body);
        let sqlResponse = await register(body);
        return {
            body:  sqlResponse,
            headers: { 'content-type': 'application/json' },
            status: sqlResponse.status,
        };
    }
});

app.http('getCartData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'user/getCartData/{user_ID}',
    handler: async (request) => {
        return {
            body: await getCartData(request?.params.user_ID) ,
            headers: { 'content-type': 'application/json' }
        };
    }
});


app.http('addProductIntoCart', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'user/addProductIntoCart',
    handler: async (request) => {
        let body = await request.json();
        console.log('body: ', body);
        let sqlResponse = await addProductIntoCart(body);
        return {
            body:  sqlResponse,
            headers: { 'content-type': 'application/json' },
            status: sqlResponse.status,
        };
    }
});

app.http('removeProductFromCart', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'user/removeProductFromCart',
    handler: async (request) => {
        let body = await request.json();
        console.log('body: ', body);
        let sqlResponse = await removeProductFromCart(body);
        return {
            body:  sqlResponse,
            headers: { 'content-type': 'application/json' },
            status: sqlResponse.status,
        };
    }
});

app.http('getWishlistData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'user/getWishlistData/{user_ID}',
    handler: async (request) => {
        return {
            body: await getWishListData(request?.params.user_ID) ,
            headers: { 'content-type': 'application/json' }
        };
    }
});

app.http('addProductIntoWishlist', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'user/addProductIntoWishlist',
    handler: async (request) => {
        let body = await request.json();
        console.log('body: ', body);
        let sqlResponse = await addProductIntoWishlist(body);
        return {
            body:  sqlResponse,
            headers: { 'content-type': 'application/json' },
            status: sqlResponse.status,
        };
    }
});

app.http('removeProductFromWishlist', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'user/removeProductFromWishlist',
    handler: async (request) => {
        let body = await request.json();
        console.log('body: ', body);
        let sqlResponse = await removeProductFromWishlist(body);
        return {
            body:  sqlResponse,
            headers: { 'content-type': 'application/json' },
            status: sqlResponse.status,
        };
    }
});