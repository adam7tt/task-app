const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth')
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp')


const upload = multer({
    limit: 1000000,
    fileFilter(req, file, cb){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return (cb(new Error('please upload an image')))
        }
        cb(undefined, true)
        }
})

//Allow an authenticated user to created a new task
//The method to allow for task creation including an image has to have a better method than I've implemented
//I could do a  route to .post('/tasks/image) that handles the same logic in task but with just an image added? 
router.post('/tasks', auth, upload.single('task-image'), async (req, res) => {
    //if there is no file attatched req.file will not exist, good to know
    let buffer = ''
    if (req.file && req.file.fieldname === 'task-image') {
        buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
    } else {
        buffer = ''
    }

    const task = new Task({
        ...req.body,
        image: buffer,
        owner: req.user._id
    });

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
});

//Alow an authenticated user to get all of their tasks and filter and/or paginate
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt_desc 
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//Allow authenticated user to get one of their tasks
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })
        if (!task) {
            return res.sendStatus(404);
        }
        res.status(200).send(task);
    } catch (e) {
        res.sendStatus(500)
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    });
    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid field in body'
        })
    }

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        })

        if (!task) {
            return res.sendStatus(404)
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        if (!task) {
            return res.sendStatus(400)
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
});

//Added route to handle updating a tasks images 
router.patch('/tasks/:id/image', auth,  upload.single('task-image'), async (req, res) => {
    let buffer = ''
    if (req.file && req.file.fieldname === 'task-image') {
        buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
    } else {
        buffer = ''
    }
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        })

        if (!task) {
            return res.sendStatus(404)
        }
        task.image = buffer
        await task.save()
        if (!task) {
            return res.sendStatus(400)
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        })
        if (!task) {
            return res.sendStatus(404)
        }
        res.send(task)
    } catch (e) {
        res.sendStatus(500);
    }
});

module.exports = router;