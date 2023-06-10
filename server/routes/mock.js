let mongoose = require('mongoose');
const User = require("../models/user");

async function mockUsers() {
    let user = 
        [ 
            {email : 'stephenhitchy@yahoo.com', password : '123', permissions : 'admin', enabled : true},
            {email : 'hannah@uwlax.edu', password : '123', permissions : 'admin', enabled : true},
            {email : 'fakeUser@gmail.com', password : '123', permissions : 'user', enabled : true},
            {email : 'admin', password : '123', permissions: 'admin', enabled : true},
            {email : 'user', password : '123', permissions : 'user', enabled : true}
        ];

        await User.insertMany(user);
}

async function mockData() {
    await mongoose.connection.dropDatabase();

    await mockUsers();
}

module.exports = mockData;