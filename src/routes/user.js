const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail } = require('../emails/accounts')

const uploadFile = multer({
    // dest: 'images',
    limits: {
        // 1 mb = six zero
        fileSize : 1000000
    },
    // fileFilter(req, file, cb) {
    //     //regex101.com
    //     if(!file.originalname.match(/\.(doc|docx)$/)) {
    //         return cb(new Error('please upload docs'))
    //     }
    //     cb(undefined, true)
    // }
    fileFilter(req, file, cb) {
        //regex101.com
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('please upload jpg,ppeg,png only'))
        }
        cb(undefined, true)
    }
})


const router = new express.Router()

router.post('/login/user', async (req, res) => {

    try {
        // custom function used in models
        const user = await User.findUserByCredential(req.body.email, req.body.password);
        sendWelcomeEmail(user.email, user.name)
        console.log(user)
        const token = await user.generateToken();
        // console.log(user)
        res.send({
            user,
            token
        });
    } catch (e) {
        res.status(505).send(e);
    }


})


router.post('/createUser', async (req, res) => {
    const create = new User(req.body);
   
    try {

        const user = await create.save();
        sendWelcomeEmail(create.email, create.name)
        const token = await create.generateToken();
        res.send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }
})


router.post('/logout', auth , async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch(e) {
        res.status(500).send(e)
    }
})


router.post('/logoutAll', auth , async (req,res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch(e) {
        res.status(500).send(e)
    }
})


router.get('/getUsers/profile',auth, async (req, res) => {
    // User.find({}).then((sucess)=> {
    //     res.send(sucess)
    // }).catch((e)=> {
    //     res.status(500).send(e)
    // })

    try {
        // const response = await User.find({});

        const response = req.user;
        res.send(response)
    } catch (e) {
        res.status(500).send(e.errors.name.message)
    }
})


// router.get('/user/:id', async (req, res) => {
//     _id = req.params.id;
//     console.log('id', _id);
    

//     try {
//         const response = await User.findById(_id);
//         if (!response) {
//             throw new Error('No users for' + _id + 'id');
//         }
//         res.send(response)
//     } catch (e) {
//         res.status(500).send(e.errors.name.message)
//     }
// })



router.patch('/updateUser/me',auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(404).send({ 'error': 'invalid update' })
    }

    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        // here using alternative coz save method in middleware for password.
        // const user = await User.findById(req.user._id);
        // deleteing the alternative coz we get user from auth

        updates.forEach((update) => req.user[update] = req.body[update]);

        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e)
    }
})



router.delete('/deleteUser/me',auth, async (req, res) => {

    try {
        // const user = await User.findByIdAndDelete(req.user._id);
        await req.user.remove()
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
})


router.post('/users/me/avatar', auth , uploadFile.single('avatar'),async (req,res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save()
    res.status(200).send()
} ,(error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//because muler give us error in html format , thereforw use the second callback with four params set

router.post('/users/me/avatar', auth , uploadFile.single('avatar'),async (req,res) => {

    // use sharp module npm
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

    req.user.avatar = buffer;
    await req.user.save()
    res.status(200).send()
} ,(error, req, res, next) => {
    res.status(400).send({error: error.message})
})


router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send();
})

//get user profile url 
router.get('user/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', image/png)
        res.send(user.avatar)
    } catch {
        res.status(404).send()
    }
})




module.exports = router