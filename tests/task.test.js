const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOneId, userOne, userTwo, taskOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks

test('Should create task for user', async () => {
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `${userOne.tokens[0].token}`)
    .send({
        description: 'Make pancakes' 
    })
    .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should fetch all tasks for a given user', async () => {
    const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    expect(response.body).toHaveLength(2)
})

test('Should attempt and fail to allow a user to delete another user\'s task', async () => {
    const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set(`Authorization`, `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

