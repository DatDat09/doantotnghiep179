const { bcryptUtil } = require("../config/hash")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const CTDT = require('../models/ctdt')
const User = require('../models/user')
const Course = require("../models/course")
const Class = require("../models/class")
const ClassExam = require("../models/classExam")
const classExam = require("../models/classExam")


module.exports = {
    getMain: async (req, res) => {
        res.render('build/index.ejs', {
            user: req.user
        });
    },
    getMainStudent: async (req, res) => {
        res.render('build/student/index2.ejs', {
            user: req.user
        });
    },
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).populate('idCtdt').exec();

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Construct image path based on mssv and stored image filename
            const imagePath = user.image ? `/img/avt/${user.image}` : '/img/avt/default.jpg';

            res.render('build/pages/profile.ejs', {
                user: user,
                imagePath: imagePath
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    Login: async (req, res) => {
        res.render('build/pages/sign-in.ejs')
    },
    Logout: async (req, res) => {
        res.clearCookie('token');
        res.redirect('/');
    },
    loginUser: async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role,
            username: user.username,
            name: user.name,
            mssv: user.mssv,
            email: user.email,
            address: user.address,
            sex: user.sex,
            khoa: user.khoa,
            lop: user.lop,
            idCtdt: user.idCtdt
        }, 'namdv', { expiresIn: '3h' });

        res.cookie('token', token, { httpOnly: true });
        return res.status(200).json({ message: 'Login successful', token });
    },
}