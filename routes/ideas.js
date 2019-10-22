const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

//Load Helpers
const { ensureAuthenticated } = require('../helpers/auth.js');

// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Idea Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({ user: req.user.id })
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      });
    });
});

// Add Idea Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      if (idea.user != req.user.id) {
        req.flash('error_msg', 'Not Authorised');
        res.redirect('/ideas');
      } else {
        res.render('ideas/edit', {
          idea: idea
        });
      }
    });
});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: 'Please add a title' });
  }
  if (!req.body.idea) {
    errors.push({ text: 'Please add some idea' });
  }

  if (errors.length > 0) {
    res.render('/add', {
      errors: errors,
      title: req.body.title,
      idea: req.body.idea,
    });
  } else {
    const newUser = {
      title: req.body.title,
      idea: req.body.idea,
      user: req.user.id
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Idea added');
        res.redirect('/ideas');
      })
  }
});

// Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      // new values
      idea.title = req.body.title;
      idea.idea = req.body.idea;

      idea.save()
        .then(idea => {
          req.flash('success_msg', 'Idea updated');
          res.redirect('/ideas');
        })
    });
});

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({ _id: req.params.id })
    .then(() => {
      req.flash('success_msg', 'Idea removed');
      res.redirect('/ideas');
    });
});

module.exports = router;