const express = require('express')
const route = express.Router()
const { getHomePage, getIndex, getABC, getEpuseca, getCreatePage, postCreateUser, getUpdatePage, postUpdateUser, getDeleteUser, postHandleRemoveUser } = require('../controller/homeController')

route.get('/', getHomePage)


route.get('/abc', getABC)

route.get('/epuseca', getEpuseca)

route.get('/index', getIndex)


route.get('/create', getCreatePage)

route.post('/create-user', postCreateUser)

route.get('/update/:id', getUpdatePage)

route.post('/update-user', postUpdateUser)

route.get('/delete-user/:id', getDeleteUser)

route.post('/delete-user', postHandleRemoveUser)

module.exports = route;