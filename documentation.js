const swagger = require('swagger-jsdoc');

const options = {
    apis: [
        "./docs/farmer.yaml", "./docs/driver.yaml", "./docs/delivery.yaml", "./docs/agent.yaml"
    ],
    
    definition: {
        openapi: "3.0.0",
        info: {
            title: 'Run test',
            version: '1.0.0',
            description: "backend Api for FarmGoo"
        },
        servers: [
            {
            url: 'https://farmgoo-backend-1.onrender.com',
            description: 'production url'
        },
            {
            url: 'http://localhost:4167',
            description: 'development url',

        }
    ],
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