const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mysql = require('mysql');

const mahasiswaModel = require('./models').user

// get config vars
dotenv.config();

const app = express()
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

const port = 3000

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
    host: 'db4free.net',
    user: 'anonymous3',
    password: 'abdurrahman', // Ganti dengan password MySQL Anda
    database: 'skilvul3' // Ganti dengan nama database yang telah Anda buat
  });

    // Koneksi ke database MySQL
db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log('Connected to MySQL database');
  });

  let checkUser = (req, res, next) => {
    let response = {}
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) {
        response = {
            status: "ERROR",
            message: "Authorization Failed"
        }
        res.status(401).json(response)
        return
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
        console.log(error)
        if (error) {
            response = {
                status: "ERROR",
                message: error
            }
            res.status(401).json(response)
            return
        }
        req.user = user
        next()
  })
}
app.use(express.json());

// Menampilkan semua data mahasiswa 
app.get('/mahasiswa', (req, res) => {
    const sql = 'SELECT * FROM mahasiswa';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error saat menjalankan kueri: ' + err);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
      } else {
        res.json(results);
      }
    });
  });
  
  // Menampilkan semua data fakultas 
app.get('/fakultas', (req, res) => {
    const sql = 'SELECT * FROM fakultas';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error saat menjalankan kueri: ' + err);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
      } else {
        res.json(results);
      }
    });
  });

  // Menampilkan data mahasiswa berdasarkan id 
app.get('/mahasiswa/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM mahasiswa WHERE id = ?';
    db.query(sql, id,(err, results) => {
      if (err) {
        console.error('Error saat menjalankan kueri: ' + err);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
      } else {
        res.json(results);
      }
    });
  });

// menambah data mahasiswa
app.post('/mahasiswa', (req, res) => {
    const { nama, nim, prodi, createdAt, updatedAt} = req.body;
    const sql = 'INSERT INTO mahasiswa (nama, nim, prodi, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nama, nim, prodi, createdAt, updatedAt], (err, results) => {
      if (err) {
        console.error('Error saat menjalankan kueri: ' + err);
        res.status(500).send('Terjadi kesalahan saat menyimpan data');
      } else {
        res.status(200).send('Data berhasil disimpan');
      }
    });
  });

  // Endpoint untuk memperbarui data
app.put('/mahasiswa/:id', (req, res) => {
    const { id } = req.params;
    const { nama, nim, prodi, createdAt, updatedAt } = req.body;
    const sql = 'UPDATE mahasiswa SET nama = ?, nim = ?, prodi = ?, createdAt = ?, updatedAt = ? WHERE id = ?';
    db.query(sql, [nama, nim, prodi, createdAt, updatedAt, id], (err, results) => {
      if (err) {
        console.error('Error saat menjalankan kueri: ' + err);
        res.status(500).send('Terjadi kesalahan saat memperbarui data');
      } else if (results.affectedRows === 0) {
        res.status(404).send('Data tidak ditemukan');
      } else {
        res.status(200).send('Data berhasil diperbarui');
      }
    });
  });

  // Endpoint untuk menghapus data pada tabel
app.delete('/mahasiswa/:id', (req, res) => {
    const dataId = req.params.id;
  
    // Query untuk menghapus data berdasarkan ID
    const deleteDataQuery = 'DELETE FROM mahasiswa WHERE id = ?';
    db.query(deleteDataQuery, [dataId], (err, results) => {
      if (err) {
        console.error('Error saat menjalankan kueri: ' + err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat menghapus data' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Data tidak ditemukan' });
      }
  
      return res.status(200).json({ message: 'Data berhasil dihapus' });
    });
  });

// Endpoint untuk menghapus semua data pada tabel
app.delete('/mahasiswaAll', (req, res) => {
    // Query untuk menghapus semua data pada tabel
    const deleteAllDataQuery = 'DELETE FROM mahasiswa';
    db.query(deleteAllDataQuery, (err, results) => {
      if (err) {
        console.error('Error saat menjalankan kueri: ' + err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat menghapus semua data' });
      }
  
      return res.status(200).json({ message: 'Semua data berhasil dihapus' });
    });
  });

 // Endpoint untuk registrasi pengguna baru
app.post('/register', (req, res) => {
    const { username, password } = req.body;
   
    // Validasi data yang diperlukan
    if (!username || !password) {
      return res.status(400).json({ error: 'Mohon isi semua field yang diperlukan' });
    }
  
    // Hash password menggunakan bcrypt
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error saat menghash password: ' + err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat mendaftar pengguna' });
      }
  
      // Query untuk memeriksa apakah username sudah digunakan
      const checkUsernameQuery = 'SELECT * FROM users WHERE username = ?';
      db.query(checkUsernameQuery, [username], (err, results) => {
        if (err) {
          console.error('Error saat menjalankan kueri: ' + err);
          return res.status(500).json({ error: 'Terjadi kesalahan saat mendaftar pengguna' });
        }
  
        if (results.length > 0) {
          return res.status(400).json({ error: 'Username sudah digunakan' });
        }
  
        // Query untuk menyimpan pengguna baru
        const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(insertUserQuery, [username, hashedPassword], (err, results) => {
          if (err) {
            console.error('Error saat menjalankan kueri: ' + err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat mendaftar pengguna' });
          }
  
          const newUser = { id: results.insertId, username };
          return res.status(201).json({ message: 'Registrasi berhasil', user: newUser });
        });
      });
    });
  });
  
  // Endpoint untuk login pengguna
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Validasi data yang diperlukan
    if (!username || !password) {
      return res.status(400).json({ error: 'Mohon isi semua field yang diperlukan' });
    }
  
    // Query untuk mencari pengguna berdasarkan username
    const findUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(findUserQuery, [username], (err, results) => {
      if (err) {
        console.error('Error saat menjalankan kueri: ' + err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat login pengguna' });
      }
  
      // Cek apakah pengguna ditemukan
      if (results.length === 0) {
        return res.status(401).json({ error: 'Username atau password salah' });
      }
  
      const user = results[0];
  
      // Membandingkan password yang diinput dengan password yang disimpan (menggunakan bcrypt)
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error saat memverifikasi password: ' + err);
          return res.status(500).json({ error: 'Terjadi kesalahan saat login pengguna' });
        }
  
        if (!isMatch) {
          return res.status(401).json({ error: 'Username atau password salah' });
        }
  
        // Membuat token JWT untuk autentikasi
        const token = jwt.sign({ userId: user.id }, 'secret_key');
        return res.status(200).json({ message: 'Login berhasil', token });
      });
    });
  });
  
  // Middleware untuk autentikasi token
  const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ error: 'Token tidak tersedia' });
    }
  
    jwt.verify(token, 'secret_key', (err, decoded) => {
      if (err) {
        console.error('Error saat memverifikasi token: ' + err);
        return res.status(403).json({ error: 'Token tidak valid' });
      }
  
      req.userId = decoded.userId;
      next();
    });
  };
  
  // Contoh endpoint yang membutuhkan autentikasi
  app.get('/protected', authenticateToken, (req, res) => {
    const sql = 'SELECT username FROM users';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error saat menjalankan kueri: ' + err);
        res.status(500).send('Terjadi kesalahan saat mengambil data');
      } else {
        res.json(results);
      }
    });
  });
  

app.listen(port, () => {
    console.log(`This Application Run on Port : ${port}`)
})
