exports.categories = {
    'Authentication': {
        bell: {
            url: 'https://github.com/hapijs/bell',
            description: 'Third-party login plugin for hapi with built in Facebook, GitHub, Google, Twitter, Yahoo, Foursquare, and Windows Live support'
        },
        'hapi-auth-anonymous': {
            url: 'https://github.com/codedoctor/hapi-auth-anonymous',
            description: 'Authentication strategy to support anonymous mobile users.'
        },
        'hapi-auth-basic': {
            url: 'https://github.com/hapijs/hapi-auth-basic',
            description: 'An HTTP Basic authentication scheme'
        },
        'hapi-auth-bearer-simple': {
            url: 'https://github.com/Salesflare/hapi-auth-bearer-simple',
            description: 'A simple bearer token based authentication scheme'
        },
        'hapi-auth-bearer-token': {
            url: 'https://github.com/johnbrett/hapi-auth-bearer-token',
            description: 'A bearer token based authentication scheme'
        },
        'hapi-auth-cookie': {
            url: 'https://github.com/hapijs/hapi-auth-cookie',
            description: 'A cookie-based session authentication scheme'
        },
        'hapi-auth-extra': {
            url: 'https://github.com/asafdav/hapi-auth-extra',
            description: 'Additional auth toolbox for HapiJS including ACL support'
        },
        'hapi-auth-hawk': {
            url :'https://github.com/hapijs/hapi-auth-hawk',
            description: 'Hawk authentication plugin'
        },
        'hapi-auth-jwt': {
          url :'https://github.com/ryanfitz/hapi-auth-jwt',
          description: 'JSON Web Token (JWT) authentication plugin'
        },
        'hapi-auth-signature': {
          url :'https://github.com/58bits/hapi-auth-signature',
          description: 'Signature authentication plugin - a wrapper for the Joyent http-signature scheme'
        },
        'hapi-session-mongo': {
            url: 'https://github.com/Mkoopajr/hapi-session-mongo',
            description: 'MongoDB session store and authentication plugin'
        }
    },
    'Documentation': {
        'hapi-swagger': {
            url: 'https://github.com/glennjones/hapi-swagger',
            description: 'A swagger documentation UI generator plugin for hapi'
        },
        'hapi-swagger-models': {
            url: 'https://github.com/codeandfury/node-hapi-swagger-models',
            description: 'Generate Backbone models from a swagger API'
        },
        lout: {
            url: 'https://github.com/hapijs/lout',
            description: 'A browsable documentation generator'
        }
    },
    "Localization/Internationalization": {
        'hapi-l10n-gettext': {
            url: 'https://github.com/maxnachlinger/hapi-l10n-gettext',
            description: 'A localization plug-in for HapiJS'
        },
        hapil18n: {
            url: 'https://github.com/gpierret/hapi18n',
            description: 'i18n for Hapi'
        }
    },
    'Logging/Metrics': {
        blipp: {
            url: 'https://github.com/danielb2/blipp',
            description: 'Displays the routes table at startup'
        },
        good: {
            url: 'https://github.com/hapijs/good',
            description: 'A logging plugin that supports output to console, file and udp/http endpoints'
        },
        'good-reporters': {
            url: 'https://github.com/hapijs/good/tree/master#reporters',
            description: 'List of available good reporter plugins'
        },
        'hapi-statsd': {
            url: 'https://github.com/mac-/hapi-statsd',
            description: 'Sends request round trip metrics to statsd'
        },
        'airbrake-hapi': {
            url: 'https://github.com/Wayfarer247/airbrake-hapi',
            description: 'Sends internal server errors to Airbrake.io'
        }
    },
    'Messaging': {
        'hapi-rabbit': {
            url: 'https://github.com/aduis/hapi-rabbit',
            description: 'A simple rabbitMQ integration plugin for hapi'
        }
    },
    'Security': {
        blankie: {
            url: 'https://github.com/nlf/blankie',
            description: 'A plugin that makes Content-Security-Policy headers easy'
        },
        crumb: {
            url: 'https://github.com/hapijs/crumb',
            description: 'CSRF crumb generation and validation for hapi'
        }
    },
    'Session': {
        yar: {
            url: 'https://github.com/hapijs/yar',
            description: 'A hapi session plugin and cookie jar'
        }
    },
    'Templating': {
        'hapi-dust': {
            url: 'https://github.com/mikefrey/hapi-dust',
            description: 'Compatibility wrapper for dust.js'
        },
        'hapi-json-view': {
            url: 'https://github.com/gergoerdosi/hapi-json-view',
            description: 'JSON view engine for hapi.'
        },
        'hapi-react-views': {
            url: 'https://github.com/jedireza/hapi-react-views',
            description: 'A hapi view engine for React components.'
        },
        'hapi-react': {
            url: 'https://github.com/landau/hapi-react',
            description: 'A port of express-react-views.'
        }
    },
    'Utility': {
        bassmaster: {
            url: 'https://github.com/hapijs/bassmaster',
            description: 'The batch endpoint makes it easy to combine multiple requests into a single one'
        },
        bedwetter: {
            url: 'https://github.com/devinivy/bedwetter',
            description: 'Auto-generated, CRUDdy route handlers for Waterline models in hapi'
        },
        dogwater: {
            url: 'https://github.com/devinivy/dogwater',
            description: 'A hapi plugin integrating Waterline ORM'
        },
        halacious: {
            url: 'https://github.com/bleupen/halacious',
            description: 'A HAL processor for hapi servers'
        },
        'hapi-assets': {
            url: 'https://github.com/poeticninja/hapi-assets',
            description: 'Load assets in views based on node environment.'
        },
        'hapi-bookshelf-serializer': {
          url: 'https://github.com/lob/hapi-bookshelf-serializer',
          description: 'Serialize Bookshelf.js models sent through Hapi reply'
        },
        'hapi-cache-buster': {
            url: 'https://github.com/poeticninja/hapi-cache-buster',
            description: 'Browser asset cache buster.'
        },
        'hapi-cloudinary-connector': {
            url: 'https://github.com/gergoerdosi/hapi-cloudinary-connector',
            description: 'Cloudinary connector plugin for hapi.'
        },
        'hapi-level-db': {
            url: 'https://github.com/maxnachlinger/hapi-level-db',
            description: 'HapiJS / LevelDB integration'
        },
        'hapi-magic-filter': {
            url: 'https://github.com/ruiquelhas/hapi-magic-filter',
            description: 'Hapi.js plugin to validate multipart/form-data file contents'
        },
        'hapi-mailer': {
            url: 'https://github.com/gergoerdosi/hapi-mailer',
            description: 'Mailer plugin for hapi.'
        },
        'hapi-mongoose-db-connector' : {
            url: 'https://github.com/codedoctor/hapi-mongoose-db-connector',
            description: 'hapi plugin that connects to mongodb for mongoose apps'
        },
        'hapi-named-routes': {
            url: 'https://github.com/poeticninja/hapi-named-routes',
            description: 'Add named routes to your view templates.'
        },
        'hapi-node-postgres' : {
            url: 'https://github.com/jedireza/hapi-node-postgres',
            description: 'Wrap requests with a pg connection. Uses connection pooling via `node-postgres`.'
        },
        'hapi-nudge' : {
            url: 'https://github.com/christophercliff/hapi-nudge',
            description: 'A Hapi plugin to prevent Heroku dynos from sleeping.'
        },
        'hapi-router': {
          url: 'https://github.com/bsiddiqui/hapi-router',
          description: 'A plugin to automatically load your routes'
        },
        'hapi-route-directory': {
            url: 'https://github.com/clarkie/hapi-route-directory',
            description: 'A lightweight json route directory'
        },
        'hapi-routes-status' : {
          url: 'https://github.com/codedoctor/hapi-routes-status',
          description: 'Exposes a status route for your node.js/hapi projects.'
        },
        'hapi-sequelize': {
            url: 'https://github.com/codeandfury/node-hapi-sequelize',
            description: 'HAPI Plugin for Sequelize'
        },
        'hapi-sequelized' : {
            url: 'https://github.com/danecando/hapi-sequelized',
            description: 'A plugin for using sequelize with hapi'
        },
        'hapi-webpack' : {
            url: 'https://github.com/christophercliff/hapi-webpack',
            description: 'A Hapi plugin for building and serving Webpack bundles.'
        },
        mrhorse: {
            url: 'https://github.com/mark-bradshaw/mrhorse',
            description: 'Plugin for adding pre-handlers and post-handlers to routes'
        },
        poop: {
            url: 'https://github.com/hapijs/poop',
            description: 'Plugin for taking a process dump and cleaning up after an uncaught exception'
        },
        reptile: {
            url: 'https://github.com/hapijs/reptile',
            description: 'A plugin for creating a REPL'
        },
        ridicule: {
            url: 'https://github.com/walmartlabs/ridicule',
            description: 'A plugin for mocking requests'
        },
        scooter: {
            url: 'https://github.com/hapijs/scooter',
            description: 'User-agent information plugin'
        },
        toothache: {
            url: 'https://github.com/smaxwellstewart/toothache',
            description: 'A plugin designed to make it very simple to create RESTful CRUD endpoints for a Hapi server using MongoDB'
        },
        tv: {
            url: 'https://github.com/hapijs/tv',
            description: 'Interactive debug console plugin for hapi servers'
        },
        hapio: {
            url: 'https://github.com/caligone/hapio',
            description: 'A simple bridge plugin between HapiJS and SocketIO'
        },
        'hapi-mongo-models': {
            url: 'https://github.com/jedireza/hapi-mongo-models',
            description: 'MongoDB object models for hapi applications.'
        }
    },
    Boilerplate: {
        'hapi-dash': {
            url: 'https://github.com/smaxwellstewart/hapi-dash',
            description: 'A boilerplate hapi web and API server example, with frontend dashboard'
        },
        'hapi-ninja': {
            url: 'https://github.com/poeticninja/hapi-ninja',
            description: 'Boilerplate Hapi server example. Node.js, Hapi, and Swig.'
        },
        frame: {
            url: 'https://github.com/jedireza/frame',
            description: 'Includes a user system. 100% test coverage. Bring your own front-end.'
        },
        rutha: {
            url: 'https://github.com/molekilla/rutha',
            description: 'frontend stack for Hapi (server, api) and Angular (client)'
        },
        'generator-hapi-style': {
            url: 'https://github.com/jedireza/generator-hapi-style',
            description: 'Yeoman generator for scaffolding hapi apps and plugins.'
        }
    },
    'The extended hapi universe': {
        boom: {
            url: 'https://github.com/hapijs/boom',
            description: 'HTTP-friendly error objects'
        },
        confidence: {
            url: 'https://github.com/hapijs/confidence',
            description: 'A configuration document format, an API, and a foundation for A/B testing'
        },
        faketoe: {
            url: 'https://github.com/hapijs/faketoe',
            description: 'An XML to JSON converter'
        },
        glue: {
            url: 'https://github.com/hapijs/glue',
            description: 'Server composer'
        },
        hoek: {
            url: 'https://github.com/hapijs/hoek',
            description: 'General purpose node utilities'
        },
        joi: {
            url: 'https://github.com/hapijs/joi',
            description: 'Object schema description language and validator for JavaScript objects'
        },
        kilt: {
            url: 'https://github.com/hapijs/kilt',
            description: 'Combine multiple event emitters into a single emitter'
        },
        lab: {
            url: 'https://github.com/hapijs/lab',
            description: 'A simple testing utility with code coverage analysis'
        },
        makemehapi: {
            url: 'https://github.com/hapijs/makemehapi',
            description: 'Self guided workshops to teach you about hapi'
        },
        qs: {
            url: 'https://github.com/hapijs/qs',
            description: 'A querystring parses with support for arrays and objects'
        },
        rejoice: {
            url: 'https://github.com/hapijs/rejoice',
            description: 'hapi.js cli'
        },
        shot: {
            url: 'https://github.com/hapijs/shot',
            description: 'Injects a fake HTTP request/response into your node server logic'
        },
        topo: {
            url: 'https://github.com/hapijs/topo',
            description: 'Topological sorting with grouping support'
        },
        wreck: {
            url: 'https://github.com/hapijs/wreck',
            description: 'HTTP Client utilities'
        }
    }
};
