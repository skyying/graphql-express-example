import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
} from 'graphql';

const books = [
  { name: 'clean code', id: 0, author_id: 0 },
  { name: 'Refactor', id: 1, author_id: 1 },
  { name: 'Refactor version2', id: 2, author_id: 1 },
  { name: 'b3', id: 3, author_id: 2 },
];

const authors = [
  {
    age: 23,
    name: 'Robert',
    id: 0,
    books: [0],
  },
  {
    age: 42,
    name: 'Martin',
    id: 1,
    books: [1, 2],
  },
  {
    age: 40,
    name: 'author3',
    id: 2,
    books: [3],
  },
];

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'abc',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        return authors[parent.author_id];
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return books.filter(book => parent.books.indexOf(book.id) >= 0);
      },
    },
  }),
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
      },
      resolve(parent, args) {
        const { name, age } = args;
        if (!name || !age) {
          throw Error;
        }
        const newAuthor = {
          id: authors.length,
          name,
          age,
          books: [],
        };
        authors.push(newAuthor);
        return authors[authors.length - 1];
      },
    },
  },
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return books[args.id];
      },
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return authors[args.id];
      },
    },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return books;
      },
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve(parent, args) {
        return authors;
      },
    },
  },
});

const schema = new GraphQLSchema({ query: RootQuery, mutation });
export default schema;
