// import graphqlHTTP from 'express-graphql';

// import { createServer } from 'http';
// import { execute, subscribe } from 'graphql';
// import { SubscriptionServer } from 'subscriptions-transport-ws';
// import { graphiqlExpress, graphqlExpress } from 'graphql-server-express';

// import schema from './schema';

// const WS_GQL_PATH = '/graphql';

// const app = express();
// const server = createServer(app);
// const ws = new SubscriptionServer(
//   { schema, execute, subscribe },
//   { server, path: WS_GQL_PATH },
// );

// app.use(
//   '/graphql',
//   graphqlHTTP({
//     schema,
//     graphiql: true,
//   }),
// );

// server.listen(4000);
// console.log('Running a GraphQL API server at localhost:4000/graphql');

import { makeExecutableSchema } from 'graphql-tools';
import { PubSub } from 'graphql-subscriptions';

import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
// const { createServer } = require('http');
// const { execute, subscribe } = require('graphql');
import { SubscriptionServer } from 'subscriptions-transport-ws';

const pubsub = new PubSub();

const schema = makeExecutableSchema({
  typeDefs: `
    type Query {
      now: String
    }
    type Subscription {
      now: String
    }
    schema {
      query: Query
      subscription: Subscription
    }
  `,
  resolvers: {
    Query: {
      now: () => new Date().toString(),
    },
    Subscription: {
      now: {
        subscribe: () => pubsub.asyncIterator('now'),
      },
    },
  },
});

const timer = setInterval(() => {
  const now = new Date().toString();
  console.log(now);
  pubsub.publish('now', { now });
}, 1000);

const PORT = 4000;
const app = express();
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.use(
  '/graphiql',
  bodyParser.json(),
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
    graphiql: true,
  }),
);

const server = createServer(app);
server.listen(PORT, () => {
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server,
      path: '/subscriptions',
    },
  );
});
