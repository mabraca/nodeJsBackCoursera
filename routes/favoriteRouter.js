const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) =>{
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        console.log(favorites);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(favorites == null){
            // If there's not any favorits in her/his list
            var fav = new Favorites()
            fav.user = req.user._id;
            fav.dishes = req.body;
            // Save the list
            fav.save().then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes').then( (favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
            }, (err) => next(err));
            
        }else{
            // If there're favorites in her/his list
            for(var i = 0; i < req.body.length; i++){
                var index = favorites.dishes.indexOf(req.body[i]._id);
                if(index == -1){
                    // If the element is not in the favorite list of the user
                    // Just add the element
                    favorites.dishes.push(req.body[i]);
                }
                
            }
            // Save the changes
            favorites.save().then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes').then( (favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
            }, (err) => next(err));
            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})




// favorites/:dishId

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) =>{
    res.sendStatus(200);
})

.get(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user: req.user._id}).then((favorites) => {
        if(!favorites){
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }else{
            if(favorites.dishes.indexOf(req.params.dishId) < 0 ){
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }else{
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        Favorites.findOne({user: req.user._id})
        .then((favorites) => {
            if(favorites == null){
                // If there's not any favorits in her/his list
                var fav = new Favorites()
                fav.user = req.user._id;
                fav.dishes = dish._id;
                // Save the list
                fav.save().then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes').then( (favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                }, (err) => next(err));
                
            }else{

                var index = favorites.dishes.indexOf(dish._id);
                if(index == -1){
                    // If the element is not in the favorite list of the user
                    // Just add the element
                    favorites.dishes.push(dish._id);
                }
                    
                // Save the changes
                favorites.save().then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes').then( (favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                }, (err) => next(err));
                
            }
        }, (err) => next(err))
        .catch((err) => next(err));

    }, (err) => next(err))
    .catch((err) => next(err));

    
})

.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    // First, I look for favorites of the user
    Favorites.findOne({user: req.user._id})
        .then((favorites) => {
            if(favorites != null){
                // I check if exists the element in the list of the user
                var index = favorites.dishes.indexOf(req.params.dishId);
                if( index != -1){
                    // If exist then I remove it from the list
                    favorites.dishes.splice(index, 1);
                }else{
                    // Another way, I throught error. 
                    err = new Error('Dish ' + req.params.dishId + ' not exits in your favorites');
                    err.status = 404;
                    return next(err);
                }
                // Save the changes
                favorites.save().then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes').then( (favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                }, (err) => next(err));
            }else{
                err = new Error('Dish ' + req.params.dishId + ' not exits in your favorites');
                err.status = 404;
                return next(err);
            }

        }, (err) => next(err))
        .catch((err) => next(err));
})

module.exports = favoriteRouter;