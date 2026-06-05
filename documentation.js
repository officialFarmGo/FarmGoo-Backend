const swagger = require('swagger-jsdoc');

const options = {
    apis: [
        "./docs/farmer.yaml"
    ],
    
    definition: {
        openapi: "3.0.0",
        info: {
            title: 'Run test',
            version: '1.0.0',
            description: "backend Api for FarmGoo"
        },
        servers: [{
            url: 'http://localhost:4167',
            description: 'hosted url',

        }],
        components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
    }
}
    }   

    }

    module.exports = swagger(options)