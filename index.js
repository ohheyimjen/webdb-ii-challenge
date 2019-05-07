const express = require('express');
const helmet = require('helmet');

// bring knex in 
const knex = require('knex');

const server = express();

server.use(express.json());
server.use(helmet());

// Build knex config file
const knexConfig = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './data/lambda.sqlite3'
  }
}

// Pass in new knexConfig file into the new database variable
const db = knex(knexConfig);

// endpoints here
server.get('/api/zoos', (req, res) => {
  db('zoos')
    .then(zoos => {
      res.status(200).json(zoos)
    })
    .catch(error => {
      res.status(500).json(error)
    })
});


server.get('/api/zoos/:id', (req, res) => {
  db('zoos')
    .where({ id: req.params.id })
    .first()
    .then(zoo => {
      if(zoo) {
        res.status(200).json(zoo);
      } else {
        res.status(404).json({ message: 'Zoo id not found...and we aren\'t LION!' });
      }
    })
    .catch(error => {
      res.status(500).json(error)
    })
  });


server.post('/api/zoos', (req, res) => {
  db('zoos')
    .insert(req.body)
    .then(zoo => {
      const [id] = zoo;

      db('zoos')
        .where({ id })
        .first()
        .then(zoo => {
          res.status(200).json(zoo)
        })
    })
    .catch(error => {
      res.status(500).json(error)
    })
});


server.delete('/api/zoos/:id', (req, res) => {
  db('zoos')
    .where({ id: req.params.id })
    .del()
    .then(count => {
      if(count > 0) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: 'Zoo id not found...and we aren\'t LION!' }); 
      }
    })
    .catch(error => {
      res.status(500).json(error);
    })
});



server.put('/api/zoos/:id', (req, res) => {
  db('zoos')
    .where({ id: req.params.id })
    .update(req.body)
    .then(count => {
      if(count > 0) {
        db('zoos')
          .where({ id: req.params.id })
          .first()
          .then(zoo => {
            res.status(200).json(zoo)
          })
        } else {
          res.status(404).json({ message: 'Zoo id not found...and we aren\'t LION!' })
      }
    })
    .catch(error => {
      res.status(500).json(error)
    }) 
});



const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});

module.exports = server;