const mongoose = require('mongoose');
const Product = require('./models').Product;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/scentify', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    seedProducts();
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Initial products data
const products = [
    // Men's Fragrances
    {
        name: 'Royal Oud',
        price: 999.99,
        category: "mens",
        image: 'assets/images/royal-oud.jpg',
        images: [
            'assets/images/royal-oud.jpg',
            'assets/images/royal-oud-2.jpg',
            'assets/images/royal-oud-3.jpeg'
        ],
        description: 'A rich and luxurious oriental fragrance that combines rare oud wood with exotic spices.',
        rating: 4.8,
        reviews: 128,
        specs: {
            'Fragrance Family': 'Oriental Woody',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    {
        name: 'Versace Eros',
        price: 799.99,
        category: "mens",
        image: 'assets/images/versace-eros.jpg',
        images: [
            'assets/images/versace-eros.jpg',
            'assets/images/versace-eros-2.jpg',
            'assets/images/versace-eros-3.jpg'
        ],
        description: 'A fresh and sensual fragrance with mint, green apple, and vanilla notes.',
        rating: 4.6,
        reviews: 312,
        specs: {
            'Fragrance Family': 'Aromatic Fougere',
            'Concentration': 'Eau de Toilette',
            'Size': '100ml'
        }
    },
    {
        name: 'Amber Wood',
        price: 899.99,
        category: "mens",
        image: 'assets/images/amber-wood.png',
        images: [
            'assets/images/amber-wood.jpg',
            'assets/images/amber-wood-2.jpg',
            'assets/images/amber-wood-3.jpg'
        ],
        description: 'A warm and woody fragrance with amber notes that creates a sophisticated aura.',
        rating: 4.7,
        reviews: 95,
        specs: {
            'Fragrance Family': 'Woody Oriental',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    {
        name: 'Dior Sauvage',
        price: 899.99,
        category: "mens",
        image: 'assets/images/dior-sauvage.jpg',
        images: [
            'assets/images/dior-sauvage.jpg',
            'assets/images/dior-sauvage-2.jpg',
            'assets/images/dior-sauvage-3.jpg'
        ],
        description: 'A radically fresh composition with powerful woody notes.',
        rating: 4.8,
        reviews: 425,
        specs: {
            'Fragrance Family': 'Aromatic Fougere',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },

    // Women's Fragrances
    {
        name: 'Galatea',
        price: 899.99,
        category: "womens",
        image: 'assets/images/galatea.jpeg',
        images: [
            'assets/images/galatea.jpeg',
            'assets/images/galatea-2.jpeg',
            'assets/images/galatea-3.jpeg'
        ],
        description: 'An elegant floral fragrance with notes of jasmine, rose, and white musk.',
        rating: 4.7,
        reviews: 156,
        specs: {
            'Fragrance Family': 'Floral',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    {
        name: 'Vanilla Dreams',
        price: 799.99,
        category: "womens",
        image: 'assets/images/vanilla-dreams.jpg',
        images: [
            'assets/images/vanilla-dreams.jpg',
            'assets/images/vanilla-dreams-2.jpg',
            'assets/images/vanilla-dreams-3.jpg'
        ],
        description: 'A sweet and comforting vanilla-based fragrance with hints of warm amber and musk.',
        rating: 4.7,
        reviews: 112,
        specs: {
            'Fragrance Family': 'Oriental Vanilla',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    {
        name: 'Spring Blossom',
        price: 599.99,
        category: "womens",
        image: 'assets/images/spring-blossom.jpeg',
        images: [
            'assets/images/spring-blossom.jpg',
            'assets/images/spring-blossom-2.jpg',
            'assets/images/spring-blossom-3.jpg'
        ],
        description: 'A fresh and floral spring-inspired scent that captures the essence of blooming gardens.',
        rating: 4.5,
        reviews: 89,
        specs: {
            'Fragrance Family': 'Floral',
            'Concentration': 'Eau de Toilette',
            'Size': '100ml'
        }
    },
    {
        name: 'Chanel Coco Mademoiselle',
        price: 999.99,
        category: "womens",
        image: 'assets/images/chanel-coco.jpeg',
        images: [
            'assets/images/chanel-coco.jpeg',
            'assets/images/chanel-coco-2.jpeg',
            'assets/images/chanel-coco-3.jpeg'
        ],
        description: 'A modern oriental fragrance with a fresh and vibrant character.',
        rating: 4.9,
        reviews: 289,
        specs: {
            'Fragrance Family': 'Oriental',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },

    // Luxury Fragrances
    {
        name: 'Creed Aventus',
        price: 1299.99,
        category: "luxury",
        image: 'assets/images/creed-aventus.jpeg',
        images: [
            'assets/images/creed-aventus.jpeg',
            'assets/images/creed-aventus-2.jpeg',
            'assets/images/creed-aventus-3.jpeg'
        ],
        description: 'A bold and sophisticated fragrance with notes of pineapple, blackcurrant, and birch.',
        rating: 4.9,
        reviews: 245,
        specs: {
            'Fragrance Family': 'Fruity Woody',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    {
        name: 'Kingdom',
        price: 1099.99,
        category: "luxury",
        image: 'assets/images/kingdom.jpg',
        images: [
            'assets/images/kingdom.jpg',
            'assets/images/kingdom-2.jpg',
            'assets/images/kingdom-3.jpg'
        ],
        description: 'A regal oriental fragrance with notes of amber, oud, and precious woods.',
        rating: 4.8,
        reviews: 189,
        specs: {
            'Fragrance Family': 'Oriental Woody',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    {
        name: 'Tom Ford Tobacco Vanille',
        price: 1199.99,
        category: "luxury",
        image: 'assets/images/tobacco-vanille.jpg',
        images: [
            'assets/images/tobacco-vanille.jpg',
            'assets/images/tobacco-vanille-2.jpg',
            'assets/images/tobacco-vanille-3.jpg'
        ],
        description: 'A modern take on an old-world men\'s club with a smooth oriental base.',
        rating: 4.9,
        reviews: 278,
        specs: {
            'Fragrance Family': 'Oriental',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    },
    {
        name: 'Baccarat Rouge 540',
        price: 1499.99,
        category: "luxury",
        image: 'assets/images/baccarat-rouge.jpeg',
        images: [
            'assets/images/baccarat-rouge.jpeg',
            'assets/images/baccarat-rouge-2.jpeg',
            'assets/images/baccarat-rouge-3.jpeg'
        ],
        description: 'A unique and sophisticated fragrance with notes of saffron, ambergris, and cedar.',
        rating: 4.9,
        reviews: 198,
        specs: {
            'Fragrance Family': 'Oriental',
            'Concentration': 'Eau de Parfum',
            'Size': '100ml'
        }
    }
];

async function seedProducts() {
    try {
        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        const insertedProducts = await Product.insertMany(products);
        console.log(`Successfully seeded ${insertedProducts.length} products`);

        // Close the database connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding products:', error);
        mongoose.connection.close();
    }
} 