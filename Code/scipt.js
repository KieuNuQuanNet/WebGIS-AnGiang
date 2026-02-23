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
var urlWMS = "http://14.225.210.50:8080/geoserver/angiang/wms";

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

// =====================================================================
// PHẦN 3: KHỞI TẠO BẢN ĐỒ VÀ THIẾT LẬP GÓC NHÌN
// =====================================================================

var map = L.map("map", {
  center: [10.3711, 105.4328],
  zoom: 11,
  layers: [osmLayer], // Load sẵn nền OSM
});

var marker = L.marker([10.3711, 105.4328]).addTo(map);
marker.bindPopup("<b>Chào mừng đến với WebGIS An Giang!</b><br>Đây là trung tâm TP. Long Xuyên.").openPopup();

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
  var urlWFS = "http://14.225.210.50:8080/geoserver/angiang/ows?service=WFS&version=1.1.0&request=GetFeature&outputFormat=application/json&srsName=EPSG:4326&bbox=" + minx + "," + miny + "," + maxx + "," + maxy + ",EPSG:4326";

  // 1. LỚP KHOÁNG SẢN
  if (map.hasLayer(khoangsan)) {
    var pKhoangSan = fetch(urlWFS + "&typeName=angiang:khoangsan_diem_mo")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return "<div class='info-popup'><h4>Thông tin mỏ khoáng sản</h4><p><b>Tên đơn vị:</b> " + props.ten_don_vi + "</p><p><b>Loại:</b> " + props.loai_khoang_san + "</p><p><b>Tình trạng:</b> " + props.tinh_trang + "</p><p><b>Trữ lượng:</b> " + props.tru_luong + "</p><p><b>Diện tích:</b> " + props.dien_tich + "</p></div>";
        }
        return "";
      }).catch(() => "");
    promises.push(pKhoangSan);
  }

  // 2. LỚP RỪNG
  if (map.hasLayer(rung)) {
    var pRung = fetch(urlWFS + "&typeName=angiang:rung")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return "<div class='info-popup'><h4>Thông tin Rừng</h4><p><b>Nhóm:</b> " + props.nhom + "</p><p><b>Tên:</b> " + props.ten + "</p><p><b>Loại rừng:</b> " + props.loai_rung + "</p><p><b>Diện tích:</b> " + props.dien_tich_ha + " ha</p></div>";
        }
        return "";
      }).catch(() => "");
    promises.push(pRung);
  }

  // 3. LỚP NƯỚC
  if (map.hasLayer(nuoc)) {
    var pNuoc = fetch(urlWFS + "&typeName=angiang:waterways")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return "<div class='info-popup'><h4>Thông tin Nước</h4><p><b>Tên:</b> " + props.ten + "</p><p><b>Loại:</b> " + props.loai + "</p><p><b>Cấp:</b> " + props.cap + "</p></div>";
        }
        return "";
      }).catch(() => "");
    promises.push(pNuoc);
  }

  // 4. LỚP ĐẤT
  if (map.hasLayer(dat)) {
    var pDat = fetch(urlWFS + "&typeName=angiang:dat")
      .then((res) => res.json())
      .then((data) => {
        if (data.features.length > 0) {
          var props = data.features[0].properties;
          return "<div class='info-popup'><h4>Thông tin Đất</h4><p><b>Tên:</b> " + props.ten + "</p><p><b>Loại đất:</b> " + props.loai_dat_su_dung + "</p><p><b>Diện tích:</b> " + props.dien_tich_ha + " ha</p></div>";
        }
        return "";
      }).catch(() => "");
    promises.push(pDat);
  }

  // XỬ LÝ KẾT QUẢ HIỂN THỊ POPUP
  if (promises.length > 0) {
    Promise.all(promises).then((results) => {
      var validResults = results.filter((r) => r !== "");
      if (validResults.length > 0) {
        var finalHtml = validResults.join("<hr style='border: 0; border-top: 1px dashed #4caf50; margin: 10px 0;'>");
        L.popup().setLatLng(e.latlng).setContent(finalHtml).openOn(map);
      }
    });
  }
});