const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//tạo 1 Schema Model (giả)
let thuongHocModel = new Schema(
  {
    ten: String,
    GioiTinh: String,
  },
  {collection: 'vidu'}          //tên của collection trong MongoDB
);
// thuongHocModel.index({ten:'text', GioiTinh:'text'})
module.exports = mongoose.model('thuongHoc', thuongHocModel);