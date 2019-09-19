const express = require('express');
const app = express();
const db = require('./db');
const { User, Story, Review } = db.models;

app.get('/api/users', async(req, res, next) => {
    try {
        res.send(await User.findAll());
    }
    catch(ex){
      next(ex);
    }
});

const port = process.env.PORT || 3000;
db.syncAndSeed()
  .then(() => {
     app.listen(port, ()=> console.log(`listening on port ${port}`));
  });