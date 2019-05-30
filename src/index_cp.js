import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';
import redis from 'redis';
import fetch from 'node-fetch';

const client = redis.createClient();

client.on('error', (err) => {
  console.log('Something went wrong ', err);
});

const schema = buildSchema(`
  type Query {
    humans(name: String!): [Human]!
    boy(id: ID!): Boy!
    girl(id: ID!): Girl!
  }

  interface Human{
    id: ID!
    name: String!
    age: Int
  }
  
  type Girl implements Human {
    id: ID!
    name: String!
    age: Int
    boyFriend: Boy!
  }

  type Boy implements Human {
    id: ID!
    name: String!
    age: Int
    girlFriend: Girl!
  }

`);

// function logggingMiddleWare(req, res, next) {
//   console.log('ip:', req.ip);
//   next();
// }

// function queryUserById() {
//   return { name: 'GOOD' };
// }

// function queryTest(id) {
//   return `hi this is id ${id}`;
// }

// function setMessage({ key, message }) {
//   return setMessageToRedis(key, message);
// }

// function setObject(args) {
//   const {
//     key, content, commentNumber, title,
//   } = args.input;

//   const obj = {
//     content,
//     commentNumber,
//     title,
//   };

//   return setObjToRedis(key, obj);
// }

// function getMessage({ key }) {
//   return getValueFromRedis(key, null);
// }

const girls = [
  {
    id: 0,
    age: 25,
    name: 'g1',
  },
  {
    id: 1,
    age: 20,
    name: 'g2',
  },
];

const boys = [
  {
    id: 0,
    age: 25,
    name: 'b1',
    girlFriend: girls[1],
  },
  {
    id: 1,
    age: 20,
    name: 'b2',
    girlFriend: girls[0],
  },
  {
    id: 2,
    age: 20,
    name: 'b2',
    girlFriend: girls[0],
  },
];

// console.log(boys[0]);
// const posts = id => ({ id, author: boys[0] });
const filterHuman = name => [].concat(girls).concat(boys).filter(x => x.name.includes(name));
console.log(filterHuman('g'));
// root 提供所有 API 入口端点相应的解析器函数
const root = {
  boy: args => boys[args.id],
  humans: args => filterHuman(args.name),
  girl: args => girls[args.id],
  // post: args => posts(args.id),
};

// async function setMessageToRedis(key, value) {
//   const setMsg = new Promise((resolve, reject) => {
//     client.set(key, value, (err, reply) => {
//       resolve(value);
//     });
//   });
//   const setedValue = await setMsg;
//   return setedValue;
// }

// async function setObjToRedis(key, obj) {
//   const value = JSON.stringify(obj);
//   const setMsg = new Promise((resolve, reject) => {
//     client.set(key, value, (err, reply) => {
//       resolve(value);
//     });
//   });
//   const setedValue = await setMsg;
//   return JSON.parse(setedValue);
// }

// async function getObjToRedis(key) {
//   const getValue = new Promise((resolve, reject) => {
//     client.get(key, (err, reply) => {
//       resolve(reply);
//     });
//   });
//   const val = await getValue;
//   return JSON.parse(val);
// }

// async function getValueFromRedis(key, value) {
//   const getValue = new Promise((resolve, reject) => {
//     client.get(key, (err, reply) => {
//       resolve(reply);
//     });
//   });
//   const val = await getValue;
//   return val;
// }

const app = express();
// app.use(logggingMiddleWare);
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  }),
);

app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
