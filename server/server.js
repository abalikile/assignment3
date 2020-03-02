 const fs = require('fs');
const express = require('express');
const {ApolloServer,UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const productsDB = [];

const GraphQLPrice = new GraphQLScalarType({
  name: 'GraphQLPrice',
  description: 'A Price type in GraphQL as a scalar',
  //serialize() will convert price value to string
  serialize(value) {
    return value.toString();
  },
  
  parseValue(value) {
    let first = value.replace(/[$]/g,'');
	return first;
  },
  
 parseLiteral(ast) {
    if (ast.kind == Kind.Float){
		let first = value.replace(/[$]/g,'');
		return first;
	}
  },
});

const resolvers = {
  Query: {
   productList,
  },
  Mutation: {
    productAdd,
  },
  GraphQLPrice,
};
function productList() {
  return productsDB;
}

function productValidate(product) {
  const errors = [];
  if (product.productname.length < 1) {
    errors.push('Field "productname" is mandatory.');
  }
   if(product.price){
	   //'Field "Price" cannot have alphabets. only two digits allowed after decimal places.'

		var regex = /^\s*-?[0-9]\d*(\.\d{1,2})?\s*$/;
		if(!regex.test(product.price)) {

		  errors.push('Field "Price" invalid.');
		 }
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

function productAdd(_, { product }) {
  productValidate(product);
  product.id = productsDB.length + 1;
  
  productsDB.push(product);
  return product;
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
   formatError: error => {
    console.log(error);
    return error;
  },
});


const app = express();

app.use(express.static('public'));
server.applyMiddleware({ app, path: '/graphql' });

app.listen(3000, function () {
  console.log('App started on port 3000');
});