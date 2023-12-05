const mysql = require('mysql2/promise');
const _ = require('lodash');
const { mySQLConfig, cryptoKey } = require('../assets/configs');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const authenticate = (data) => {
    return new Promise( async (resolve, reject) => {
        try {

            // Connection Made //
            const connection = await mysql.createConnection(mySQLConfig);
            console.log('Connection established successfully');
            // Connection Mode //


            // Query //
            let QUERY = `SELECT * FROM user WHERE email=?`;
            const [rows, fields] = await connection.execute(QUERY, [data.email]);
            // Query //

            // Business Logic //
            let tempRows = _.omit(rows[0], ['password']);
            console.log('Data: ', tempRows);
            // Business Logic //

            // Output Builder //
            let result;

            if(rows.length) {
                const isCorrect = await bcrypt.compare(data.password, rows[0].password);
                if(isCorrect) {
                    result = {
                        status: 200, 
                        message: 'Success',
                        response: tempRows
                    };
                } else {
                    result = {
                        status: 204, 
                        message: 'Wrong password entered'
                    };
                }
            } else {
                result = {
                    status: 404, 
                    message: 'User doesn\'t exist with this email'
                };
            }
            // Output Builder //
            
            return resolve(JSON.stringify(result));
        } catch (error) {
            console.log('!! Authentication Error!!', error);
            reject('Problem occure');
        }
    })
};

const register = (data) => {
    return new Promise( async (resolve, reject) => {
        try {

            // Initialization //
            let result;

            // Connection Made //
            const connection = await mysql.createConnection(mySQLConfig);
            
            // Query //
            let SELECT_QUERY = `SELECT * FROM user WHERE email=?`;
            const [selectRows] = await connection.execute(SELECT_QUERY, [data.email]);

            if(selectRows.length) {
                result = {
                    status: 409,
                    message: 'User already exist',
                };
            } else {

                // Encrypt //
                const encryptedPassword = await bcrypt.hash(data.password, saltRounds);

                // Query //
                let INSRT_QUERY = `INSERT INTO user (email, password) VALUES (?, ?)`;
                const [insertRows] = await connection.execute(INSRT_QUERY, [data.email, encryptedPassword]);

                // Query //
                let SEARCH_QUERY = `SELECT * FROM user WHERE user_ID=?`;
                const [searchRows] = await connection.execute(SEARCH_QUERY, [insertRows.insertId]);

                // Business Logic //
                let tempRows = _.omit(searchRows[0], ['password']);

                //Output Builder //
                result = {
                    status: 200, 
                    message: 'Success',
                    response: tempRows
                };
            }
            
            return resolve(JSON.stringify(result));
        } catch (error) {
            console.log(error);
            reject('Problem occure');
        }
    })
};

const getCartData = (user_ID) => {
    return new Promise( async (resolve, reject) => {
        try {
            let result;

            // Connection Made //
            const connection = await mysql.createConnection(mySQLConfig);
            // const conn = new mysql.createConnection(mySQLConfig);
        
            let QUERY = 'SELECT * FROM cart WHERE user_ID=?';
            const [rows] = await connection.execute(QUERY, [user_ID]);

            console.log('Data: ', rows);

            if(rows.length) {
                let QUERY2 = 'SELECT * FROM cart_item WHERE cart_ID=?';        
                const [rows2] = await connection.execute(QUERY2, [rows[0].cart_ID]);
    
                result = {
                    status: 200, 
                    message: 'Success',
                    response: {
                        ...rows[0],
                        products: rows2
                    }
                };
            } else {
                result = {
                    status: 404, 
                    message: 'No data in cart',
                };
            }
            console.log('RESULT: ', result);

            return resolve(JSON.stringify(result));
        } catch (error) {
            console.log(error);
            reject('Problem occure');
        }
    })
};

const addProductIntoCart = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            // Initialization //
            let {qty, size, user, product} = data;
            let subtotal, salesTax, total;

            const createResponse = async (cart_ID, subtotal, salesTax, total) => {
                // Query //
                let INSRT_QUERY_CART_ITEMS = `
                    INSERT INTO cart_item 
                    (cart_ID, product_ID, qty, size, price, total) 
                    VALUES 
                    (?, ?, ?, ?, ?, ?)
                `;
                await connection.execute(INSRT_QUERY_CART_ITEMS, [
                    cart_ID,
                    product.product_ID,
                    qty,
                    size,
                    parseFloat(product.price),
                    parseFloat(product.price) * qty
                ]);

                // Query //
                let SEARCH_QUERY = `
                SELECT * FROM cart_item 
                WHERE 
                cart_ID=(
                    SELECT cart_ID FROM cart WHERE user_ID=?
                )
                `;
                const [searchRows] = await connection.execute(SEARCH_QUERY, [user.user_ID]);
            
                return resolve(JSON.stringify({
                    status: 200,
                    message: 'Product added into cart',
                    response: {
                        cart_ID: cart_ID,
                        user_ID: user.user_ID,
                        products: searchRows,
                        subtotal,
                        salesTax,
                        total,
                    }   
                }));
            }

            // Connection Made //
            const connection = await mysql.createConnection(mySQLConfig);
            
            // Query //
            let SELECT_QUERY = `SELECT * FROM cart WHERE user_ID=?`;
            // let SELECT_QUERY = `INSERT INTO CART (user_ID, subtotal, total)`;
            const [selectRows] = await connection.execute(SELECT_QUERY, [user.user_ID]);

            if(selectRows.length) {

                let cart = selectRows[0];

                subtotal = parseFloat(cart.subtotal) + (parseFloat(product.price) * qty);
                salesTax = (subtotal * 6) / 100;
                total = subtotal + salesTax;
                
                // Query //
                let UPDATE_QUERY = `
                    UPDATE cart 
                    SET subtotal=?, salesTax=?, total=?
                    WHERE cart_ID=?
                `;
                await connection.execute(UPDATE_QUERY, [subtotal, salesTax, total, cart.cart_ID]);

                return await createResponse(cart.cart_ID, subtotal, salesTax, total)
            } else {
                subtotal = parseFloat(product.price) * qty;
                salesTax = (subtotal * 6) / 100;
                total = subtotal + salesTax;

                // Query //
                let INSRT_QUERY = `INSERT INTO cart (user_ID, subtotal, salesTax, total) VALUES (?, ?, ?, ?)`;
                const [insertRows] = await connection.execute(INSRT_QUERY, [user.user_ID, subtotal, salesTax, total]);
            
                return await createResponse(insertRows.insertId, subtotal, salesTax, total)
            }
        } catch (error) {
            console.log(error);
            reject('Problem occure');
        }
    })
};

const removeProductFromCart = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            let {cart_item} = data;
            let result;
            let otherProducts = data.products.filter(item => item.product_ID !== cart_item.product_ID);

            // Connection Made //
            const connection = await mysql.createConnection(mySQLConfig);
            console.log('Connection established successfully');
            // Connection Mode //


            // Query //
            let QUERY = `DELETE FROM cart_item WHERE cart_item_ID=?`;
            const [rows, fields] = await connection.execute(QUERY, [cart_item.cart_item_ID]);
            // Query //

            if(rows) {

                let subtotal = 0;
                let salesTax, total;

                console.log('O>P:', otherProducts);
                
                if(otherProducts.length) {
                    otherProducts.map(item => {
                        subtotal = subtotal + (parseFloat(item.price) * item.qty);
                        console.log('price:', parseFloat(item.price));
                        console.log('qty:', item.qty);
                        console.log('Subtotal:', subtotal);
                    })
    
                    salesTax = (subtotal * 6) / 100;
                    total = subtotal + salesTax;
    
                    console.log('Subtotal:', subtotal);
                    console.log('Subtotal:', salesTax);
                    console.log('Subtotal:', total);
    
                    // Query //
                    let UPDATE_QUERY = `
                        UPDATE cart 
                        SET subtotal=?, salesTax=?, total=?
                        WHERE cart_ID=?
                    `;
                    let [deleteRows] = await connection.execute(UPDATE_QUERY, [subtotal, salesTax, total, data.cart_ID]);
    
                    result = {
                        status: 200, 
                        message: 'Product removed from the cart',
                        response: {
                           ... _.omit(data, ['cart_item']),
                           products: otherProducts,
                           subtotal,
                           salesTax,
                           total
                        }
                    };
                } else {
                    // Query //
                    let QUERY = `DELETE FROM cart WHERE cart_ID=?`;
                    const [rows, fields] = await connection.execute(QUERY, [data.cart_ID]);
                    // Query //

                    result = {
                        status: 200, 
                        message: 'Product removed from the cart',
                        response: null
                    };
                }

                
            } else {
                result = {
                    status: 404, 
                    message: 'Product doesn\'t exist in the cart',
                    response: _.omit(data, ['cart_item'])
                };
            }
            
            return resolve(JSON.stringify(result));
        } catch (error) {
            console.log('!! Deletion ', error);
            reject('Problem occure');
        }
    })
};

const getWishListData = (user_ID) => {
    return new Promise( async (resolve, reject) => {
        try {
            let result;

            // Connection Made //
            const connection = await mysql.createConnection(mySQLConfig);
            // const conn = new mysql.createConnection(mySQLConfig);
        
            let QUERY = 'SELECT * FROM wishlist WHERE user_ID=?';
            const [rows] = await connection.execute(QUERY, [user_ID]);

            console.log('Data: ', rows);

            if(rows.length) {
                let QUERY2 = 'SELECT * FROM wishlist_item WHERE wishlist_ID=?';        
                const [rows2] = await connection.execute(QUERY2, [rows[0].cart_ID]);
    
                result = {
                    status: 200, 
                    message: 'Success',
                    response: {
                        ...rows[0],
                        products: rows2
                    }
                };
            } else {
                result = {
                    status: 404, 
                    message: 'No data in wishlist',
                };
            }
            console.log('RESULT: ', result);

            return resolve(JSON.stringify(result));
        } catch (error) {
            console.log(error);
            reject('Problem occure');
        }
    })
};

const addProductIntoWishlist = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            // Initialization //
            let {user, product} = data;

            const createResponse = async (wishilist_ID) => {
                // Query //
                let INSRT_QUERY_WISHLIST_ITEMS = `
                    INSERT INTO wishlist_item 
                    (wishilist_ID, product_ID) 
                    VALUES 
                    (?, ?)
                `;
                await connection.execute(INSRT_QUERY_WISHLIST_ITEMS, [
                    wishilist_ID,
                    product.product_ID
                ]);

                // Query //
                let SEARCH_QUERY = `
                SELECT * FROM wishlist_item 
                WHERE 
                cart_ID=(
                    SELECT wishilist_ID FROM wishlist WHERE user_ID=?
                )
                `;
                const [searchRows] = await connection.execute(SEARCH_QUERY, [user.user_ID]);
            
                return resolve(JSON.stringify({
                    status: 200,
                    message: 'Product added into wishlist',
                    response: {
                        wishilist_ID: wishilist_ID,
                        user_ID: user.user_ID,
                        products: searchRows,
                    }   
                }));
            }

            // Connection Made //
            const connection = await mysql.createConnection(mySQLConfig);
            
            // Query //
            let SELECT_QUERY = `SELECT * FROM wishlist WHERE user_ID=?`;
            const [selectRows] = await connection.execute(SELECT_QUERY, [user.user_ID]);

            if(selectRows.length) {
                let wishlist = selectRows[0];
                return await createResponse(wishlist.wishlist_ID)
            } else {
                // Query //
                let INSRT_QUERY = `INSERT INTO wishlist (user_ID) VALUES (?)`;
                const [insertRows] = await connection.execute(INSRT_QUERY, [user.user_ID]);
                
                return await createResponse(insertRows.insertId)
            }
        } catch (error) {
            console.log(error);
            reject('Problem occure');
        }
    })
};

const removeProductFromWishlist = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            let {wishlist_item} = data;
            let result;
            let otherProducts = data.products.filter(item => item.product_ID !== wishlist_item.product_ID);

            // Connection Made //
            const connection = await mysql.createConnection(mySQLConfig);
            console.log('Connection established successfully');


            // Query //
            let QUERY = `DELETE FROM wishlist_item WHERE wishlist_item_ID=?`;
            const [rows, fields] = await connection.execute(QUERY, [wishlist_item.wishlist_item_ID]);

            if(rows) {
                if(otherProducts.length) {    
                    result = {
                        status: 200, 
                        message: 'Product removed from the wishlist',
                        response: {
                           ... _.omit(data, ['wishlist_item']),
                           products: otherProducts,
                        }
                    };
                } else {
                    // Query //
                    let QUERY = `DELETE FROM wishlist WHERE wishlist_ID=?`;
                    await connection.execute(QUERY, [data.wishlist_ID]);

                    result = {
                        status: 200, 
                        message: 'Product removed from the wishlist',
                        response: null
                    };
                }
            } else {
                result = {
                    status: 404, 
                    message: 'Product doesn\'t exist in the wishlist',
                    response: _.omit(data, ['wishlist_item'])
                };
            }
            
            return resolve(JSON.stringify(result));
        } catch (error) {
            console.log('!! Deletion ', error);
            reject('Problem occure');
        }
    })
};

module.exports = {
    // User
    authenticate,
    register,

    // Cart
    getCartData,
    addProductIntoCart,
    removeProductFromCart,

    // Wishlist
    getWishListData,
    addProductIntoWishlist,
    removeProductFromWishlist
};