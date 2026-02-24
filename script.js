// =====================================================================
// PHẦN 1: KHAI BÁO CÁC LỚP BẢN ĐỒ NỀN (BASEMAPS)
// =====================================================================

var osmLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  },
);

var googleSatLayer = L.tileLayer(
  "http://mt0.google.com/vt/lyrs=s&hl=vi&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    attribution: "&copy; Google Maps",
  },
);

// =====================================================================
// PHẦN 2: KHAI BÁO LỚP DỮ LIỆU WMS TỪ MÁY CHỦ VPS
// =====================================================================
// Đã thay đổi localhost thành IP VPS và cập nhật Workspace thành 'angiang'
var urlWMS = "/myproxy/angiang/wms";

var rung = L.tileLayer.wms(urlWMS, {
  layers: "angiang:rung",
  format: "image/png",
  transparent: true,
  version: "1.1.0",
});
var nuoc = L.tileLayer.wms(urlWMS, {
  layers: "angiang:waterways",
  format: "image/png",
  transparent: true,
  version: "1.1.0",
});
var dat = L.tileLayer.wms(urlWMS, {
  layers: "angiang:dat",
  format: "image/png",
  transparent: true,
  version: "1.1.0",
});
var khoangsan = L.tileLayer.wms(urlWMS, {
  layers: "angiang:khoangsan_diem_mo",
  format: "image/png",
  transparent: true,
  version: "1.1.0",
});
var dongvat = L.tileLayer.wms(urlWMS, {
  layers: "angiang:dongvat",
  format: "image/png",
  transparent: true,
  version: "1.1.0",
});

var thucvat = L.tileLayer.wms(urlWMS, {
  layers: "angiang:thucvat",
  format: "image/png",
  transparent: true,
  version: "1.1.0",
});
// =====================================================================
// PHẦN 3: KHỞI TẠO BẢN ĐỒ VÀ THIẾT LẬP GÓC NHÌN
// =====================================================================

var map = L.map("map", {
  center: [10.3711, 105.4328],
  zoom: 11,
  layers: [osmLayer], // Load sẵn nền OSM
});

var marker = L.marker([10.3711, 105.4328]).addTo(map);
marker
  .bindPopup(
    "<b>Chào mừng đến với WebGIS An Giang!</b><br>Đây là trung tâm TP. Long Xuyên.",
  )
  .openPopup();

// =====================================================================
// PHẦN 4: TẠO BỘ ĐIỀU KHIỂN CHUYỂN ĐỔI BẢN ĐỒ (LAYER CONTROL)
// =====================================================================

var baseMaps = {
  "Bản đồ Đường phố (OSM)": osmLayer,
  "Bản đồ Vệ tinh (Google)": googleSatLayer,
};

var overlayMaps = {
  "Tài nguyên Rừng": rung,
  "Tài nguyên Nước": nuoc,
  "Tài nguyên Đất": dat,
  "Tài nguyên Khoáng Sản": khoangsan,
  "Tài nguyên Động vật": dongvat,
  "Tài nguyên Thực vật": thucvat,
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

// =====================================================================
// GIAI ĐOẠN 2: CLICK LẤY THÔNG TIN TỪ VPS (WFS GETFEATURE)
// =====================================================================
// Đã xóa phần code trùng lặp và đồng bộ lại IP VPS

map.on("click", function (e) {
  var tolerance = 0.001;
  var minx = e.latlng.lng - tolerance;
  var miny = e.latlng.lat - tolerance;
  var maxx = e.latlng.lng + tolerance;
  var maxy = e.latlng.lat + tolerance;

  var promises = [];
  var urlWFS =
    "/myproxy/angiang/ows?service=WFS&version=1.1.0&request=GetFeature&outputFormat=application/json&srsName=EPSG:4326&bbox=" +
    minx +
    "," +
    miny +
    "," +
    maxx +
    "," +
    maxy +
    ",EPSG:4326";

  // 1. LỚP KHOÁNG SẢN
  if (map.hasLayer(khoangsan)) {
    var pKhoangSan = fetch(urlWFS + "&typeName=angiang:khoangsan_diem_mo")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return (
            "<div class='info-popup'><h4>Thông tin mỏ khoáng sản</h4><p><b>Tên đơn vị:</b> " +
            props.ten_don_vi +
            "</p><p><b>Loại:</b> " +
            props.loai_khoang_san +
            "</p><p><b>Tình trạng:</b> " +
            props.tinh_trang +
            "</p><p><b>Trữ lượng:</b> " +
            props.tru_luong +
            "</p><p><b>Diện tích:</b> " +
            props.dien_tich +
            "</p><p><b>Địa chỉ:</b> " +
            props.dia_chi +
            "</p><p><b>Đối tượng bảo vệ:</b> " +
            props.doi_tuong_bao_ve +
            "</p></div>"
          );
        }
        return "";
      })
      .catch(() => "");
    promises.push(pKhoangSan);
  }

  // 2. LỚP RỪNG
  if (map.hasLayer(rung)) {
    var pRung = fetch(urlWFS + "&typeName=angiang:rung")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return (
            "<div class='info-popup'><h4>Thông tin Rừng</h4><p><b>Nhóm:</b> " +
            props.nhom +
            "</p><p><b>Tên:</b> " +
            props.ten +
            "</p><p><b>Loại rừng:</b> " +
            props.loai_rung +
            "</p><p><b>Diện tích:</b> " +
            props.dien_tich_ha +
            " ha</p></div>"
          );
        }
        return "";
      })
      .catch(() => "");
    promises.push(pRung);
  }

  // 3. LỚP NƯỚC
  if (map.hasLayer(nuoc)) {
    var pNuoc = fetch(urlWFS + "&typeName=angiang:waterways")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return (
            "<div class='info-popup'><h4>Thông tin Nước</h4><p><b>Tên:</b> " +
            props.ten +
            "</p><p><b>Loại:</b> " +
            props.loai +
            "</p><p><b>Cấp:</b> " +
            props.cap +
            "</p></div>"
          );
        }
        return "";
      })
      .catch(() => "");
    promises.push(pNuoc);
  }

  // 4. LỚP ĐẤT
  if (map.hasLayer(dat)) {
    var pDat = fetch(urlWFS + "&typeName=angiang:dat")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return (
            "<div class='info-popup'><h4>Thông tin Đất</h4><p><b>Tên:</b> " +
            props.ten +
            "</p><p><b>Loại đất:</b> " +
            props.loai_dat_su_dung +
            "</p><p><b>Diện tích:</b> " +
            props.dien_tich_ha +
            " ha</p></div>"
          );
        }
        return "";
      })
      .catch(() => "");
    promises.push(pDat);
  }
  // 5. LỚP ĐỘNG VẬT
  if (map.hasLayer(dongvat)) {
    var pDongVat = fetch(urlWFS + "&typeName=angiang:dongvat")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return (
            "<div class='info-popup'><h4>Thông tin Động vật</h4><p><b>Tên:</b> " +
            props.ten_loai +
            "</p><p><b>Nhóm:</b> " +
            props.nhom +
            "</p><p><b>Phân loại:</b> " +
            props.phan_loai +
            "</p><p><b>Vị trí phân bố:</b> " +
            props.vi_tri_phan_bo +
            "</p><b>Mức độ nguy cấp:</b> " +
            props.muc_do_nguy_cap +
            "</p></div>"
          );
        }
        return "";
      })
      .catch(() => "");
    promises.push(pDongVat);
  }
  // 6. LỚP THỰC VẬT
  if (map.hasLayer(thucvat)) {
    var pThucVat = fetch(urlWFS + "&typeName=angiang:thucvat")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return (
            "<div class='info-popup'><h4>Thông tin Thực vật</h4><p><b>Tên:</b> " +
            props.ten_loai +
            "</p><b>Phân loại:</b> " +
            props.phan_loai +
            "</p><b>Nhóm:</b> " +
            props.nhom +
            "</p><p><b>Vị trí phân bố:</b> " +
            props.vi_tri_phan_bo +
            "</p><b>Mức độ nguy cấp:</b> " +
            props.muc_do_nguy_cap +
            "</p></div>"
          );
        }
        return "";
      })
      .catch(() => "");
    promises.push(pThucVat);
  }
  // XỬ LÝ KẾT QUẢ HIỂN THỊ POPUP
  if (promises.length > 0) {
    Promise.all(promises).then((results) => {
      var validResults = results.filter((r) => r !== "");
      if (validResults.length > 0) {
        var finalHtml = validResults.join(
          "<hr style='border: 0; border-top: 1px dashed #4caf50; margin: 10px 0;'>",
        );
        L.popup().setLatLng(e.latlng).setContent(finalHtml).openOn(map);
      }
    });
  }
});
// Tìm đến nút bấm và danh sách vừa tạo bằng HTML
const btnThemTaiNguyen = document.getElementById("btnThemTaiNguyen");
const danhSachTaiNguyen = document.getElementById("danhSachTaiNguyen");

// Gắn sự kiện: Hễ có người click vào nút thì lật ngược trạng thái ẩn/hiện của danh sách
btnThemTaiNguyen.addEventListener("click", function () {
  danhSachTaiNguyen.classList.toggle("hidden");
});
// Khai báo biến toàn cục để nhớ xem người dùng đang muốn vẽ tài nguyên gì
var taiNguyenDangChon = "";

// Lấy toàn bộ các mục trong danh sách tài nguyên
const cacLoaiTaiNguyen = document.querySelectorAll(".resource-item");
const menuTaiNguyen = document.getElementById("danhSachTaiNguyen");

// Gắn sự kiện click cho từng mục trong danh sách
cacLoaiTaiNguyen.forEach(function (item) {
  item.addEventListener("click", function () {
    // 1. Đọc "thẻ bài" xem mục này yêu cầu vẽ hình gì và tên là gì
    const loaiHinh = this.getAttribute("data-loai");
    taiNguyenDangChon = this.getAttribute("data-ten");

    // 2. Giấu cái menu đi cho bản đồ thoáng đãng dễ vẽ
    menuTaiNguyen.classList.add("hidden");

    // 3. Triệu hồi công cụ vẽ tương ứng của Leaflet.draw
    if (loaiHinh === "polygon") {
      new L.Draw.Polygon(map).enable(); // Bật bút vẽ mảng (Rừng, Đất)
    } else if (loaiHinh === "polyline") {
      new L.Draw.Polyline(map).enable(); // Bật bút kẻ đường kẻ chỉ (Sông, Kênh)
    } else if (loaiHinh === "point") {
      new L.Draw.Marker(map).enable(); // Lấy đinh ghim ra chấm điểm (Khoáng sản)
    }

    // Báo hiệu cho người dùng biết để bắt đầu thao tác
    alert("chọn vị trí trên bản đồ để vẽ/chấm điểm cho: " + taiNguyenDangChon);
  });
});
// 1. Tạo một "khay chứa" (FeatureGroup) để lưu giữ các hình Dao friend sắp vẽ
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// 2. Lắng nghe khoảnh khắc Dao friend hoàn thành nét vẽ
// (Nhả chuột chấm điểm, hoặc click đúp để kết thúc vẽ mảng/đường)
// ==========================================
// TẠO FORM VÀ XỬ LÝ SỰ KIỆN VẼ XONG
// ==========================================
map.on("draw:created", function (e) {
  var type = e.layerType;
  var layer = e.layer;
  drawnItems.addLayer(layer);

  // ------------------------------------------
  // 1. NHÁNH VẼ ĐIỂM (MỎ KHOÁNG SẢN)
  // ------------------------------------------
  if (type === "marker") {
    var toaDo = layer.getLatLng();

    // ==========================================
    // 1.1: KHI CHẤM MỎ KHOÁNG SẢN
    // ==========================================
    if (taiNguyenDangChon === "Mỏ khoáng sản") {
      var formDiv = document.createElement("div");
      formDiv.className = "wfs-form-container";
      formDiv.innerHTML = `
        <h4 class="wfs-form-header">THÊM MỎ KHOÁNG SẢN</h4>
        <div class="wfs-form-group"><label>Tên đơn vị:</label><input type="text" id="inpTen" class="wfs-input" placeholder="Nhập tên mỏ..."></div>
        <div class="wfs-form-group"><label>Loại khoáng sản:</label>
          <select id="inpLoai" class="wfs-input">
            <option value="Chưa phân loại">Chưa phân loại</option><option value="Đá xây dựng">Đá xây dựng</option>
            <option value="Sét gạch ngói">Sét gạch ngói</option><option value="Cát xây dựng">Cát xây dựng</option>
            <option value="Cát san lấp">Cát san lấp</option><option value="Đất đá san lấp">Đất đá san lấp</option>
            <option value="Đá vôi">Đá vôi</option><option value="Than bùn">Than bùn</option>
          </select>
        </div>
        <div class="wfs-form-group"><label>Tình trạng:</label>
          <select id="inpTinhTrang" class="wfs-input">
            <option value="Chưa xác định">Chưa xác định</option><option value="Đã quy hoạch">Đã quy hoạch</option>
            <option value="Chưa khai thác">Chưa khai thác</option><option value="Đang khai thác" selected>Đang khai thác</option>
            <option value="Tạm dừng khai thác">Tạm dừng khai thác</option><option value="Đóng cửa mỏ">Đóng cửa mỏ</option>
            <option value="Khu vực cấm khai thác">Khu vực cấm khai thác</option><option value="Khai thác trái phép">Khai thác trái phép</option>
          </select>
        </div>
        <div class="wfs-flex-row">
          <div class="wfs-flex-col"><label>Trữ lượng:</label><input type="number" id="inpTruLuong" class="wfs-input" value="0"></div>
          <div class="wfs-flex-col"><label>Diện tích (ha):</label><input type="number" id="inpDienTich" class="wfs-input" value="0"></div>
        </div>
        <div class="wfs-form-group"><label>Địa chỉ:</label><input type="text" id="inpDiaChi" class="wfs-input" placeholder="Nhập địa chỉ..."></div>
        <div class="wfs-form-group"><label>Đối tượng bảo vệ:</label><input type="text" id="inpDoiTuong" class="wfs-input" placeholder="Nhập đối tượng bảo vệ..."></div>
        <div class="wfs-button-group">
          <button id="btnHuyForm" class="wfs-btn wfs-btn-cancel">❌ HỦY</button>
          <button id="btnLuuForm" class="wfs-btn wfs-btn-save">💾 LƯU</button>
        </div>
      `;

      layer.bindPopup(formDiv).openPopup();

      formDiv
        .querySelector("#btnHuyForm")
        .addEventListener("click", function () {
          map.closePopup();
          drawnItems.removeLayer(layer);
        });

      formDiv
        .querySelector("#btnLuuForm")
        .addEventListener("click", function () {
          var ten = formDiv.querySelector("#inpTen").value;
          var loai = formDiv.querySelector("#inpLoai").value;
          var tinhTrang = formDiv.querySelector("#inpTinhTrang").value;
          var truLuong = formDiv.querySelector("#inpTruLuong").value;
          var dienTich = formDiv.querySelector("#inpDienTich").value;
          var diaChi = formDiv.querySelector("#inpDiaChi").value;
          var doiTuong = formDiv.querySelector("#inpDoiTuong").value;

          if (!ten) {
            alert("Kiếp nạn! Không được để trống Tên đơn vị!");
            return;
          }

          phongDuLieuLenGeoServer(
            toaDo.lng,
            toaDo.lat,
            ten,
            loai,
            tinhTrang,
            truLuong,
            dienTich,
            diaChi,
            doiTuong,
          );
          map.closePopup();
        });
    }

    // ==========================================
    // 1.2: KHI CHẤM ĐỘNG VẬT HOẶC THỰC VẬT
    // ==========================================
    else if (
      taiNguyenDangChon === "Tài nguyên Động vật" ||
      taiNguyenDangChon === "Tài nguyên Thực vật"
    ) {
      var isDongVat = taiNguyenDangChon === "Tài nguyên Động vật";
      var tieuDe = isDongVat ? "THÊM ĐỘNG VẬT" : "THÊM THỰC VẬT";
      var mauNen = isDongVat ? "#e65100" : "#33691e";
      var tenBangDB = isDongVat ? "dongvat" : "thucvat"; // Chuẩn tên Database không có _ag

      var formDivSinhVat = document.createElement("div");
      formDivSinhVat.className = "wfs-form-container";
      formDivSinhVat.innerHTML = `
        <h4 class="wfs-form-header" style="color: ${mauNen}; border-color: ${mauNen};">${tieuDe}</h4>
        <div class="wfs-form-group"><label>Tên sinh vật:</label><input type="text" id="inpTenSV" class="wfs-input" placeholder="Nhập tên..."></div>
        <div class="wfs-form-group"><label>Phân loại:</label><input type="text" id="inpPhanLoai" class="wfs-input" placeholder="VD: Lưỡng cư, Bò sát, Cây gỗ..."></div>
        <div class="wfs-form-group"><label>Nhóm:</label><input type="text" id="inpNhom" class="wfs-input" placeholder="VD: Nhóm IB, IIB..."></div>
        <div class="wfs-form-group"><label>Vị trí phân bố:</label><input type="text" id="inpViTri" class="wfs-input" placeholder="Nhập vị trí..."></div>
        <div class="wfs-form-group"><label>Mức độ nguy cấp:</label>
          <select id="inpNguyCap" class="wfs-input">
            <option value="Bình thường">Bình thường</option>
            <option value="Ít quan tâm (LC)">Ít quan tâm (LC)</option>
            <option value="Sắp nguy cấp (VU)">Sắp nguy cấp (VU)</option>
            <option value="Nguy cấp (EN)">Nguy cấp (EN)</option>
            <option value="Cực kỳ nguy cấp (CR)">Cực kỳ nguy cấp (CR)</option>
          </select>
        </div>
        <div class="wfs-button-group">
          <button id="btnHuySV" class="wfs-btn wfs-btn-cancel">❌ HỦY</button>
          <button id="btnLuuSV" class="wfs-btn wfs-btn-save" style="background-color: ${mauNen};">💾 LƯU</button>
        </div>
      `;

      layer.bindPopup(formDivSinhVat).openPopup();

      formDivSinhVat
        .querySelector("#btnHuySV")
        .addEventListener("click", function () {
          map.closePopup();
          drawnItems.removeLayer(layer);
        });

      formDivSinhVat
        .querySelector("#btnLuuSV")
        .addEventListener("click", function () {
          var ten = formDivSinhVat.querySelector("#inpTenSV").value.trim();
          var phanLoai =
            formDivSinhVat.querySelector("#inpPhanLoai").value.trim() ||
            "Chưa xác định";
          var nhom =
            formDivSinhVat.querySelector("#inpNhom").value.trim() ||
            "Chưa xác định";
          var viTri =
            formDivSinhVat.querySelector("#inpViTri").value.trim() ||
            "Chưa xác định";
          var nguyCap = formDivSinhVat.querySelector("#inpNguyCap").value;

          if (!ten) {
            alert("Kiếp nạn! Tên sinh vật không được để trống!");
            return;
          }

          phongDuLieuSinhVatLenGeoServer(
            toaDo.lng,
            toaDo.lat,
            tenBangDB,
            ten,
            phanLoai,
            nhom,
            viTri,
            nguyCap,
          );
          map.closePopup();
        });
    }
  } else if (type === "polygon") {
    // Nếu chọn vẽ Rừng
    // Nếu chọn vẽ Rừng
    if (taiNguyenDangChon === "Tài nguyên Rừng") {
      // 🌟 Tuyệt kỹ khép kín chuỗi tọa độ Đa giác
      var latlngs = layer.getLatLngs()[0];
      var chuoiToaDo = "";
      for (var i = 0; i < latlngs.length; i++) {
        chuoiToaDo += latlngs[i].lng + "," + latlngs[i].lat + " ";
      }
      chuoiToaDo += latlngs[0].lng + "," + latlngs[0].lat; // Khép kín vòng

      var formDivRung = document.createElement("div");
      formDivRung.className = "wfs-form-container";

      // 🌟 ĐÃ XÓA ĐỊA CHỈ & ĐỐI TƯỢNG BẢO VỆ, THÊM NHÓM RỪNG
      formDivRung.innerHTML = `
        <h4 class="wfs-form-header" style="color: #2e7d32; border-color: #2e7d32;">THÊM TÀI NGUYÊN RỪNG</h4>
        <div class="wfs-form-group"><label>Tên rừng:</label><input type="text" id="inpTenRung" class="wfs-input" placeholder="Nhập tên rừng..."></div>
        <div class="wfs-form-group"><label>Nhóm rừng:</label><input type="text" id="inpNhomRung" class="wfs-input" placeholder="Ví dụ: Rừng tự nhiên..."></div>
        <div class="wfs-form-group"><label>Loại rừng:</label>
          <select id="inpLoaiRung" class="wfs-input">
            <option value="Rừng phòng hộ">Rừng phòng hộ</option><option value="Rừng đặc dụng">Rừng đặc dụng</option>
            <option value="Rừng sản xuất">Rừng sản xuất</option>
          </select>
        </div>
        <div class="wfs-form-group"><label>Tình trạng:</label>
          <select id="inpTinhTrangRung" class="wfs-input">
            <option value="Chưa xác định">Chưa xác định</option><option value="Ổn định-Bảo vệ">Ổn định-Bảo vệ</option>
            <option value="Cảnh báo cháy">Cảnh báo cháy</option><option value="Đang cháy" selected>Đang cháy</option>
            <option value="Bị suy thoái">Bị suy thoái</option><option value="Đang tái sinh">Đang tái sinh</option>
          </select>
        </div>
        <div class="wfs-form-group"><label>Diện tích (ha):</label><input type="number" id="inpDienTichRung" class="wfs-input" value="0"></div>
        <div class="wfs-button-group">
          <button id="btnHuyRung" class="wfs-btn wfs-btn-cancel">❌ HỦY</button>
          <button id="btnLuuRung" class="wfs-btn wfs-btn-save" style="background-color: #2e7d32;">💾 LƯU RỪNG</button>
        </div>
      `;

      layer.bindPopup(formDivRung).openPopup();

      formDivRung
        .querySelector("#btnHuyRung")
        .addEventListener("click", function () {
          map.closePopup();
          drawnItems.removeLayer(layer);
        });

      formDivRung
        .querySelector("#btnLuuRung")
        .addEventListener("click", function () {
          var ten = formDivRung.querySelector("#inpTenRung").value.trim();
          var nhom = formDivRung.querySelector("#inpNhomRung").value.trim();
          var loai = formDivRung.querySelector("#inpLoaiRung").value;
          var tinhTrang = formDivRung.querySelector("#inpTinhTrangRung").value;
          var dienTich = formDivRung.querySelector("#inpDienTichRung").value;

          if (!ten) {
            alert("Kiếp nạn! Tên rừng không được để trống!");
            return;
          }

          // 🌟 GIÁP BẢO VỆ CHỐNG RỖNG DỮ LIỆU
          if (!nhom) nhom = "Chưa xác định"; // Nếu để trống nhóm, tự điền chữ này
          if (!dienTich || dienTich === "") dienTich = 0; // Nếu bỏ trống diện tích, tự ép về số 0

          // Truyền 6 tham số
          phongDuLieuRungLenGeoServer(
            chuoiToaDo,
            ten,
            nhom,
            loai,
            tinhTrang,
            dienTich,
          );
          map.closePopup();
        });
    } else if (taiNguyenDangChon === "Tài nguyên Đất") {
      // 🌟 Tuyệt kỹ khép kín chuỗi tọa độ Đa giác
      var latlngs = layer.getLatLngs()[0];
      var chuoiToaDo = "";
      for (var i = 0; i < latlngs.length; i++) {
        chuoiToaDo += latlngs[i].lng + "," + latlngs[i].lat + " ";
      }
      chuoiToaDo += latlngs[0].lng + "," + latlngs[0].lat; // Khép kín vòng

      var formDivDat = document.createElement("div");
      formDivDat.className = "wfs-form-container";

      // 🌟 FORM ĐÃ ĐƯỢC CHUẨN HÓA THEO DATABASE THỰC TẾ
      formDivDat.innerHTML = `
        <h4 class="wfs-form-header" style="color: #795548; border-color: #795548;">THÊM TÀI NGUYÊN ĐẤT</h4>
        <div class="wfs-form-group"><label>Tên đất / Chủ sử dụng:</label><input type="text" id="TenDat" class="wfs-input" placeholder="Nhập tên đất..."></div>
        <div class="wfs-form-group"><label>Loại đất sử dụng:</label>
          <select id="loadatsudung" class="wfs-input">
            <option value="Đất chuyên trồng lúa nước">Đất chuyên trồng lúa nước</option>
            <option value="Đất trồng lúa nương">Đất trồng lúa nương</option>
            <option value="Đất trồng cây hàng năm khác">Đất trồng cây hàng năm khác</option>
            <option value="Đất trồng cây lâu năm">Đất trồng cây lâu năm</option>
            <option value="Đất rừng sản xuất">Đất rừng sản xuất</option>
            <option value="Đất nuôi trồng thủy sản">Đất nuôi trồng thủy sản</option>
            <option value="Đất ở tại đô thị">Đất ở tại đô thị</option>
            <option value="Đất ở tại nông thôn">Đất ở tại nông thôn</option>
          </select>
        </div>
        <div class="wfs-form-group"><label>Nhóm sử dụng:</label>
          <select id="nhomsudung" class="wfs-input">
            <option value="Đất nông nghiệp" selected>Đất nông nghiệp</option>
            <option value="Đất phi nông nghiệp">Đất phi nông nghiệp</option>
            <option value="Đất chưa sử dụng">Đất chưa sử dụng</option>
          </select>
        </div>
        <div class="wfs-flex-row">
            <div class="wfs-flex-col"><label>Diện tích (ha):</label><input type="number" id="inpDienTichHa" class="wfs-input" value="0"></div>
            <div class="wfs-flex-col"><label>Diện tích (m2):</label><input type="number" id="inpDienTichM2" class="wfs-input" value="0"></div>
        </div>
        <div class="wfs-button-group">
          <button id="btnHuyDat" class="wfs-btn wfs-btn-cancel">❌ HỦY</button>
          <button id="btnLuuDat" class="wfs-btn wfs-btn-save" style="background-color: #795548;">💾 LƯU ĐẤT</button>
        </div>
      `;

      layer.bindPopup(formDivDat).openPopup();

      formDivDat
        .querySelector("#btnHuyDat")
        .addEventListener("click", function () {
          map.closePopup();
          drawnItems.removeLayer(layer);
        });

      formDivDat
        .querySelector("#btnLuuDat")
        .addEventListener("click", function () {
          var ten = formDivDat.querySelector("#TenDat").value;
          var loai = formDivDat.querySelector("#loadatsudung").value;
          var nhomsudung = formDivDat.querySelector("#nhomsudung").value;
          var dienTichHa = formDivDat.querySelector("#inpDienTichHa").value;
          var dienTichM2 = formDivDat.querySelector("#inpDienTichM2").value;

          if (!ten) {
            alert("Kiếp nạn! Tên đất không được để trống!");
            return;
          }

          // Gọi hàm truyền ĐÚNG 6 tham số cần thiết
          phongDuLieuDatLenGeoServer(
            chuoiToaDo,
            ten,
            loai,
            nhomsudung,
            dienTichHa,
            dienTichM2,
          );
          map.closePopup();
        });
    }
  } else if (type === "polyline") {
    // Nếu chọn vẽ Nước
    if (taiNguyenDangChon === "Tài nguyên Nước") {
      // 🌟 Tuyệt kỹ lấy tọa độ Đường kẻ (Polyline) - KHÔNG CẦN KHÉP KÍN
      var latlngs = layer.getLatLngs();
      var chuoiToaDo = "";
      for (var i = 0; i < latlngs.length; i++) {
        chuoiToaDo += latlngs[i].lng + "," + latlngs[i].lat + " ";
      }
      chuoiToaDo = chuoiToaDo.trim(); // Cắt gọt khoảng trắng thừa ở cuối

      var formDivNuoc = document.createElement("div");
      formDivNuoc.className = "wfs-form-container";

      // 🌟 GIAO DIỆN KHỚP VỚI CÁC CỘT VÀ ENUM ĐẠO HỮU VỪA ĐƯA
      formDivNuoc.innerHTML = `
        <h4 class="wfs-form-header" style="color: #03a9f4; border-color: #03a9f4;">THÊM TÀI NGUYÊN NƯỚC</h4>
        <div class="wfs-form-group"><label>Tên sông/kênh:</label><input type="text" id="inpTenNuoc" class="wfs-input" placeholder="Nhập tên..."></div>
        <div class="wfs-form-group"><label>Loại:</label>
          <select id="inpLoaiNuoc" class="wfs-input">
            <option value="kênh">kênh</option>
            <option value="rạch">rạch</option>
            <option value="sông">sông</option>
          </select>
        </div>
        <div class="wfs-form-group"><label>Cấp:</label>
          <select id="inpCapNuoc" class="wfs-input">
            <option value="chính">chính</option>
            <option value="nhánh">nhánh</option>
          </select>
        </div>
        <div class="wfs-button-group">
          <button id="btnHuyNuoc" class="wfs-btn wfs-btn-cancel">❌ HỦY</button>
          <button id="btnLuuNuoc" class="wfs-btn wfs-btn-save" style="background-color: #03a9f4;">💾 LƯU NƯỚC</button>
        </div>
      `;

      layer.bindPopup(formDivNuoc).openPopup();

      formDivNuoc
        .querySelector("#btnHuyNuoc")
        .addEventListener("click", function () {
          map.closePopup();
          drawnItems.removeLayer(layer);
        });

      formDivNuoc
        .querySelector("#btnLuuNuoc")
        .addEventListener("click", function () {
          var ten = formDivNuoc.querySelector("#inpTenNuoc").value.trim();
          var loai = formDivNuoc.querySelector("#inpLoaiNuoc").value;
          var cap = formDivNuoc.querySelector("#inpCapNuoc").value;

          if (!ten) {
            alert("Kiếp nạn! Tên sông/kênh không được để trống!");
            return;
          }

          // Gọi hàm phóng dữ liệu hệ Thủy
          phongDuLieuNuocLenGeoServer(chuoiToaDo, ten, loai, cap);
          map.closePopup();
        });
    }
  }
});
// ==========================================
// PHẦN 3: TUYỆT KỸ WFS-T GỬI LÊN GEOSERVER
// ==========================================

// --- 3.1: Gửi Khoáng sản (Point) ---
function phongDuLieuLenGeoServer(
  kinhDo,
  viDo,
  tenTaiNguyen,
  loaiKhoangSan,
  tinhTrang,
  truLuong,
  dienTich,
  diaChi,
  doiTuongBaoVe,
) {
  const WORKSPACE = "angiang";
  const LAYER_NAME = "khoangsan_diem_mo";
  const GEOM_COLUMN = "geom";
  const NAME_COLUMN = "ten_don_vi";

  const wfsTransaction = `
        <wfs:Transaction service="WFS" version="1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:${WORKSPACE}="http://angiang.vn">
            <wfs:Insert>
                <${WORKSPACE}:${LAYER_NAME}>
                    <${WORKSPACE}:${GEOM_COLUMN}><gml:Point srsName="EPSG:4326"><gml:coordinates>${kinhDo},${viDo}</gml:coordinates></gml:Point></${WORKSPACE}:${GEOM_COLUMN}>
                    <${WORKSPACE}:${NAME_COLUMN}>${tenTaiNguyen}</${WORKSPACE}:${NAME_COLUMN}>
                    <${WORKSPACE}:loai_khoang_san>${loaiKhoangSan}</${WORKSPACE}:loai_khoang_san>
                    <${WORKSPACE}:tinh_trang>${tinhTrang}</${WORKSPACE}:tinh_trang>
                    <${WORKSPACE}:tru_luong>${truLuong}</${WORKSPACE}:tru_luong>
                    <${WORKSPACE}:dien_tich>${dienTich}</${WORKSPACE}:dien_tich>
                    <${WORKSPACE}:dia_chi>${diaChi}</${WORKSPACE}:dia_chi>
                    <${WORKSPACE}:doi_tuong_bao_ve>${doiTuongBaoVe}</${WORKSPACE}:doi_tuong_bao_ve>
                    <${WORKSPACE}:nguon_du_lieu>WebGIS An Giang</${WORKSPACE}:nguon_du_lieu>
                </${WORKSPACE}:${LAYER_NAME}>
            </wfs:Insert>
        </wfs:Transaction>`;

  fetch("/myproxy/angiang/ows", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      Authorization: "Basic " + btoa("admin:geoserver"),
    },
    body: wfsTransaction,
  })
    .then((r) => r.text())
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Khoáng sản! F12 xem chi tiết");
        console.log(data);
      } else {
        alert("Đại Công Cáo Thành! Đã lưu Khoáng sản!");
        drawnItems.clearLayers();
      }
    });
}

// --- 3.2: Gửi Rừng (Polygon) ---
function phongDuLieuRungLenGeoServer(
  chuoiToaDo,
  ten,
  nhom,
  loaiRung,
  tinhTrang,
  dienTich,
) {
  const WORKSPACE = "angiang";
  const LAYER_NAME = "rung";
  const GEOM_COLUMN = "geom";

  const geomXml = `<${WORKSPACE}:${GEOM_COLUMN}><gml:MultiPolygon srsName="EPSG:4326"><gml:polygonMember><gml:Polygon><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>${chuoiToaDo}</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></gml:polygonMember></gml:MultiPolygon></${WORKSPACE}:${GEOM_COLUMN}>`;

  // XML chỉ chứa các thẻ CÓ TRONG DATABASE
  const wfsTransaction = `
        <wfs:Transaction service="WFS" version="1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:${WORKSPACE}="http://angiang.vn">
            <wfs:Insert>
                <${WORKSPACE}:${LAYER_NAME}>
                    ${geomXml}
                    <${WORKSPACE}:ten>${ten}</${WORKSPACE}:ten>
                    <${WORKSPACE}:nhom>${nhom}</${WORKSPACE}:nhom>
                    <${WORKSPACE}:loai_rung>${loaiRung}</${WORKSPACE}:loai_rung>
                    <${WORKSPACE}:tinh_trang>${tinhTrang}</${WORKSPACE}:tinh_trang>
                    <${WORKSPACE}:dien_tich_ha>${dienTich}</${WORKSPACE}:dien_tich_ha>
                    <${WORKSPACE}:nguon_du_lieu>WebGIS An Giang</${WORKSPACE}:nguon_du_lieu>
                </${WORKSPACE}:${LAYER_NAME}>
            </wfs:Insert>
        </wfs:Transaction>`;

  fetch("/myproxy/angiang/ows", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      Authorization: "Basic " + btoa("admin:geoserver"),
    },
    body: wfsTransaction,
  })
    .then((r) => r.text())
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Rừng! F12 xem chi tiết");
        console.log("LỖI WFS-T RỪNG:", data);
      } else {
        alert("Đại Công Cáo Thành! Đã trồng thêm Rừng thành công!");
        drawnItems.clearLayers();
      }
    });
}
// --- 3.3: Gửi Đất (MultiPolygon) ---
function phongDuLieuDatLenGeoServer(
  chuoiToaDo,
  ten,
  loaiDat,
  nhomsudung,
  dienTichHa,
  dienTichM2,
) {
  const WORKSPACE = "angiang";
  const LAYER_NAME = "dat";
  const GEOM_COLUMN = "geom";

  // 🌟 TUYỆT KỸ ÉP DẸP: Gom toàn bộ GML thành 1 dòng duy nhất, không khoảng trắng!
  const geomXml = `<${WORKSPACE}:${GEOM_COLUMN}><gml:MultiPolygon srsName="EPSG:4326"><gml:polygonMember><gml:Polygon><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>${chuoiToaDo}</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></gml:polygonMember></gml:MultiPolygon></${WORKSPACE}:${GEOM_COLUMN}>`;

  const wfsTransaction = `
        <wfs:Transaction service="WFS" version="1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:${WORKSPACE}="http://angiang.vn">
            <wfs:Insert>
                <${WORKSPACE}:${LAYER_NAME}>
                    ${geomXml}
                    <${WORKSPACE}:ten>${ten}</${WORKSPACE}:ten>
                    <${WORKSPACE}:loai_dat_su_dung>${loaiDat}</${WORKSPACE}:loai_dat_su_dung>
                    <${WORKSPACE}:nhom_su_dung>${nhomsudung}</${WORKSPACE}:nhom_su_dung>
                    <${WORKSPACE}:dien_tich_ha>${dienTichHa}</${WORKSPACE}:dien_tich_ha>
                    <${WORKSPACE}:dien_tich_m2>${dienTichM2}</${WORKSPACE}:dien_tich_m2>
                    <${WORKSPACE}:nguon_du_lieu>WebGIS An Giang</${WORKSPACE}:nguon_du_lieu>
                </${WORKSPACE}:${LAYER_NAME}>
            </wfs:Insert>
        </wfs:Transaction>`;

  fetch("/myproxy/angiang/ows", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      Authorization: "Basic " + btoa("admin:geoserver"),
    },
    body: wfsTransaction,
  })
    .then((r) => r.text())
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Đất! F12 xem chi tiết");
        console.log("LỖI WFS-T ĐẤT:", data);
      } else {
        alert("Đại Công Cáo Thành! Đã lưu vùng Đất thành công!");
        drawnItems.clearLayers();
      }
    });
}
// --- 3.4: Gửi Nước (MultiLineString) - ÉP CHÂN KHÔNG CHỐNG LỖI STRING ---
function phongDuLieuNuocLenGeoServer(chuoiToaDo, ten, loai, cap) {
  const WORKSPACE = "angiang";
  const LAYER_NAME = "waterways";
  const GEOM_COLUMN = "geom";

  // 🌟 TUYỆT KỸ ÉP DẸP: Chuyển sang MultiLineString cho khớp Database
  const geomXml = `<${WORKSPACE}:${GEOM_COLUMN}><gml:MultiLineString srsName="EPSG:4326"><gml:lineStringMember><gml:LineString><gml:coordinates>${chuoiToaDo}</gml:coordinates></gml:LineString></gml:lineStringMember></gml:MultiLineString></${WORKSPACE}:${GEOM_COLUMN}>`;

  const wfsTransaction = `
        <wfs:Transaction service="WFS" version="1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:${WORKSPACE}="http://angiang.vn">
            <wfs:Insert>
                <${WORKSPACE}:${LAYER_NAME}>
                    ${geomXml}
                    <${WORKSPACE}:ten>${ten}</${WORKSPACE}:ten>
                    <${WORKSPACE}:loai>${loai}</${WORKSPACE}:loai>
                    <${WORKSPACE}:cap>${cap}</${WORKSPACE}:cap>
                    <${WORKSPACE}:nguon>WebGIS An Giang</${WORKSPACE}:nguon>
                </${WORKSPACE}:${LAYER_NAME}>
            </wfs:Insert>
        </wfs:Transaction>`;

  fetch("/myproxy/angiang/ows", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      Authorization: "Basic " + btoa("admin:geoserver"),
    },
    body: wfsTransaction,
  })
    .then((r) => r.text())
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Nước! F12 xem chi tiết");
        console.log("LỖI WFS-T NƯỚC:", data);
      } else {
        alert("Đại Công Cáo Thành! Đã khơi thông Thủy Mạch thành công!");
        drawnItems.clearLayers();
      }
    });
}
function phongDuLieuSinhVatLenGeoServer(
  kinhDo,
  viDo,
  tenBang,
  ten,
  phanLoai,
  nhom,
  viTri,
  nguyCap,
) {
  const WORKSPACE = "angiang";
  const GEOM_COLUMN = "geom";

  // 🌟 TRỞ VỀ CHUẨN ĐIỂM (POINT) VÌ GƯƠNG CHIẾU YÊU ĐÃ XÁC NHẬN!
  const geomXml = `<${WORKSPACE}:${GEOM_COLUMN}><gml:Point srsName="EPSG:4326"><gml:coordinates>${kinhDo},${viDo}</gml:coordinates></gml:Point></${WORKSPACE}:${GEOM_COLUMN}>`;

  const wfsTransaction = `
        <wfs:Transaction service="WFS" version="1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:${WORKSPACE}="http://angiang.vn">
            <wfs:Insert>
                <${WORKSPACE}:${tenBang}>
                    ${geomXml}
                    <${WORKSPACE}:ten_loai>${ten}</${WORKSPACE}:ten_loai>
                    <${WORKSPACE}:phan_loai>${phanLoai}</${WORKSPACE}:phan_loai>
                    <${WORKSPACE}:nhom>${nhom}</${WORKSPACE}:nhom>
                    <${WORKSPACE}:vi_tri_phan_bo>${viTri}</${WORKSPACE}:vi_tri_phan_bo>
                    <${WORKSPACE}:muc_do_nguy_cap>${nguyCap}</${WORKSPACE}:muc_do_nguy_cap>
                </${WORKSPACE}:${tenBang}>
            </wfs:Insert>
        </wfs:Transaction>`;

  fetch("/myproxy/angiang/ows", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      Authorization: "Basic " + btoa("admin:geoserver"),
    },
    body: wfsTransaction,
  })
    .then((r) => r.text())
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Sinh Vật! Đọc F12 để biết chi tiết nhé Đạo hữu!");
        console.log("LỖI WFS-T SINH VẬT:", data);
      } else {
        alert("Đại Công Cáo Thành! Đã thêm sinh vật thành công!");
        drawnItems.clearLayers();
      }
    });
}
