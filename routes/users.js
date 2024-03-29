var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');


var router = express.Router();
router.use(bodyParser.json());


router.options('*', cors.corsWithOptions, (req,res) => {
  res.sendStatus(200);
});
/* GET users listing. */
router.get('/',cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
  .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));    
});



router.post('/signup', cors.corsWithOptions, function(req,res,next){
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
      if(err){
        res.statusCode = 500;
        res.setHeader('Content-type','application/json');
        res.json({err:err})

      }else{
        if(req.body.firstname)
          user.firstname = req.body.firstname;
        
        if(req.body.lastname)
          user.lastname = req.body.lastname;
        
        user.save((err,user) => {
          if(err){
            res.statusCode = 500;
            res.setHeader('Content-type','application/json');
            res.json({err:err});
            return;
          }
          passport.authenticate('local')(req,res,() => {
            res.statusCode = 200;
            res.setHeader('Content-type','application/json');
            res.json({success: true, status: 'Registration successful'});
          });
        });
      }
    })
  });

router.post('/login', cors.corsWithOptions,(req, res, next) => {

  passport.authenticate('local', (err, user, info)=> {
    if(err) return next(err);

    if(!user){
      res.statusCode = 401;
      res.setHeader('Content-type','application/json');
      res.json({success: false, status: 'Login Unsuccessful' , err: info});
    }
    req.logIn(user, (err) => {
      if(err){
        res.statusCode = 401;
        res.setHeader('Content-type','application/json');
        res.json({success: false, status: 'Login Unsuccessful' , err: 'Could not log in user'});
      }
      var token = authenticate.getToken({_id : req.user._id, admin : req.user.admin});
      res.statusCode = 200;
      res.setHeader('Content-type','application/json');
      res.json({success: true, status: 'You are successfully logged in', token: token});
    })

    
  }) (req, res, next);
 
  
})

router.get('/logout', cors.corsWithOptions,  (req,res) => {
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }else{
    var err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
})

router.delete('/deleteAll',cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    User.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
})

router.get('/facebook/token', passport.authenticate('facebook-token'), (req,res) => {
  if(req.user){
    
    var token = authenticate.getToken({_id : req.user._id, admin : req.user.admin});
    res.statusCode = 200;
    res.setHeader('Content-type','application/json');
    res.json({success: true, status: 'You are successfully logged in', token: token});
    
  }
})


router.get('/checkJWTToken', cors.corsWithOptions, (req,res) => {
  passport.authenticate('jwt', {session: false}, (err,user,info) => {
    if (err) return next(err);
    if(!user){
      res.statusCode = 401;
      res.setHeader('Content-type', 'application/json');
      return res.json({status: 'JWT invalid',success: false, err: info} )
    }else{
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      return res.json({status: 'JWT valid',success: true, user: user} )
    }
  }) (req,res);
})

module.exports = router;
