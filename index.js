var AWS = require('aws-sdk');
var moment = require('moment');
var { nanoid } = require('nanoid');

var handler = async (event) => {
    var dynamodb = new AWS.DynamoDB({
        apiVersion: '2012-08-10',
        endpoint: 'http://dynamodb:8000',
        region: 'us-west-2',
        credentials: {
            accessKeyId: '2345',
            secretAccessKey: '2345'
        }
    });
    var docClient = new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        service: dynamodb
    });
    // var params = {};
    // dynamodb.listTables(params, function (err, data) {
    //     if (err) console.log(err);
    //     else console.log(data)

    // });


    // return {
    //     body: event.body;
    // };//sam deploy
    // return {
    //     body: JSON.parse(event.body);
    // };
    switch (event.httpMethod) {

        case 'POST':
            const envio = JSON.parse(event.body);
            envio.fechaAlta = moment().toISOString();
            envio.pendiente = envio.fechaAlta;
            envio.id = nanoid();

            return docClient.put({
                TableName: 'Envio',
                Item: envio
            })
                .promise()
                .then(result => {
                    return {
                        statusCode: 201,
                        body: JSON.stringify(envio, null, 2)
                    };
                })
                .catch(error => errorResponse(error));

        // return {
        //     body: JSON.stringify(envio, null, 2)
        // };

        case 'GET':
            return docClient.scan({
                TableName: 'Envio',
                IndexName: 'EnviosPendientesIndex'
            })
                .promise()
                .then(data => {
                    return {
                        body: JSON.stringify(data.Items, null, 2)
                    }
                })
                .catch(error => errorResponse(error));

        case 'PUT':
            const id = event.pathParameters.idEnvio;
            return docClient.update({
                TableName: 'Envio',
                Key: { id: id },
                UpdateExpression: 'REMOVE pendiente'
            })
                .promise()
                .then(result => {
                    return { statusCode: 200 };
                })
                .catch(error => errorResponse(error));
        default:
            return {
                statusCode: 405,
                body: 'method not allowed'
            };
    }
    // return {
    //     statusCode: 200,
    //     body: 'ok'
    // }

};
const errorResponse = error => ({
    statusCode: 500,
    body: JSON.stringify(error, null, 2)
})
//handler();
exports.handler = handler;