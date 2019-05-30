import express from 'express';
import graphqlHTTP from 'express-graphql';

import schema from './schema.js';


const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
);

app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
