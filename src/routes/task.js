
const express = require('express')
const Tasks = require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/createTask',auth, async (req,res) => {
    const task = new Tasks(
        {
            ...req.body,
            owner: req.user._id,
        }
    );


    // task.save().then(() => {
    //     res.send(task)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })

    
    try{
        const response = await task.save();
        res.send(response)
    } catch(e) {
        res.status(400).send(e.errors.name.message)
    }
})


// get /task?completed=true

// limit
// GET /getTasks?limit=10?skip=0  //first 1-10 result
// GET /getTasks?limit=10?skip=10  //second 10-20 result
// Get /getTasks?sortBy=createdAt:desc
// Get /getTasks?sortBy=completed:desc
// 1 =asce && -1= desc
router.get('/getTasks',auth, async (req,res) => {
    // Tasks.find({}).then((sucess) => {
    //     res.send(sucess)
    // }).catch((e)=>{
    //     res.status(500).res(e)
    // }) 

    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true' ? true : false;
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try{
        // const response = await Tasks.find({owner: req.user._id});
        await req.user.populate({
            path: 'tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                // sort:{
                //     createdAt: -1
                // }
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send(e)
    }
})


router.get('/getTask/:me',auth,async (req,res) => {
    // Tasks.findById(req.params.me).then((sucess) => {
    //     res.send(sucess)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })

    try{
        // const response = await Tasks.findById(req.params.me);

        const response = await Tasks.findOne({_id : req.params.me, owner: req.user._id})
        if(!response) {
            res.status(404).send('not found');
        }
        res.send(response);
    } catch(e) {
        res.status(500).send(e.errors.name.message)
    }
})


router.patch('/updateTask/:id', async(req,res) => {
    const updates = Object.keys(req.body);
    const allowUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(404).send({'error': 'invalid update'})
    }

    try {
        // const user = await Tasks.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        const user = await Tasks.findById(req.params.id);

        updates.forEach((update) => user[update] = req.body[update]);

        await user.save();
        

        if(!user) {
            res.status(404).send()
        }
        res.send(user);
    } catch(e) {
        res.status(400).send(e)
    }
})




router.delete('/deleteTask/:id', async (req,res) => {

    try {
        const task = await Tasks.findByIdAndDelete(req.params.id);
        if(!task) {
            res.status(404).send({error: 'Not-Found'})
        }
        res.send(task);
    } catch(e) {
        res.status(400).send(e);
    }
})


module.exports = router;