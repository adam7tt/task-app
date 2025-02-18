const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated


test('Should login existing user', async () => {
    const response = await request(app)
    .post('/users/login')
    .send({
        email: userOne.email,
        password: userOne.password,     
    })
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should not login nonexistant user', async () => {
    await request(app)
    .post('/users/login').send({
        email: 'notarealemail@bad.com',
        password: 'fakepassword1234'  
    })
    .expect(404)
})

test('Should sign up a new user', async () => {
    const response = await request(app)
    .post('/users')
    .send({
        name: 'Buzz Lightyear',
        email: 'infinityandbeyond@gmail.com',
        password: 'starcommand1234'
    })
    .expect(201)
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    expect(response.body).toMatchObject({
        user: {
            name: 'Buzz Lightyear',
            email: 'infinityandbeyond@gmail.com',
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('starcommand1234')
})

test('Should get profile for user', async() => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should get profile for unauthenticated user', async() => {
    await request(app).get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Jess'
    })
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Jess')
})

test('Should not update invalid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Los Angeles'
    })
    .expect(400)    
})