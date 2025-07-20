import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Author from './models/authorModel.js'
import Book from './models/bookModel.js'
import User from './models/userModel.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.set('strictQuery', false)

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        })
        console.log('connected to MongoDB')
    } catch (error) {
        console.log('error connecting to MongoDB:', error.message)
        process.exit(1)
    }
}

const seedDatabase = async () => {
    try {
        await connectDB()

        // Clear existing data
        console.log('Clearing existing data...')
        await User.deleteMany({})
        await Author.deleteMany({})
        await Book.deleteMany({})
        console.log('Existing data cleared')

        // Create test user with favorite genre
        console.log('Creating test user...')
        const testUser = new User({
            username: 'testuser',
            password: 'password',
            favoriteGenre: 'refactoring'
        })
        await testUser.save()
        console.log('Test user created with username: testuser, password: password, favorite genre: refactoring')

        // Create authors
        console.log('Creating authors...')
        const authors = [
            { name: 'Robert Martin', born: 1952 },
            { name: 'Martin Fowler', born: 1963 },
            { name: 'Fyodor Dostoevsky', born: 1821 },
            { name: 'Joshua Kerievsky' },
            { name: 'Sandi Metz' },
        ]

        const savedAuthors = await Author.insertMany(authors)
        console.log(`Created ${savedAuthors.length} authors`)

        // Create books
        console.log('Creating books...')
        const books = [
            {
                title: 'Clean Code',
                published: 2008,
                author: savedAuthors.find(a => a.name === 'Robert Martin')._id,
                genres: ['refactoring']
            },
            {
                title: 'Agile software development',
                published: 2002,
                author: savedAuthors.find(a => a.name === 'Robert Martin')._id,
                genres: ['agile', 'patterns', 'design']
            },
            {
                title: 'Refactoring, edition 2',
                published: 2018,
                author: savedAuthors.find(a => a.name === 'Martin Fowler')._id,
                genres: ['refactoring']
            },
            {
                title: 'Refactoring to patterns',
                published: 2008,
                author: savedAuthors.find(a => a.name === 'Joshua Kerievsky')._id,
                genres: ['refactoring', 'patterns']
            },
            {
                title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
                published: 2012,
                author: savedAuthors.find(a => a.name === 'Sandi Metz')._id,
                genres: ['refactoring', 'design']
            },
            {
                title: 'Crime and punishment',
                published: 1866,
                author: savedAuthors.find(a => a.name === 'Fyodor Dostoevsky')._id,
                genres: ['classic', 'crime']
            },
            {
                title: 'Demons',
                published: 1872,
                author: savedAuthors.find(a => a.name === 'Fyodor Dostoevsky')._id,
                genres: ['classic', 'revolution']
            },
        ]

        const createdBooks = await Book.insertMany(books)
        console.log(`Created ${createdBooks.length} books`)

        console.log('Seed data created successfully!')

    } catch (error) {
        console.error('Error seeding database:', error)
    } finally {
        mongoose.connection.close()
        console.log('Database connection closed')
    }
}

seedDatabase()