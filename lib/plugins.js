'use strict';


exports.categories = {
    'Authorization': {
        'hapi-acl-auth': {
            url: 'https://github.com/charlesread/hapi-acl-auth',
            description: 'Authentication provider agnostic authorization plugin for hapi apps'
        },
        'hapi-authorization': {
            url: 'https://github.com/toymachiner62/hapi-authorization',
            description: 'ACL Support for hapi apps'
        },
        'hapi-auth-ip-whitelist': {
            url: 'https://github.com/chamini2/hapi-auth-ip-whitelist',
            description: 'IP whitelisting auth scheme'
        },
        'hapi-rbac': {
            url: 'https://github.com/franciscogouveia/hapi-rbac',
            description: 'A Rule Based Access Control module for hapi'
        },
        'hapi-view-models': {
            url: 'https://github.com/vendigo-group/hapi-view-models',
            description: 'Filter response payloads based on credentials/roles'
        }
    },
    'Authentication': {
        bell: {
            url: 'https://github.com/hapijs/bell',
            description: 'Third-party login plugin for hapi with built in Facebook, GitHub, Google, Instagram, LinkedIn, Twitter, Yahoo, Foursquare, VK, ArcGIS Online and Windows Live support'
        },
        'hapi-auth-anonymous': {
            url: 'https://github.com/codedoctor/hapi-auth-anonymous',
            description: 'Authentication strategy to support anonymous mobile users'
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
        'hapi-auth-firebase': {
            url: 'https://github.com/dsdenes/hapi-auth-firebase',
            description: 'Firebase authentication plugin'
        },
        'hapi-auth-hawk': {
            url: 'https://github.com/hapijs/hapi-auth-hawk',
            description: 'Hawk authentication plugin'
        },
        'hapi-auth-jwt': {
            url: 'https://github.com/ryanfitz/hapi-auth-jwt',
            description: 'JSON Web Token (JWT) authentication plugin'
        },
        'hapi-auth-jwt2': {
            url: 'https://www.npmjs.com/package/hapi-auth-jwt2',
            description: 'Simplified JSON Web Token (JWT) authentication plugin'
        },
        'hapi-jsonwebtoken': {
            url: 'https://github.com/odorisioe/hapi-jsonwebtoken',
            description: 'JsonWebToken implementation for Hapi.js v17+ with authentication plugin'
        },
        'hapi-auth-keycloak': {
            url: 'https://github.com/felixheck/hapi-auth-keycloak',
            description: 'JSON Web Token based Authentication powered by Keycloak'
        },
        'hapi-auth-opentoken': {
            url: 'https://github.com/carbonrobot/hapi-auth-opentoken',
            description: 'Opentoken authentication plugin'
        },
        'hapi-auth-signature': {
            url: 'https://github.com/58bits/hapi-auth-signature',
            description: 'Signature authentication plugin - a wrapper for the Joyent http-signature scheme'
        },
        'hapi-now-auth': {
            url: 'https://github.com/puchesjr/hapi-now-auth',
            description: 'A Hapi v17+ plugin for simplified JSON Web Token (JWT) and Bearer auth tokens'
        },
        'hapi-openid-connect': {
            url: 'https://github.com/gaaiatinc/hapi-openid-connect',
            description: 'A Hapi plugin that implements the OpenID-Connect authorization flow'
        },
        'hapi-passport-saml': {
            url: 'https://github.com/molekilla/hapi-passport-saml',
            description: 'A Hapi plugin that wraps passport-saml for SAML SSO'
        },
        'hapi-session-mongo': {
            url: 'https://github.com/Mkoopajr/hapi-session-mongo',
            description: 'MongoDB session store and authentication plugin'
        },
        'hapi-tiny-auth': {
            url: 'https://github.com/elnaz/hapi-tiny-auth',
            description: 'Just enough authentication to make an API private'
        }
    },
    'Documentation': {
        'hapi-ending': {
            url: 'https://github.com/desirable-objects/hapi-ending.git',
            description: 'A simplified browsable api documentation generator'
        },
        'hapi-swagger': {
            url: 'https://github.com/glennjones/hapi-swagger',
            description: 'A swagger documentation UI generator plugin for hapi'
        },
        'hapi-swagger-models': {
            url: 'https://github.com/codeandfury/node-hapi-swagger-models',
            description: 'Generate Backbone models from a swagger API'
        },
        'hapi-swaggered': {
            url: 'https://github.com/z0mt3c/hapi-swaggered',
            description: 'A plugin to generate swagger v2.0 compliant specifications based on hapi routes and joi schemas'
        },
        'hapi-swaggered-ui': {
            url: 'https://github.com/z0mt3c/hapi-swaggered-ui',
            description: 'A plugin to serve and configure swagger-ui'
        },
        lout: {
            url: 'https://github.com/hapijs/lout',
            description: 'A browsable documentation generator'
        }
    },
    'Encoding': {
        brok: {
            url: 'https://github.com/kanongil/brok',
            description: 'Brotli encoder and decoder'
        }
    },
    'Localization/Internationalization': {
        'hapi-i18n': {
            url: 'https://github.com/codeva/hapi-i18n',
            description: 'Translation module for hapi based on mashpie\'s i18n module'
        },
        'hapi-l10n-gettext': {
            url: 'https://github.com/maxnachlinger/hapi-l10n-gettext',
            description: 'A localization plug-in for HapiJS'
        },
        'hapi-accept-language': {
            url: 'https://github.com/opentable/hapi-accept-language',
            description: 'simple accept-language header parsing'
        },
        'hapi-locale': {
            url: 'https://github.com/ozum/hapi-locale',
            description: 'Configurable plugin to determine request language from URL, Cookie, Query and Header'
        }
    },
    'Logging/Metrics': {
        'airbrake-hapi': {
            url: 'https://github.com/Wayfarer247/airbrake-hapi',
            description: 'Sends internal server errors to Airbrake.io'
        },
        blipp: {
            url: 'https://github.com/danielb2/blipp',
            description: 'Displays the routes table at startup'
        },
        epimetheus: {
            url: 'https://github.com/roylines/node-epimetheus',
            description: 'Key metrics instrumentation for prometheus.io monitoring solution '
        },
        good: {
            url: 'https://github.com/hapijs/good',
            description: 'A logging plugin that supports output to console, file and udp/http endpoints'
        },
        'good-influx': {
            url: 'https://github.com/fhemberger/good-influx',
            description: 'InfluxDB broadcasting for Good process monitor'
        },
        'good-logstash': {
            url: 'https://github.com/fhemberger/good-logstash',
            description: 'Logstash TCP/UDP broadcasting for Good process monitor'
        },
        'good-kinesis-reporter': {
            url: 'https://github.com/vvondra/good-kinesis-reporter',
            description: 'AWS Kinesis and AWS Kinesis Firehose reporter for Good'
        },
        'hapi-good-winston': {
            url: 'https://github.com/alexandrebodin/hapi-good-winston',
            description: 'Winston logging for Good process monitor'
        },
        'hapi-good-papertrail': {
            url: 'https://github.com/vendigo-group/hapi-good-papertrail',
            description: 'Papertrail logging reporter for Good'
        },
        'hapi-good-mongostore': {
            url: 'https://github.com/vendigo-group/hapi-good-mongostore',
            description: 'Good reporter to write to MongoDB'
        },
        'hapi-graylog': {
            url: 'https://github.com/ubirajaramneto/hapi-graylog',
            description: 'A simple graylog interface for hapi.js'
        },
        'hapi-statsd': {
            url: 'https://github.com/mac-/hapi-statsd',
            description: 'Sends request round trip metrics to statsd'
        },
        'hapi-plugin-traffic': {
            url: 'https://github.com/rse/hapi-plugin-traffic',
            description: 'Network traffic accounting'
        },
        'hapi-alive': {
            url: 'https://github.com/idosh/hapi-alive',
            description: 'Health route for your hapi.js server'
        },
        'hapi-pino': {
            url: 'https://github.com/mcollina/hapi-pino',
            description: 'Fast and simple JSON logger'
        },
        'hapi-rollbar': {
            url: 'https://github.com/danecando/hapi-rollbar',
            description: 'Hapi plugin for the fabulous Rollbar logging service'
        },
        'hapijs-status-monitor':{
            url:'https://github.com/ziyasal/hapijs-status-monitor',
            description:'Realtime Monitoring solution for Hapi.js apps, inspired by GitHub Status'
        },
        'laabr':{
            url:'https://github.com/felixheck/laabr',
            description:'Well-formatted pino logger for hapi.js - inspired by morgan'
        },
        'opbeat':{
            url:'https://github.com/opbeat/opbeat-node',
            description:'Performance monitoring and error tracking - tailored for Hapi.js apps'
        }
    },
    'Messaging': {
        'hapi-rabbit': {
            url: 'https://github.com/aduis/hapi-rabbit',
            description: 'A simple rabbitMQ integration plugin for hapi'
        },
        'hapi-plugin-websocket': {
            url: 'https://github.com/rse/hapi-plugin-websocket',
            description: 'Seamless WebSocket integration by injecting WebSocket messages as HTTP request'
        },
        multines: {
            url: 'https://github.com/mcollina/multines',
            description: 'Support for multi-process publish/subscribe for nes'
        },
        susie: {
            url: 'https://github.com/mtharrison/susie',
            description: 'Server-Sent Events for hapi with support for streaming events'
        },
        'hapi-wechat': {
            url: 'https://github.com/dhso/hapi-wechat',
            description: 'Wechat plugin for hapi'
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
        },
        'hapi-api-secret-key': {
            url: 'https://github.com/justin-lovell/hapi-api-secret-key',
            description: 'Protect your micro-service API by only allowing explicit access with secret tokens. Great for proxies or API Management gateways'
        },
        'ralphi': {
            url: 'https://github.com/yonjah/ralphi',
            description: 'Simple and minimal rate limiting and bruteforce protection'
        }
    },
    'Session': {
        'hapi-server-session': {
            url: 'https://github.com/btmorex/hapi-server-session',
            description: 'Simple server-side session support for hapi'
        },
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
        'hapi-react': {
            url: 'https://github.com/landau/hapi-react',
            description: 'A port of express-react-views'
        },
        'hapi-react-views': {
            url: 'https://github.com/jedireza/hapi-react-views',
            description: 'A hapi view engine for React components'
        },
        'hapi-themes': {
            url: 'https://github.com/carbonrobot/hapi-themes',
            description: 'A hapi view handler for serving themeable or whitelabel content'
        },
        'hapi-consolidate': {
            url: 'https://github.com/Okoyl/hapi-consolidate',
            description: 'Hapi template rendering using consolidate'
        },
        '@tanepiper/quorra': {
            url: 'https://github.com/tanepiper/quorra',
            description: 'Hapi route handler that makes react-router your isomorphic server side router'
        }
    },
    'Utility': {
        'acquaint': {
            url: 'https://github.com/genediazjr/acquaint',
            description: 'Autoload routes, handlers, and methods through glob patterns'
        },
        'admin-bro-hapijs': {
            url: 'https://github.com/SoftwareBrothers/admin-bro-hapijs',
            description: 'AdminBro - Admin Panel integrated into your hapijs routes'
        },
        akaya: {
            url: 'https://github.com/felixheck/akaya',
            description: 'Generate URIs fast based on named hapi routes their parameters'
        },
        bassmaster: {
            url: 'https://github.com/hapijs/bassmaster',
            description: 'The batch endpoint makes it easy to combine multiple requests into a single one'
        },
        bedwetter: {
            url: 'https://github.com/devinivy/bedwetter',
            description: 'Auto-generated, CRUDdy route handlers for Waterline models in hapi'
        },
        bissle: {
            url: 'https://github.com/felixheck/bissle',
            description: 'Minimalist HALicious pagination reply interface for HapiJS'
        },
        configue: {
            url: 'https://github.com/AdrieanKhisbe/configue',
            description: 'Config plugin for Hapi'
        },
        cron: {
            url: 'https://github.com/antonsamper/hapi-cron',
            description: 'Cron jobs for internal hapi.js routes'
        },
        'cron-cluster': {
            url: 'https://github.com/Meg4mi/hapi-cron-cluster',
            description: 'Cron jobs for internal hapi.js routes with leader election (mongodb or redis) - cluster mode'
        },
        crudy: {
            url : 'https://github.com/g-div/crudy',
            description: 'Exposes a RESTful CRUD interface using Dogwater models and Bedwetter\'s route-handler'
        },
        'disinfect': {
            url: 'https://github.com/genediazjr/disinfect',
            description: 'Request query, payload, and params sanitization'
        },
        dogwater: {
            url: 'https://github.com/devinivy/dogwater',
            description: 'A hapi plugin integrating Waterline ORM'
        },
        errorh: {
            url: 'https://github.com/genediazjr/errorh',
            description: 'Custom error pages'
        },
        glee: {
            url: 'https://github.com/nathanbuchar/hapi-glee',
            description: 'Specify environment-specific scopes for your routes'
        },
        'hapi-arch': {
            url: 'https://github.com/AhmedAli7O1/hapi-arch',
            description: 'Hapi plugin, with a cli tool to generate MVC hapi project and auto-load almost everything'
        },
        halacious: {
            url: 'https://github.com/bleupen/halacious',
            description: 'A HAL processor for hapi servers'
        },
        'hapi-algolia-search': {
            url: 'https://github.com/sigfox/hapi-algolia-search',
            description: 'A hapi plugin integration Algolia Search (a search engine as a service)'
        },
        'hapi-api-version': {
            url: 'https://github.com/p-meier/hapi-api-version',
            description: 'An API versioning plugin for hapi.'
        },
        'hapi-assets': {
            url: 'https://github.com/poeticninja/hapi-assets',
            description: 'Load assets in views based on node environment'
        },
        'hapi-async-handler': {
            url: 'https://github.com/ide/hapi-async-handler',
            description: 'Use ES7 async functions and co generator functions as hapi route handlers'
        },
        'hapi-attempts-limiter': {
            url: 'https://github.com/acavestro/hapi-attempts-limiter',
            description: 'An hapi.js plugin that limits the number of failed attempts for every route'
        },
        'hapi-auto-route': {
            url: 'https://github.com/sitrakay/hapi-auto-route',
            description: 'Autoloads routes object from a directory'
        },
        'hapi-aws': {
            url: 'https://github.com/ar4mirez/hapi-aws',
            description: 'A HapiJS plugin for AWS services.'
        },
        'hapi-bookshelf-models': {
            url: 'https://github.com/lob/hapi-bookshelf-models',
            description: 'Load, register, and expose Bookshelf.js models'
        },
        'hapi-bookshelf-serializer': {
            url: 'https://github.com/lob/hapi-bookshelf-serializer',
            description: 'Serialize Bookshelf.js models sent through Hapi reply'
        },
        'hapi-bookshelf-total-count': {
            url: 'https://github.com/lob/hapi-bookshelf-total-count',
            description: 'Calculate and append the total count of Bookshelf model instances that match a query'
        },
        'hapi-boom-decorators': {
            url: 'https://github.com/brainsiq/hapi-boom-decorators',
            description: 'Exposes boom errors through the hapi reply interface'
        },
        'hapi-cache-buster': {
            url: 'https://github.com/poeticninja/hapi-cache-buster',
            description: 'Browser asset cache buster'
        },
        'hapi-decorators': {
            url: 'https://github.com/knownasilya/hapi-decorators',
            description: 'Decorators for HapiJS routes'
        },
        'hapi-default-payload': {
            url: 'https://github.com/lob/hapi-default-payload',
            description: 'Hapi plugin to default the request payload to an empty object'
        },
        'hapi-dev-errors': {
            url: 'https://github.com/fs-opensource/hapi-dev-errors',
            description: 'Get better error details during development and skip the command line round trip to catch the issue'
        },
        'hapi-dropbox-webhooks': {
            url: 'https://github.com/christophercliff/hapi-dropbox-webhooks',
            description: 'A Hapi plugin for receiving requests from the Dropbox webhooks API'
        },
        'hapi-error': {
            url: 'https://www.npmjs.com/package/hapi-error',
            description: 'Custom error handling with ability to pass an object and render a custom error template or redirect to a specific url on error.'
        },
        'hapi-gate': {
            url: 'https://github.com/captainjackrana/hapi-gate',
            description: 'Easily handle http to https and www/non-www redirections'
        },
        'hapi-geo-locate': {
            url: 'https://github.com/fs-opensource/hapi-geo-locate',
            description: 'Geo locate requests by IP and provide the user’s location in your route handlers'
        },
        'hapi-handlers': {
            url: 'https://github.com/ar4mirez/hapi-handlers',
            description: 'Allow to autoload handlers, see more here: http://hapijs.com/api#serverhandlername-method'
        },
        'hapi-heroku-helpers': {
            url: 'https://github.com/briandela/hapi-heroku-helpers',
            description: 'A hapi.js plugin which provides some basic functionality which can be useful when running a hapi.js site on Heroku'
        },
        'hapi-hubspot': {
            url: 'https://github.com/asilluron/hapi-hubspot',
            description: 'Plugin handles initial connection and exposes a single client instance for node-hubspot (a node.js wrapper for HubSpot API)'
        },
        'hapi-imagemin-proxy': {
            url: 'https://github.com/fhemberger/hapi-imagemin-proxy',
            description: 'Hapi proxy for serving optimized images with `imagemin`'
        },
        'hapi-info': {
            url: 'https://github.com/danielb2/hapi-info',
            description: 'Adds route to show hapi version and plugin versions'
        },
        'hapi-io': {
            url: 'https://github.com/sibartlett/hapi-io',
            description: 'A socket.io plugin that can forward socket.io events to hapi routes'
        },
        'hapi-level-db': {
            url: 'https://github.com/maxnachlinger/hapi-level-db',
            description: 'HapiJS / LevelDB integration'
        },
        'hapi-magic-filter': {
            url: 'https://github.com/ruiquelhas/hapi-magic-filter',
            description: 'Hapi.js plugin to validate multipart/form-data file contents'
        },
        'hapi-methods-injection': {
            url: 'https://github.com/amgohan/hapi-methods-injection',
            description: 'Hapi.js plugin that scan and register automatically your hapi methods'
        },
        'hapi-mongo-models': {
            url: 'https://github.com/jedireza/hapi-mongo-models',
            description: 'MongoDB object models for hapi applications'
        },
        'hapi-mongodb': {
            url: 'https://github.com/Marsup/hapi-mongodb',
            description: 'A simple Hapi MongoDB connection plugin, accessing one or several connections pools through server or request properties'
        },
        'hapi-mongojs': {
            url: 'https://github.com/niqdev/hapi-mongojs',
            description: 'mongojs connection plugin for hapi'
        },
        'hapi-mongoose': {
            url: 'https://github.com/asilluron/hapi-mongoose',
            description: 'A lightweight mongoose connection and configuration plugin for Hapi 9+'
        },
        '@watchup/hapi-mongoose': {
            url: 'https://github.com/watchup/hapi-mongoose',
            description: 'Hapi.js plugin that maps mongoose models to routes'
        },
        'hapi-mongoose-db-connector': {
            url: 'https://github.com/codedoctor/hapi-mongoose-db-connector',
            description: 'hapi plugin that connects to mongodb for mongoose apps'
        },
        'hapi-multi-mongo': {
            url: 'https://github.com/metoikos/hapi-multi-mongo',
            description: 'Hapi mongodb connection plugin, especially for multiple connections'
        },
        'hapi-mysql2': {
            url: 'https://github.com/midnightcodr/hapi-mysql2',
            description: 'Another mysql plugin for Hapijs that supports multiple connections, inspired by Marsup/hapi-mongodb'
        },
        'hapi-named-routes': {
            url: 'https://github.com/poeticninja/hapi-named-routes',
            description: 'Add named routes to your view templates'
        },
        'hapi-next' : {
            url: 'https://github.com/Pranay92/hapi-next',
            description: 'Add modularity to your route handlers'
        },
        'hapi-node-postgres': {
            url: 'https://github.com/jedireza/hapi-node-postgres',
            description: 'Wrap requests with a pg connection. Uses connection pooling via `node-postgres`'
        },
        'hapi-nudge': {
            url: 'https://github.com/christophercliff/hapi-nudge',
            description: 'A Hapi plugin to prevent Heroku dynos from sleeping'
        },
        hapio: {
            url: 'https://github.com/caligone/hapio',
            description: 'A simple bridge plugin between HapiJS and SocketIO'
        },
        'hapi-octopus': {
            url: 'https://github.com/ar4mirez/hapi-octopus',
            description: 'A multi-purpose plugin that allows you to autoload methods, handlers, routes and decorators using a simple signature convention.'
        },
        'hapi-paginate': {
            url: 'https://github.com/developmentseed/hapi-paginate',
            description: 'A simple pagination for HapiJS responses'
        },
        'hapi-pagination': {
            url: 'https://github.com/fknop/hapi-pagination',
            description: 'A simple / customizable pagination plugin for HapiJS'
        },
        'hapi-plugin-co': {
            url: 'https://github.com/rse/hapi-plugin-co',
            description: 'Co-routine based route handlers for asynchronous processing'
        },
        'hapi-plugin-header': {
            url: 'https://github.com/rse/hapi-plugin-header',
            description: 'Always send one or more custom HTTP headers, independent of the current route'
        },
        'hapi-pulse': {
            url: 'https://github.com/fs-opensource/hapi-pulse',
            description: 'Gracefully stop the hapi server on SIGINT (for graceful PM2 reloads)'
        },
        'hapi-rate-limiter': {
            url: 'https://github.com/lob/hapi-rate-limiter/',
            description: 'A Hapi plugin that enables rate-limiting for GET, POST, and DELETE requests. This plugin can be configured with custom rates on a route-by-route basis.'
        },
        'hapi-rate-limitor': {
            url: 'https://github.com/fs-opensource/hapi-rate-limitor',
            description: 'Easy to use rate limiting to prevent brute-force attacks'
        },
        'hapi-recaptcha': {
            url: 'https://github.com/cristobal151/hapi-recaptcha',
            description: 'Google\'s reCaptcha for hapi'
        },
        'hapi-redis': {
            url: 'https://github.com/sandfox/node-hapi-redis',
            description: 'A Hapi plugin to provide a redis client'
        },
        'hapi-redis2': {
            url: 'https://github.com/midnightcodr/hapi-redis2',
            description: 'A redis plugin for Hapijs that supports multiple connections, inspired by Marsup/hapi-mongodb'
        },
        'hapi-request-user': {
            url: 'https://github.com/fs-opensource/hapi-request-user',
            description: 'A hapi plugin that shortcuts “request.auth.credentials” to “request.user”'
        },
        'hapi-response-time': {
            url: 'https://github.com/pankajpatel/hapi-response-time',
            description: 'A Hapi plugin for adding `x-response-time` header to responses'
        },
        'hapi-response-meta': {
            url: 'https://github.com/developmentseed/hapi-response-meta',
            description: 'A Hapi plugin for adding metadata to a Hapi response'
        },
        'hapi-route-directory': {
            url: 'https://github.com/clarkie/hapi-route-directory',
            description: 'A lightweight json route directory'
        },
        'hapi-router': {
            url: 'https://github.com/bsiddiqui/hapi-router',
            description: 'A plugin to automatically load your routes'
        },
        'hapi-routes-status': {
            url: 'https://github.com/codedoctor/hapi-routes-status',
            description: 'Exposes a status route for your node.js/hapi projects'
        },
        'hapi-sanitize-payload': {
            url: 'https://github.com/lob/hapi-sanitize-payload',
            description: 'Hapi plugin to sanitize the request payload'
        },
        'hapi-sequelizejs': {
            url: 'https://github.com/valtlfelipe/hapi-sequelizejs',
            description: 'HAPI Plugin for Sequelize (compatible v17)'
        },
        'hapi-sequelize-crud': {
            url: 'https://github.com/mdibaiee/hapi-sequelize-crud',
            description: 'Automatically generate RESTful API for your models, depends on hapi-sequelized'
        },
        'hapi-suricate': {
            url: 'https://github.com/viniciusbo/hapi-suricate',
            description: 'Simple and flexible Hapi route REST handlers for your Mongoose models'
        },
        'hapi-test': {
            url: 'https://github.com/klokoy/hapi-test',
            description: 'Test hapi plugins with chaining method calls and assertions'
        },
        'hapi-to': {
            url: 'https://github.com/mtharrison/hapi-to',
            description: 'Generate dynamic URLs to named routes, with support for query and path params (including wildcard, optional and multi-params)'
        },
        'hapi-webpack': {
            url: 'https://github.com/christophercliff/hapi-webpack',
            description: 'A Hapi plugin for building and serving Webpack bundles'
        },
        'hapi-webpack-dev-server': {
            url: 'https://github.com/atroo/hapi-webpack-dev-server-plugin',
            description: 'Implementation of the dev server middleware to function as a plugin in a hapi.js server'
        },
        'haute-couture': {
            url: 'https://github.com/hapipal/haute-couture',
            description: 'File-based hapi plugin composer'
        },
        hecks: {
            url: 'https://github.com/hapipal/hecks',
            description: 'Mount your express app onto your hapi server, aw heck!'
        },
        hodgepodge: {
            url: 'https://github.com/hapipal/hodgepodge',
            description: 'A plugin dependency resolver'
        },
        hpal: {
            url: 'https://github.com/hapipal/hpal',
            description: 'The hapi pal CLI, for searching hapi docs, scaffolding projects, and running custom server commands'
        },
        k7: {
            url: 'https://github.com/thebergamo/k7',
            description: 'Connect you database with Hapijs made easy'
        },
        labbable: {
            url: 'https://github.com/devinivy/labbable',
            description: 'No-fuss hapi server testing'
        },
        loveboat: {
            url: 'https://github.com/devinivy/loveboat',
            description: 'A pluggable route configuration preprocessor'
        },
        mrhorse: {
            url: 'https://github.com/mark-bradshaw/mrhorse',
            description: 'Plugin for adding pre-handlers and post-handlers to routes'
        },
        patova: {
            url: 'https://github.com/dschenkelman/patova',
            description: 'A limitd plugin for hapi, useful for rate-limiting/throttling'
        },
        poop: {
            url: 'https://github.com/hapijs/poop',
            description: 'Plugin for taking a process dump and cleaning up after an uncaught exception'
        },
        recourier: {
            url: 'https://github.com/ruiquelhas/recourier',
            description: 'Request lifecycle property sealing'
        },
        reptile: {
            url: 'https://github.com/hapijs/reptile',
            description: 'A plugin for creating a REPL'
        },
        'rest-hapi': {
            url: 'https://github.com/JKHeadley/rest-hapi',
            description: 'A RESTful API generator for hapi'
        },
        ridicule: {
            url: 'https://github.com/walmartlabs/ridicule',
            description: 'A plugin for mocking requests'
        },
        schmervice: {
            url: 'https://github.com/hapipal/schmervice',
            description: 'A service layer for hapi'
        },
        schwifty: {
            url: 'https://github.com/hapipal/schwifty',
            description: 'A model layer for hapi integrating Objection ORM'
        },
        scooter: {
            url: 'https://github.com/hapijs/scooter',
            description: 'User-agent information plugin'
        },
        spazy: {
            url: 'https://github.com/AlexanderElias/spazy',
            description: 'Static file and single page application (spa) plugin for hapi'
        },
        tacky: {
            url: 'https://github.com/continuationlabs/tacky',
            description: 'Server-side response caching for hapi'
        },
        therealyou: {
            url: 'https://github.com/briandela/therealyou',
            description: 'A plugin for setting the request.info.remoteAddress and request.info.remotePort based on the X-Forwarded-For and X-Forwarded-Port headers'
        },
        toothache: {
            url: 'https://github.com/smaxwellstewart/toothache',
            description: 'A plugin designed to make it very simple to create RESTful CRUD endpoints for a Hapi server using MongoDB'
        },
        tournesol: {
            url: 'https://github.com/vdeturckheim/tournesol',
            description: 'A tool designed to make api testing clearer and easier'
        },
        tandy: {
            url: 'https://github.com/hapipal/tandy',
            description: 'Auto-generated, RESTful, CRUDdy route handlers for Objection models'
        },
        toys: {
            url: 'https://github.com/hapipal/toys',
            description: 'The hapi utility toy chest'
        },
        tv: {
            url: 'https://github.com/hapijs/tv',
            description: 'Interactive debug console plugin for hapi servers'
        },
        underdog: {
            url: 'https://github.com/hapipal/underdog',
            description: 'HTTP/2 server-push for hapi'
        },
        wozu: {
            url: 'https://github.com/felixheck/wozu',
            description: 'Server decorator to list all defined hapi.js routes'
        },
        wurst: {
            url: 'https://github.com/felixheck/wurst',
            description: 'Directory based autoloader for routes'
        }
    },
    Validation: {
        blaine: {
            url: 'https://github.com/ruiquelhas/blaine',
            description: 'Server-level file signature validation for raw request payloads in memory'
        },
        burton: {
            url: 'https://github.com/ruiquelhas/burton',
            description: 'Server-level file signature validation for raw stream request payloads'
        },
        copperfield: {
            url: 'https://github.com/ruiquelhas/copperfield',
            description: 'Server-level file signature validation for parsed request payloads in memory'
        },
        coutts: {
            url: 'https://github.com/ruiquelhas/coutts',
            description: 'Server-level file signature validation for raw temporary file request payloads'
        },
        fischbacher: {
            url: 'https://github.com/ruiquelhas/fischbacher',
            description: 'Server-level file signature validation for parsed temporary file request payloads'
        },
        'hapi-plugin-ducky': {
            url: 'https://github.com/rse/hapi-plugin-ducky',
            description: 'Validating payloads with the DuckyJS JSON validation language'
        },
        henning: {
            url: 'https://github.com/ruiquelhas/henning',
            description: 'Server-level file signature validation for parsed request payload file streams'
        },
        houdin: {
            url: 'https://github.com/ruiquelhas/houdin',
            description: 'Route-level file signature validation for request payloads in memory'
        },
        lafayette: {
            url: 'https://github.com/ruiquelhas/lafayette',
            description: 'Route-level file signature validation for temporary file request payloads'
        },
        ratify: {
            url: 'https://github.com/mac-/ratify',
            description: 'Use JSON schemas to specify valid request payload, query, path and headers and generate swagger from them'
        },
        supervizor: {
            url: 'https://github.com/ruiquelhas/supervizor',
            description: 'Server-level request payload validation'
        },
        thurston: {
            url: 'https://github.com/ruiquelhas/thurston',
            description: 'Route-level file signature validation for request payload file streams'
        },
        'hapi-seneca': {
            url: 'https://github.com/dhso/hapi-seneca',
            description: 'Seneca micro service for hapi'
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
        h2o2: {
            url: 'https://github.com/hapijs/h2o2',
            description: 'Proxy handler'
        },
        'hapi-graceful-pm2': {
            url: 'https://github.com/roylines/hapi-graceful-pm2',
            description: 'Handle true zero downtime reloads when issuing a pm2 gracefulReload command'
        },
        'hapi-openapi': {
            url: 'https://github.com/krakenjs/hapi-openapi',
            description: 'hapi plugin to build design-driven apis with OpenAPI (formerly swagger).'
        },
        'hapi-plugin-graphiql': {
            url: 'https://github.com/rse/hapi-plugin-graphiql',
            description: 'HAPI plugin for integrating GraphiQL, an interactive GraphQL user interface'
        },
        hoek: {
            url: 'https://github.com/hapijs/hoek',
            description: 'General purpose node utilities'
        },
        inert: {
            url: 'https://github.com/hapijs/inert',
            description: 'Static file and directory handlers'
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
        nes: {
            url: 'https://github.com/hapijs/nes',
            description: 'WebSocket adapter plugin for hapi routes'
        },
        qs: {
            url: 'https://github.com/hapijs/qs',
            description: 'A querystring parser with support for arrays and objects'
        },
        rejoice: {
            url: 'https://github.com/hapijs/rejoice',
            description: 'hapi.js cli'
        },
        shot: {
            url: 'https://github.com/hapijs/shot',
            description: 'Injects a fake HTTP request/response into your node server logic'
        },
        tarm: {
            url: 'https://github.com/kanongil/tarm',
            description: 'Add tarmount handler for serving tar file contents'
        },
        topo: {
            url: 'https://github.com/hapijs/topo',
            description: 'Topological sorting with grouping support'
        },
        vision: {
            url: 'https://github.com/hapijs/vision',
            description: 'Templates rendering support'
        },
        wreck: {
            url: 'https://github.com/hapijs/wreck',
            description: 'HTTP Client utilities'
        }
    }
};
