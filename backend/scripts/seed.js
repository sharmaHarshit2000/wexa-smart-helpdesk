const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Article = require('../models/Article');
const Ticket = require('../models/Ticket');
const Config = require('../models/Config'); 

require('dotenv').config({ path: '../.env' });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Article.deleteMany();
    await Ticket.deleteMany();
    await Config.deleteMany();

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Support Agent',
        email: 'agent@example.com',
        password: hashedPassword,
        role: 'agent'
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user'
      }
    ]);

    // Create KB articles
    const articles = await Article.create([
      {
        title: 'Login Troubleshooting',
        body: 'If you cannot login, try clearing browser cache or resetting password. Error 500 usually indicates server-side issues.',
        tags: ['login', 'error', 'technical'],
        status: 'published'
      },
      {
        title: 'Shipping Policy',
        body: 'Standard shipping takes 3-5 business days. Express shipping available for additional fee. International shipping may take 7-14 days.',
        tags: ['shipping', 'delivery', 'policy'],
        status: 'published'
      },
      {
        title: 'Refund Process',
        body: 'Refunds are processed within 5-7 business days. Please provide your order number and reason for refund request.',
        tags: ['refund', 'billing', 'payment'],
        status: 'published'
      }
    ]);

    // Create configuration
    await Config.create({
      confidenceThreshold: 0.78,
      stubMode: true
    });

    console.log('✅ Seed data created successfully!');
    console.log('👤 Users created:');
    console.log('   Admin: admin@example.com / password123');
    console.log('   Agent: agent@example.com / password123');
    console.log('   User: user@example.com / password123');
    console.log('📚 KB Articles: 3 articles created');
    console.log('⚙️  Configuration: Default settings applied');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;