import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Author from './models/authorModel.js'
import Book from './models/bookModel.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

// Authors data from backend.js
const authorsData = [
    {
        name: 'Robert Martin',
        born: 1952,
    },
    {
        name: 'Martin Fowler',
        born: 1963
    },
    {
        name: 'Fyodor Dostoevsky',
        born: 1821
    },
    {
        name: 'Joshua Kerievsky', // birthyear not known
    },
    {
        name: 'Sandi Metz', // birthyear not known
    },
]

// Books data from backend.js
const booksData = [
    {
        title: 'Clean Code',
        published: 2008,
        author: 'Robert Martin',
        genres: ['refactoring']
    },
    {
        title: 'Agile software development',
        published: 2002,
        author: 'Robert Martin',
        genres: ['agile', 'patterns', 'design']
    },
    {
        title: 'Refactoring, edition 2',
        published: 2018,
        author: 'Martin Fowler',
        genres: ['refactoring']
    },
    {
        title: 'Refactoring to patterns',
        published: 2008,
        author: 'Joshua Kerievsky',
        genres: ['refactoring', 'patterns']
    },
    {
        title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
        published: 2012,
        author: 'Sandi Metz',
        genres: ['refactoring', 'design']
    },
    {
        title: 'Crime and punishment',
        published: 1866,
        author: 'Fyodor Dostoevsky',
        genres: ['classic', 'crime']
    },
    {
        title: 'Demons',
        published: 1872,
        author: 'Fyodor Dostoevsky',
        genres: ['classic', 'revolution']
    },
]

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        })
        console.log('Connected to MongoDB')

        // Clear existing data
        console.log('Clearing existing data...')
        await Book.deleteMany({})
        await Author.deleteMany({})
        console.log('Existing data cleared')

        // Create authors first
        console.log('Creating authors...')
        const createdAuthors = await Author.insertMany(authorsData)
        console.log(`Created ${createdAuthors.length} authors`)

        // Create a mapping of author names to their ObjectIds
        const authorMap = {}
        createdAuthors.forEach(author => {
            authorMap[author.name] = author._id
        })

        // Create books with proper author references
        console.log('Creating books...')
        const booksWithAuthorIds = booksData.map(book => ({
            ...book,
            author: authorMap[book.author]
        }))

        const createdBooks = await Book.insertMany(booksWithAuthorIds)
        console.log(`Created ${createdBooks.length} books`)

        console.log('Database seeded successfully!')

    } catch (error) {
        console.error('Error seeding database:', error)
    } finally {
        await mongoose.connection.close()
        console.log('Database connection closed')
    }
}

seedDatabase()