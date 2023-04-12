// đây là truong-hoc-server
const express = require('express');		    //phải mượn Express
const truongHocRoutes = express.Router();	    //tạo Router để nhận tất cả câu hỏi

const app = express();
app.use(express.json())

const cors = require('cors');
app.use(cors());

const mongoose = require('mongoose');     //phải mượn Mongoose

const PORT = 5500;

// mongoose.connect('mongodb+srv://dima:dimaduc@cluster0.ybo8t.mongodb.net/pokedex-db?retryWrites=true&w=majority', { useNewUrlParser: true })
mongoose.connect('mongodb://127.0.0.1:27017/thuong-hoc-db', { useNewUrlParser: true })
        .catch(error => console.log('Server không kết nối được với mongoDB: ' + error));
const connection2 = mongoose.connection; //  <=> giữa server và DB

connection2.once('open', function() {
  console.log("Server đã nói chuyện với MongoDB");   
})

app.use('/', truongHocRoutes);		        //bảo Router chỉ nhận câu hỏi bắt đầu ‘/hanhDong

let thuongHocModel = require('./ThuongHoc.model');

// server bắt đầu nghe và đợi câu hỏi ở phòng PORT 5500
app.listen(PORT, function() {		          //chạy Web Server ở địa chỉ phòng này
  console.log("Đã bắt đầu server của trường học đang đợi câu hỏi và ở phòng Port: " + PORT); 
});

const mysql = require('mysql2');
const { collection } = require('./ThuongHoc.model');

ketNoiMySQL = () => {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dimaduc',
    // database: 'vidu'
    database: 'truonghoc'
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
}

// Bắt đầu kết nối
// Tự động gọi funtion để kết nối DB lúc server bắt đầu
ketNoiMySQL()

// truongHocRoutes.route('/hien2Vidu/ketNoiLaiDB/').get(function(req, res) {
//   // console.log('qưertyhgfd')
//   batDauKetNoiMySQL()
// })



timTietHoc1HS = async (id) => {
  var [ketQua] = await connection.promise().query(
    'SELECT tiethoc.ten AS TenTietHoc, diem_1, diem_2, diemTong '+
    
    // Dù ngắn ngọi nhưng vất vả là sửa ketQuaDiem khi xóa cột cũ tạo cột mới
    // ', ketQuaDiem'+

    ', nhanXet FROM truonghoc.hocsinh_tiethoc inner join hocsinh on hocsinh_tiethoc.hocsinh_id = hocsinh.id inner join tiethoc on hocsinh_tiethoc.tiethoc_id = tiethoc.id WHERE hocsinh.id='+id
  )

  // Cách này tốt nhất khi sửa ketQuaDiem
  var tong = 0
  var DiemTrungBinh = 0
  for(var i=0;i<ketQua.length;i++){
    var ketQuaDiem = ''
    if(ketQua[i].diemTong >= 80){
      ketQuaDiem='A'
    }
    else if(ketQua[i].diemTong >= 70){
      ketQuaDiem='B'
    }
    else if(ketQua[i].diemTong >= 50){
      ketQuaDiem='C'
    }
    else if(ketQua[i].diemTong >= 40){
      ketQuaDiem='D'
    }
    else{
      ketQuaDiem='F'
    }
    ketQua[i].ketQuaDiem = ketQuaDiem;

    tong+=ketQua[i].diemTong;
  }
  DiemTrungBinh=tong/ketQua.length

  switch (true) {
    case DiemTrungBinh >= 80:
      ketQuaTrungBinh = "A";
      break;
    case DiemTrungBinh >= 70:
      ketQuaTrungBinh = "B";
      break;
    case DiemTrungBinh >= 50:
      ketQuaTrungBinh = "C";
      break;
    case DiemTrungBinh >= 40:
      ketQuaTrungBinh = "D";
      break;
    default:
      ketQuaTrungBinh = "F";
  }
  console.log('Điểm Trung Bình là: ', DiemTrungBinh)
  console.log('Kết quả Trung Bình Điểm là: ', ketQuaTrungBinh)
  
  var cauTraLoi = {danhSachTH1HS: ketQua, DiemTrungBinh: DiemTrungBinh, ketQuaTrungBinh: ketQuaTrungBinh}

  return cauTraLoi
}

truongHocRoutes.route('/HocSinh/thongTinTietHoc1HS').get(async function(req, res) {
  var id = req.query.id
  var cauTraLoiLienQuanHocSinh = {danhSachTH1HS:[], DiemTrungBinh: 0, ketQuaTrungBinh: 'N/A'}
  cauTraLoiLienQuanHocSinh = await timTietHoc1HS(id)
  console.log('Tìm được liên quan 1 học sinh', cauTraLoiLienQuanHocSinh)
  res.send(cauTraLoiLienQuanHocSinh);
})



timTatCaHocSinh = async () => {
  console.log('Học Sinh')
  // var [ketQua] = await connection.promise().query('SELECT * FROM hocsinh')
    // hocsinh.tuoi AS tuoiHS, 
  var [ketQua] = await connection.promise().query(
    `SELECT 
    hocsinh.id, 
    hocsinh.ten AS tenHocSinh, 
    hocsinh.gioiTinh, 
    anh, 
    hocsinh.ngaySinh AS ngaySinh, 
    TIMESTAMPDIFF(year, hocsinh.ngaySinh, CURDATE()) AS tuoiHS,
    lop.ten AS tenLop, 
    giaovien.ten AS GVChuNhiem, 
    phuhuynh.ten AS phuHuynh, 
    phuhuynh.email AS emailPH, 
    phuhuynh.soDienThoai AS soDienThoai
    FROM truonghoc.hocsinh 
    left join lop on hocsinh.lop_id = lop.id
    inner join giaovien on lop.GVChuNhiem_id = giaovien.id
    left join phuhuynh on hocsinh.phuHuynh_id = phuhuynh.id`
  )
  console.log('Tìm được ', ketQua)
  return ketQua;
}
truongHocRoutes.route('/HocSinh').get(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  // res.send('câu trả lời HocSinh');
  // console.log('Học Sinh '+'['+thoiGian+']')
  var cauTraLoiHocSinh = {danhSachHS:[]}
  cauTraLoiHocSinh.danhSachHS = await timTatCaHocSinh()
  console.log('Tìm được ', cauTraLoiHocSinh)
  res.send(cauTraLoiHocSinh);
})
timTatCaGiaoVien = async () => {
  console.log('Giáo viên')
  var [ketQua] = await connection.promise().query(
    // 'SELECT giaovien.ten AS tengiaoVien, gioiTinh, lop.ten AS quanlylop FROM truonghoc.giaovien left join lop on giaovien.id = lop.GVChuNhiem_id'
    // 'SELECT giaovien.ten AS tengiaoVien, gioiTinh, lop.ten AS quanlylop, tiethoc.ten AS tenTietHoc FROM truonghoc.giaovien left join lop on giaovien.id = lop.GVChuNhiem_id left join tiethoc on giaovien.id = tiethoc.GVDayHoc_id'
    'SELECT giaovien.ten AS tengiaoVien, gioiTinh, lop.ten AS quanlylop, group_concat(tiethoc.ten) AS tenTietHoc FROM truonghoc.giaovien left join lop on giaovien.id = lop.GVChuNhiem_id left join tiethoc on giaovien.id = tiethoc.GVDayHoc_id group by giaovien.ten, gioiTinh, lop.ten'
  )
  console.log('Tìm được ', ketQua)
  return ketQua;
}
truongHocRoutes.route('/GiaoVien').get(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  // res.send('câu trả lời GiaoVien');
  // console.log('Giáo Viên '+'['+thoiGian+']')
  var cauTraLoiGiaoVien = {danhSachGV:[]}
  cauTraLoiGiaoVien.danhSachGV = await timTatCaGiaoVien()
  console.log('Tìm được ', cauTraLoiGiaoVien)
  res.send(cauTraLoiGiaoVien);
})
timTatCaLop = async () => {
  console.log('Lớp Học')
  var [ketQua] = await connection.promise().query(
    `SELECT 
    lop.ten AS tenLop, 
    giaovien.ten AS tenGiaoVien, 
    count(hocsinh.ten) AS tongSoHS, 
    group_concat(hocsinh.ten) AS tenTatCaHS
    FROM 
    truonghoc.lop 
    left join giaovien on lop.GVChuNhiem_id = giaovien.id 
    left join truonghoc.hocsinh on lop.id = hocsinh.lop_id 
    group by lop.ten, giaovien.ten`
  )
  console.log('Tìm được ', ketQua)
  return ketQua;
}
truongHocRoutes.route('/Lop').get(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  // res.send('câu trả lời Lop');
  // console.log('Bài Học '+'['+thoiGian+']')
  var cauTraLoiLop = {danhSachBH:[]}
  cauTraLoiLop.danhSachBH = await timTatCaLop()
  console.log('Tìm được ', cauTraLoiLop)
  res.send(cauTraLoiLop);
})
timTatCaTietHoc = async () => {
  console.log('Phụ huynh')
  var [ketQua] = await connection.promise().query(
    `SELECT 
    tiethoc.ten AS tenTietHoc, 
    giaovien.ten AS tengiaovien, 
    count(hocSinh_id) AS tongSoHS, 
    group_concat(hocsinh.ten) AS tenTatCaHS
    FROM 
    truonghoc.tiethoc 
    left join giaovien on tiethoc.id = giaovien.id
    inner join hocsinh_tiethoc on tiethoc.id = tietHoc_id
    inner join hocsinh on hocsinh.id = hocSinh_id
    group by tiethoc.id`
  )
  console.log('Tìm được ', ketQua)
  return ketQua;
}
truongHocRoutes.route('/TietHoc').get(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  // res.send('câu trả lời TietHoc');
  // console.log('Bài Học '+'['+thoiGian+']')
  var cauTraLoiTietHoc = {danhSachTH:[]}
  cauTraLoiTietHoc.danhSachTH = await timTatCaTietHoc()
  console.log('Tìm được ', cauTraLoiTietHoc)
  res.send(cauTraLoiTietHoc);
})


timHS_hoc_TH = async () => {
  console.log('Quản lý')
  // SQL query
  var [ketQua] = await connection.promise().query(
    `SELECT 
    hocsinh_tiethoc.id, hocsinh.ten AS tenHocSinh, tiethoc.ten AS TenTietHoc, 
    lop.ten AS lop, diem_1, diem_2, diemTong, nhanXet, hocSinh_id, tietHoc_id 
    FROM truonghoc.hocsinh_tiethoc 
    inner join hocsinh on hocsinh_tiethoc.hocsinh_id = hocsinh.id 
    inner join tiethoc on hocsinh_tiethoc.tiethoc_id = tiethoc.id
    inner join lop on lop.id = hocsinh.lop_id`
  )
  // console.log('Tìm được ', ketQua)
  return ketQua;
}
timHocSinh = async () => {
  var [ketQua] = await connection.promise().query(
    'SELECT ten, id FROM truonghoc.hocsinh;'
  )
  // console.log('Tìm được ', ketQua)
  return ketQua;
}
timTietHoc = async () => {
  var [ketQua] = await connection.promise().query(
    'SELECT ten, id FROM truonghoc.tiethoc;'
  )
  // console.log('Tìm được ', ketQua)
  return ketQua;
}
truongHocRoutes.route('/QuanLy').get(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  // res.send('câu trả lời TietHoc');
  // console.log('Bài Học '+'['+thoiGian+']')
  
  var danhSachQL = []
  danhSachQL = await timHS_hoc_TH()
  // console.log('Tìm được quản lý: ', danhSachQL)
  // res.send(cauTraLoiQuanLy);
  
  var danhSachHS = []
  danhSachHS = await timHocSinh()
  // console.log('Tìm được học sinh: ', danhSachHS)
  // res.send(cauTraLoiHocSinh);
  
  var danhSachTH = []
  danhSachTH = await timTietHoc()
  // console.log('Tìm được tiết học: ', danhSachTH)
  // res.send(cauTraLoiTietHoc);
  var cauTraLoi = {danhSachQL: danhSachQL, danhSachHS: danhSachHS, danhSachTH: danhSachTH}
  res.send(cauTraLoi);
})

timHSTH_1HS = async (HS_Id) => {
  if(HS_Id==='TatCaHS'){
    var [ketQua] = await connection.promise().query(
      'SELECT hocsinh_tiethoc.id, hocsinh.ten AS tenHocSinh, tiethoc.ten AS TenTietHoc, diem_1, diem_2, diemTong, nhanXet FROM truonghoc.hocsinh_tiethoc inner join hocsinh on hocsinh_tiethoc.hocsinh_id = hocsinh.id inner join tiethoc on hocsinh_tiethoc.tiethoc_id = tiethoc.id'
    )
  }else{
    var [ketQua] = await connection.promise().query(
      'SELECT hocsinh_tiethoc.id, hocsinh.ten AS tenHocSinh, tiethoc.ten AS TenTietHoc, diem_1, diem_2, diemTong, nhanXet FROM truonghoc.hocsinh_tiethoc inner join hocsinh on hocsinh_tiethoc.hocsinh_id = hocsinh.id inner join tiethoc on hocsinh_tiethoc.tiethoc_id = tiethoc.id WHERE hocsinh.id='+HS_Id
    )
  }
  return ketQua;
}
truongHocRoutes.route('/QuanLy/chonTen1HS').get(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  var HS_Id = req.query.HS_Id
  var danhSachQL = []
  danhSachQL = await timHSTH_1HS(HS_Id)
  var cauTraLoi = {danhSachQL: danhSachQL}
  res.send(cauTraLoi);
})

xoaQL = async (QL_Id) => {
  try{
    await connection.promise().query('DELETE FROM truonghoc.hocsinh_tiethoc WHERE id='+QL_Id+';')
  }
  catch(err){
    throw err
  }
}
truongHocRoutes.route('/QuanLy/xoaHS_TH').delete(async function(req, res) {
  var QL_Id = req.query.QL_Id
  try {
    await xoaQL(QL_Id)
    console.log('Đã xóa id: '+QL_Id)
    var danhSachSauKhiXoa = [] 
    danhSachSauKhiXoa = await timHS_hoc_TH()
    // res.send(danhSachSauKhiXoa)

    var cauTraLoi = {danhSachQL: danhSachSauKhiXoa}
    res.send(cauTraLoi);
  }
  catch(err){
    console.log('Không xóa được, có lỗi: ', err)
    res.status(503).send(err.message)
   return
  }
  
})



// truongHocRoutes.route('/timHocSinh').get(async function(req, res) {
//   var homNay = new Date();
//   var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
//   // res.send('câu trả lời TietHoc');
//   // console.log('Bài Học '+'['+thoiGian+']')
//   var cauTraLoiHocSinh = {danhSachHS:[]}
//   cauTraLoiHocSinh.danhSachHS = await timHocSinh()
//   console.log('Tìm được ', cauTraLoiHocSinh)
//   res.send(cauTraLoiHocSinh);
// })
// truongHocRoutes.route('/timTietHoc').get(async function(req, res) {
//   var homNay = new Date();
//   var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
//   // res.send('câu trả lời TietHoc');
//   // console.log('Bài Học '+'['+thoiGian+']')
//   var cauTraLoiTietHoc = {danhSachTH:[]}
//   cauTraLoiTietHoc.danhSachTH = await timTietHoc()
//   console.log('Tìm được ', cauTraLoiTietHoc)
//   res.send(cauTraLoiTietHoc);
// })

themHS_TH = async (hocSinh_Id, tietHoc_Id) => {
  try{
    var [ketQua] = await connection.promise().query('SELECT * FROM truonghoc.hocsinh_tiethoc where hocSinh_id='+hocSinh_Id+' and tietHoc_id='+tietHoc_Id+';')
    if(ketQua.length===0){
      await connection.promise().query('INSERT INTO hocsinh_tiethoc (hocSinh_id, tietHoc_id) VALUES  ('+hocSinh_Id+', '+tietHoc_Id+')')
      console.log('Đã thêm học sinh và tiết học')
    }else{
      throw new Error("Đã có và không thêm được");
    }
  }
  catch(err){
    //console.log('Không kết nối DBMySQL: ', err)
    throw err
  }
}
truongHocRoutes.route('/QuanLy/themHS_TH/').post(async function(req, res) {
  var hocSinh_Id = req.query.hocSinh_Id
  var tietHoc_Id = req.query.tietHoc_Id
  console.log('hocSinh_Id = ' + hocSinh_Id + ' & tietHoc_Id = ' + tietHoc_Id)
  // tìm xem đã có trong databast chưa? nếu không có thì làm và nếu có rồi thì không làm nữa và dừng lại
  // tìm xem học toán không
  try {
    await themHS_TH(hocSinh_Id, tietHoc_Id)
    console.log('Thêm người trong HS_TH ở MySQL')
    var danhSachQL = []
    danhSachQL = await timHS_hoc_TH()
    var cauTraLoi = {danhSachQL: danhSachQL}
    res.send(cauTraLoi);
    // alert(err)
  }
  catch(err){
    console.log('function thêm HS_TH MySQL có vấn đề: ', err)
    res.status(503).send(err.message)
    return
  }
})

suaDiem = async (diemQL1, diemQL2, nhanXet, id) => {
  try{
    console.log('Sửa diểm trong MySqlBD')
    if(diemQL1===''){diemQL1 = null}
    if(diemQL2===''){diemQL2 = null}
    await connection.promise().query('UPDATE hocsinh_tiethoc SET diem_1 = '+diemQL1+', diem_2 = '+diemQL2+', nhanXet = '+`'`+nhanXet+`'`+
    ' WHERE id = '+id);
  }
  catch(err){
    console.log('Không kết nối DBMySQL: ', err)
    throw err
  }
}
truongHocRoutes.route('/QuanLy/suaDiemHS/').put(async function(req, res) {
  // var diemQL1 = req.query.diemQL1
  // var diemQL2 = req.query.diemQL2
  // var nhanXet = req.query.nhanXet
  // var id = req.query.QL_Id
  
  var diemQL1 = req.body.diem1
  var diemQL2 = req.body.diem2
  var nhanXet = req.body.nhanXet
  var id = req.body.QL_Id
  
  console.log('Điểm 1: '+ diemQL1+' vs Điểm 2:'+diemQL2+', Nhận xét'+nhanXet+' id: '+id)
  try {
    await suaDiem(diemQL1, diemQL2, nhanXet, id)
    console.log('Sửa điểm trong HS_TH ở MySQL')
    
    var danhSachQL = []
    danhSachQL = await timHS_hoc_TH()
    var cauTraLoi = {danhSachQL: danhSachQL}
    res.send(cauTraLoi);
  }
  catch(err){
    console.log('function sửa HS_TH MySQL có lỗi.')
    res.status(503).send('Không sửa được, do Server không nói chuyện được với Database MySQL')
   return
  }
})

timTatCaPhuHuynh = async () => {
  console.log('Phụ huynh')
  var [ketQua] = await connection.promise().query('SELECT * FROM phuhuynh')
  console.log('Tìm được ', ketQua)
  return ketQua;
}
truongHocRoutes.route('/PhuHuynh').get(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  // res.send('câu trả lời PhuHuynh');
  // console.log('Bài Học '+'['+thoiGian+']')
  var cauTraLoiPhuHuynh = {danhSachPH:[]}
  cauTraLoiPhuHuynh.danhSachPH = await timTatCaPhuHuynh()
  console.log('Tìm được ', cauTraLoiPhuHuynh)
  res.send(cauTraLoiPhuHuynh);
})

truongHocRoutes.route('/About').get(function(req, res) {
  res.send('câu trả lời About');
  console.log('About')
})
truongHocRoutes.route('/KhongTimThay').get(function(req, res) {
  res.send('câu trả lời KhongTimThay');
  console.log('KhongTimThay')
})

timTatCaMongo = async () => {
  try{
    console.log('Tìm MongoBD')
    var ketQua = await thuongHocModel.find({})
    return ketQua
  }
  catch(err){
    console.log('Không kết nối DBMongo: ', err)
    throw err
  }
}
timTatCaMySql = async () => {
  try{
    console.log('Tìm MySqlBD')
    var [ketQua] = await connection.promise().query('SELECT * FROM nhanvatstarwars')
    return ketQua;
  }
  catch(err){
    console.log('Không kết nối DBMySQL: ', err)
    throw err
  }
}
truongHocRoutes.route('/hien2Vidu/').get(async function(req, res) {
  // tìm trong Mongo và MySQL
  // cho 2 danh sách vào trong câu trả lời to
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  console.log('Tìm BD')
  var cauTraLoiHaiDanhSach = {DBMongo: [], DBMySQL: []}
  var tenDB = ''
  try {
    cauTraLoiHaiDanhSach.DBMongo = await timTatCaMongo()
    console.log('Tìm được '+ cauTraLoiHaiDanhSach.DBMongo.length +' người trong Mongo')
  }
  catch(err){
    console.log('function timTatCaMongo có lỗi.')
    tenDB ='MongoDB'
  }
  try {
    cauTraLoiHaiDanhSach.DBMySQL = await timTatCaMySql()
    console.log('Tìm được '+ cauTraLoiHaiDanhSach.DBMySQL.length +' người trong MySQL')
  }
  catch(err){
    console.log('function timTatCaMySQL có lỗi.')
    // Thử kết nối lại, 
    ketNoiMySQL()
    tenDB ='MySQLDB'
  }
  res.json(cauTraLoiHaiDanhSach)
})

suaNguoiTrongMongo = async (suaIdMongo, thoiGian, suaGioiTinh) => {
  try{
    console.log('Sửa người trong MongoBD')
    await thuongHocModel.findByIdAndUpdate(suaIdMongo, {ten: thoiGian, GioiTinh: suaGioiTinh})
  }
  catch(err){
    console.log('Không kết nối DBMongo: ', err)
    throw err
  }
}
suaNguoiTrongMySql = async (suaIdMySQL, thoiGian, suaGioiTinh) => {
  try{
    console.log('Sửa người trong MySqlBD')
    await connection.promise().query('UPDATE vidu.nhanvatstarwars SET ten = '+'"'+thoiGian+'"'+', GioiTinh='+'"'+suaGioiTinh+'"'+' WHERE id='+suaIdMySQL+';')
  }
  catch(err){
    console.log('Không kết nối DBMySQL: ', err)
    throw err
  }
}
truongHocRoutes.route('/hien2Vidu/suaTheoId/').put(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  let suaGioiTinh = req.query.suaGioiTinh
  let suaIdMongo = req.query.suaIdMongo
  let suaIdMySQL = req.query.suaIdMySQL
  console.log('Tìm BD')
  try {
    await suaNguoiTrongMongo(suaIdMongo, thoiGian, suaGioiTinh)
    console.log('Sửa người trong Mongo')
  }
  catch(err){
    console.log('function sửa Mongo có lỗi.')
    res.status(503).send('Không sửa được, do Server không nói chuyện được với Database MongoDB')
    return
  }
  try {
    await suaNguoiTrongMySql(suaIdMySQL, thoiGian, suaGioiTinh)
    console.log('Sửa người trong MySQL')
  }
  catch(err){
    console.log('function sửa MySQL có lỗi.')
    res.status(503).send('Không sửa được, do Server không nói chuyện được với Database MySQL')
   return
  }
  var cauTraLoiHaiDanhSach = {DBMongo: [], DBMySQL: []}
  cauTraLoiHaiDanhSach.DBMongo = await timTatCaMongo()
  cauTraLoiHaiDanhSach.DBMySQL = await timTatCaMySql()
  res.json(cauTraLoiHaiDanhSach)
})

xoaNguoiTrongMongo = async (xoaIdMongo) => {
  try{
    console.log('Xóa người trong MongoBD')
    await thuongHocModel.findByIdAndDelete(xoaIdMongo)
  }
  catch(err){
    console.log('Không xóa được ở DBMongo: ', err)
    throw err
  }
}
xoaNguoiTrongMySql = async (xoaIdMySQL) => {
  try{
    console.log('Xóa người trong MySqlBD')
    await connection.promise().query('DELETE FROM vidu.nhanvatstarwars WHERE id='+xoaIdMySQL+';')
  }
  catch(err){
    console.log('Không xóa được ở DBMySQL: ', err)
    throw err
  }
}
truongHocRoutes.route('/hien2Vidu/xoaTheoId/').delete(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  let xoaIdMongo = req.query.xoaIdMongo
  let xoaIdMySQL = req.query.xoaIdMySQL
  console.log('Tìm BD')
  try {
    await xoaNguoiTrongMongo(xoaIdMongo)
    console.log('Xóa người trong Mongo')
  }
  catch(err){
    console.log('function xóa Mongo có lỗi.')
    res.status(503).send('Không xóa được, do Server không nói chuyện được với Database MongoDB')
    return
  }
  try {
    await xoaNguoiTrongMySql(xoaIdMySQL)
    console.log('Xóa người trong MySQL')
  }
  catch(err){
    console.log('function xóa MySQL có lỗi.')
    res.status(503).send('Không xóa được, do Server không nói chuyện được với Database MySQL')
   return
  }
  var cauTraLoiHaiDanhSach = {DBMongo: [], DBMySQL: []}
  cauTraLoiHaiDanhSach.DBMongo = await timTatCaMongo()
  cauTraLoiHaiDanhSach.DBMySQL = await timTatCaMySql()
  res.json(cauTraLoiHaiDanhSach)
})

xoaTatCaTrongMongo = async (xoaGioiTinh) => {
  try{
    console.log('Xóa người trong MongoBD')
    await thuongHocModel.deleteMany({GioiTinh: xoaGioiTinh})
  }
  catch(err){
    console.log('Không xóa được ở DBMongo: ', err)
    throw err
  }
}
xoaTatCaTrongMySql = async (xoaGioiTinh) => {
  try{
    console.log('Xóa người trong MySqlBD')
    await connection.promise().query('DELETE FROM vidu.nhanvatstarwars WHERE GioiTinh='+`'`+xoaGioiTinh+`'`+';')
  }
  catch(err){
    console.log('Không xóa được ở DBMySQL: ', err)
    throw err
  }
}
truongHocRoutes.route('/hien2Vidu/xoaTatCa/').delete(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  var xoaGioiTinh = req.query.xoaGioiTinh
  console.log('Tìm BD')
  try {
    await xoaTatCaTrongMongo(xoaGioiTinh)
    console.log('Xóa tất cả người trong Mongo')
  }
  catch(err){
    console.log('function xóa Mongo có lỗi.')
    res.status(503).send('Không xóa được, do Server không nói chuyện được với Database MongoDB')
    return
  }
  try {
    await xoaTatCaTrongMySql(xoaGioiTinh)
    console.log('Xóa tất cả người trong MySQL')
  }
  catch(err){
    console.log('function xóa MySQL có lỗi.')
    res.status(503).send('Không xóa được, do Server không nói chuyện được với Database MySQL')
   return
  }
  var cauTraLoiHaiDanhSach = {DBMongo: [], DBMySQL: []}
  cauTraLoiHaiDanhSach.DBMongo = await timTatCaMongo()
  cauTraLoiHaiDanhSach.DBMySQL = await timTatCaMySql()
  res.json(cauTraLoiHaiDanhSach)
})

themNguoiTrongMongo = async (thoiGian, GioiTinhNhanDuoc) => {
  try{
      let nguoiMoi = new thuongHocModel({ten: thoiGian, GioiTinh: GioiTinhNhanDuoc});
      await nguoiMoi.save()
  }
  catch(err){
    console.log('Không thêm được ở DBMongo: ', err)
    throw err
  }
}
themNguoiTrongMySql = async (thoiGian, GioiTinhNhanDuoc) => {
  try{
    console.log('Thêm người trong MySqlBD')
    await connection.promise().query('INSERT INTO vidu.nhanvatstarwars (ten, GioiTinh) VALUES ('+'"'+thoiGian+'"'+', '+'"'+GioiTinhNhanDuoc+'"'+')')
  }
  catch(err){
    console.log('Không thêm được ở DBMySQL: ', err)
    throw err
  }
}
truongHocRoutes.route('/hien2Vidu/them/').post(async function(req, res) {
  var homNay = new Date();
  var thoiGian = homNay.getHours() + ":" + homNay.getMinutes() + ":" + homNay.getSeconds();
  let GioiTinhNhanDuoc = req.query.GioiTinh
  try {
    await themNguoiTrongMongo(thoiGian, GioiTinhNhanDuoc)
    console.log('Thêm người trong Mongo')
  }
  catch(err){
    console.log('function thêm Mongo có lỗi.')
    res.status(503).send('Không thêm được, do Server không nói chuyện được với Database MongoDB')
    return
  }
  try {
    await themNguoiTrongMySql(thoiGian, GioiTinhNhanDuoc)
    console.log('Thêm người trong MySQL')
  }
  catch(err){
    console.log('function thêm MySQL có lỗi.')
    res.status(503).send('Không thêm được, do Server không nói chuyện được với Database MySQL')
   return
  }
  var cauTraLoiHaiDanhSach = {DBMongo: [], DBMySQL: []}
  cauTraLoiHaiDanhSach.DBMongo = await timTatCaMongo()
  cauTraLoiHaiDanhSach.DBMySQL = await timTatCaMySql()
  res.json(cauTraLoiHaiDanhSach)
})
