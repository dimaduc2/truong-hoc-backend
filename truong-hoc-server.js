// đây là truong-hoc-server
const express = require('express');		    //phải mượn Express
const truongHocRoutes = express.Router();	    //tạo Router để nhận tất cả câu hỏi

const app = express();
app.use(express.json())

const cors = require('cors');
app.use(cors());

const PORT = 5500;

app.use('/', truongHocRoutes);		        //bảo Router chỉ nhận câu hỏi bắt đầu ‘/hanhDong

// server bắt đầu nghe và đợi câu hỏi ở phòng PORT 5500
app.listen(PORT, function() {		          //chạy Web Server ở địa chỉ phòng này
  console.log("đã bắt đầu server của pokemon đang đợi câu hỏi và ở phòng Port: " + PORT); 
});

const mysql = require('mysql2')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dimaduc',
  database: 'vidu'
})

connection.connect(err => {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  if (err) {
    console.log('Server không nói chuyện với SQL được ['+thoiGian+']')
  } else {
    console.log('Server đã kết nối với SQL được ['+thoiGian+']')
  }
})


truongHocRoutes.route('/them/').post(function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  let GioiTinh = req.query.GioiTinh

  connection.query('INSERT INTO vidu.nhanvatstarwars (ten, GioiTinh) VALUES ('+'"'+thoiGian+'"'+', '+'"'+GioiTinh+'"'+')', (err, rows, fields) => {
    if (err) {
      console.log(err);
      res.status(503).send('Không thêm được, do Server không nói chuyện được với Database')
    }
    else{
      // Cách 1 
      // connection.query('SELECT * FROM nhanvatstarwars', (err, rows, fields) => {
      //   // let vidu = req.query.vidu;
      //   if (err) throw err
      //   console.log(rows[0].ten+' ('+rows[0].GioiTinh+')'+' ['+thoiGian+']')
      //   res.send(rows)
      // })
      // Cách 2
      console.log('Đã thêm người '+thoiGian);
      res.send('Đã thêm thành công')
    }
  })
})

truongHocRoutes.route('/suaTheoId').put(function(req, res) {
  let ID = req.query.ID
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  console.log(ID)
  connection.query('UPDATE vidu.nhanvatstarwars SET ten = '+'"'+thoiGian+'"'+' WHERE id='+ID+';', (err, rows, fields) => {
    
    if (err) throw err
    console.log('Đã sủa người theo có id = ' + ID)
    res.send('Đã sủa người theo có id = ' + ID);
  })
})

truongHocRoutes.route('/Vidu').get(function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  connection.query('SELECT * FROM nhanvatstarwars', (err, rows, fields) => {
    // let vidu = req.query.vidu;
    if (err) throw err
    // console.log(rows[0].ten+' ('+rows[0].GioiTinh+')'+' ['+thoiGian+']')
    res.send(rows)
  })
})

truongHocRoutes.route('/xoaTatCa').delete(function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  connection.query('DELETE FROM vidu.nhanvatstarwars WHERE id>5;', (err, rows, fields) => {
    if (err) throw err
    console.log('Đã xóa tất cả người theo id > 5'+' ['+thoiGian+']')
    res.send('Đã xóa tất cả người theo id > 5');
  })
})
truongHocRoutes.route('/xoaTheoId').delete(function(req, res) {
  let ID = req.query.ID
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  console.log(ID)
  connection.query('DELETE FROM vidu.nhanvatstarwars WHERE id='+ID+';', (err, rows, fields) => {
    if (err) throw err
    console.log('Đã xóa người theo có id = ' + ID)
    res.send('Đã xóa người theo có id = ' + ID);
  })
})

truongHocRoutes.route('/HocSinh').get(function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  res.send('câu trả lời HocSinh');
  console.log('Học Sinh '+'['+thoiGian+']')
})
truongHocRoutes.route('/GiaoVien').get(function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  res.send('câu trả lời GiaoVien');
  console.log('Giáo Viên '+'['+thoiGian+']')
})
truongHocRoutes.route('/BaiHoc').get(function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  res.send('câu trả lời BaiHoc');
  console.log('Bài Học '+'['+thoiGian+']')
})

truongHocRoutes.route('/About').get(function(req, res) {
  res.send('câu trả lời About');
  console.log('About')
})
truongHocRoutes.route('/KhongTimThay').get(function(req, res) {
  res.send('câu trả lời KhongTimThay');
  console.log('KhongTimThay')
})


