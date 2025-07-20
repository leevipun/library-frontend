import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLError } from 'graphql'
import mongoose from 'mongoose'
import Author from './models/authorModel.js'
import Book from './models/bookModel.js'
import User from './models/userModel.js'

import dotenv from 'dotenv'
import userModel from './models/userModel.js'
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

// Configure mongoose with proper timeout settings
mongoose.set('strictQuery', false)
mongoose.set('bufferCommands', false)

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 10,
        })
        console.log('connected to MongoDB')
    } catch (error) {
        console.log('error connecting to MongoDB:', error.message)
        process.exit(1)
    }
}

await connectDB()

let authors = [
    {
        name: 'Robert Martin',
        id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
        born: 1952,
    },
    {
        name: 'Martin Fowler',
        id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
        born: 1963
    },
    {
        name: 'Fyodor Dostoevsky',
        id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
        born: 1821
    },
    {
        name: 'Joshua Kerievsky', // birthyear not known
        id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    },
    {
        name: 'Sandi Metz', // birthyear not known
        id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
*/

let books = [
    {
        title: 'Clean Code',
        published: 2008,
        author: 'Robert Martin',
        id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Agile software development',
        published: 2002,
        author: 'Robert Martin',
        id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
        genres: ['agile', 'patterns', 'design']
    },
    {
        title: 'Refactoring, edition 2',
        published: 2018,
        author: 'Martin Fowler',
        id: "afa5de00-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Refactoring to patterns',
        published: 2008,
        author: 'Joshua Kerievsky',
        id: "afa5de01-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'patterns']
    },
    {
        title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
        published: 2012,
        author: 'Sandi Metz',
        id: "afa5de02-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'design']
    },
    {
        title: 'Crime and punishment',
        published: 1866,
        author: 'Fyodor Dostoevsky',
        id: "afa5de03-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'crime']
    },
    {
        title: 'Demons',
        published: 1872,
        author: 'Fyodor Dostoevsky',
        id: "afa5de04-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'revolution']
    },
]

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `

    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }

    type Token {
        value: String!
    }

    type FavoriteGenre {
        genre: String!
    }

    type Book {
        title: String!
        published: Int!
        author: Author!
        genres: [String!]!
        id: ID!
    }

    type Author {
        name: String!
        born: Int
        bookCount: Int
        id: ID!
    }

    type Mutation {
        addBook(
            title: String!
            published: Int!
            author: String!
            genres: [String!]!
        ): Book!

        editAuthor(
            name: String!
            setBornTo: Int!
        ): Author
        createUser(
            username: String!
            favoriteGenre: String!
        ): User!
        login(
            username: String!
            password: String!
        ): Token
        setFavoriteGenre(
            genre: String!
        ): User
    }

    type Query {
        dummy: Int
        bookCount: Int
        authorCount: Int
        allBooks(author: String, genre: String): [Book]
        allAuthors: [Author]
        findPerson(name: String!): Author
        me: User
    }
`

const resolvers = {
    Query: {
        me: async (root, args, context) => {
            if (!context.currentUser) {
                return null;
            }
            return await User.findById(context.currentUser.id);
        },
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (_, args) => {
            let query = {};

            if (args.author) {
                const author = await Author.findOne({ name: args.author });
                if (author) {
                    query.author = author._id;
                }
            }

            if (args.genre) {
                query.genres = { $in: [args.genre] };
            }

            return await Book.find(query).populate('author');
        },
        allAuthors: async () => {
            return Author.find({});
        },
        findPerson: async (_, args) => {
            return Author.findOne({ name: args.name });
        }
    },
    Author: {
        bookCount: async (root) => {
            return await Book.countDocuments({ author: root._id });
        }
    },
    Book: {
        author: async (root) => {
            return await Author.findById(root.author);
        }
    },
    Mutation: {
        addBook: async (root, args) => {
            try {
                let author = await Author.findOne({ name: args.author });

                if (!author) {
                    author = new Author({ name: args.author });
                    try {
                        await author.save();
                    } catch (error) {
                        if (error.name === 'ValidationError') {
                            const messages = Object.values(error.errors).map(err => err.message);
                            throw new GraphQLError(`Author validation failed: ${messages.join(', ')}`, {
                                extensions: {
                                    code: 'BAD_USER_INPUT',
                                    invalidArgs: args.author,
                                }
                            });
                        }
                        throw error;
                    }
                }

                const book = new Book({
                    ...args,
                    author: author._id
                });

                return await book.save().then(savedBook => savedBook.populate('author'));
            } catch (error) {
                if (error.name === 'ValidationError') {
                    const messages = Object.values(error.errors).map(err => err.message);
                    throw new GraphQLError(`Book validation failed: ${messages.join(', ')}`, {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args,
                        }
                    });
                }
                throw error;
            }
        },

        editAuthor: async (root, args) => {
            try {
                const author = await Author.findOneAndUpdate(
                    { name: args.name },
                    { born: args.setBornTo },
                    { new: true, runValidators: true }
                );

                if (!author) {
                    throw new GraphQLError('Author not found', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.name,
                        }
                    });
                }

                return author;
            } catch (error) {
                if (error.name === 'ValidationError') {
                    const messages = Object.values(error.errors).map(err => err.message);
                    throw new GraphQLError(`Author validation failed: ${messages.join(', ')}`, {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args,
                        }
                    });
                }
                throw error;
            }
        },
        login: async (root, args) => {
            const { username, password } = args;

            // Here you would typically validate the username and password against your user database
            // For simplicity, we are assuming a successful login with a static token
            if (username === 'testuser' && password === 'password') {
                return { value: 'dummy-token' }; // Replace with actual token generation logic
            }

            throw new GraphQLError('Invalid credentials', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                }
            });
        },
        createUser: async (root, args) => {
            const user = new userModel({ username: args.username, favoriteGenre: args.favoriteGenre });
            return await user.save();
        },
        setFavoriteGenre: async (root, args, context) => {
            if (!context.currentUser) {
                throw new GraphQLError('Not authenticated', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    }
                });
            }

            try {
                const updatedUser = await User.findByIdAndUpdate(
                    context.currentUser.id,
                    { favoriteGenre: args.genre },
                    { new: true, runValidators: true }
                );

                if (!updatedUser) {
                    throw new GraphQLError('User not found', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                        }
                    });
                }

                return updatedUser;
            } catch (error) {
                if (error.name === 'ValidationError') {
                    const messages = Object.values(error.errors).map(err => err.message);
                    throw new GraphQLError(`User validation failed: ${messages.join(', ')}`, {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args,
                        }
                    });
                }
                throw error;
            }
        }
    },
}


const server = new ApolloServer({
    typeDefs,
    resolvers,
})

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const token = auth.substring(7);
            // For simplicity, we'll use a dummy user for the token "dummy-token"
            if (token === 'dummy-token') {
                const currentUser = await User.findOne({ username: 'testuser' });
                return { currentUser };
            }
        }
        return {};
    }
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
})