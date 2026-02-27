// =====================================================================
// PHẦN 1: KHAI BÁO CÁC LỚP BẢN ĐỒ NỀN (BASEMAPS)
// =====================================================================

var osmLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" },
);

var googleSatLayer = L.tileLayer(
  "http://mt0.google.com/vt/lyrs=s&hl=vi&x={x}&y={y}&z={z}",
  { maxZoom: 20, attribution: "&copy; Google Maps" },
);

// =====================================================================
// PHẦN 2: KHAI BÁO LỚP DỮ LIỆU WMS TỪ MÁY CHỦ VPS
// =====================================================================
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
  layers: [osmLayer],
});

var marker = L.marker([10.3711, 105.4328]).addTo(map);
marker
  .bindPopup(
    "<b>Chào mừng đến với WebGIS An Giang!</b><br>Đây là trung tâm TP. Long Xuyên.",
  )
  .openPopup();

var CustomLayerControl = L.Control.extend({
  options: { position: "topright" },

  onAdd: function (map) {
    var container = L.DomUtil.create(
      "div",
      "leaflet-control-layers leaflet-control",
    );
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    // Đã thêm thanh cuộn (max-height) để danh sách siêu dài không bị tràn màn hình
    container.innerHTML = `
      <a class="leaflet-control-layers-toggle" href="#" title="Layers"></a>
      <form class="leaflet-control-layers-list" style="max-height: 70vh; overflow-y: auto; overflow-x: hidden; padding-right: 5px;">
        
        <!-- NỀN BẢN ĐỒ -->
        <div class="leaflet-control-layers-base">
          <div class="lop-ban-do"><label><input type="radio" name="basemap" value="osm" checked> <span> Bản đồ Đường phố (OSM)</span></label></div>
          <div class="lop-ban-do"><label><input type="radio" name="basemap" value="google"> <span> Bản đồ Vệ tinh (Google)</span></label></div>
        </div>

        <div class="leaflet-control-layers-separator" style="margin: 8px 0; border-top: 1px solid #ddd;"></div>

        <!-- CÁC LỚP GEOSERVER -->
        <div class="leaflet-control-layers-overlays">
          
          <!-- LỚP RỪNG -->
          <div class="lop-ban-do">
            <div class="layer-main-row">
              <label><input type="checkbox" id="chkRung"> <span> Tài nguyên Rừng</span></label>
              <span class="toggle-arrow" id="arrRung" onclick="toggleBoLoc('filRung', 'arrRung')">V</span>
            </div>
            <div class="layer-filter-row hidden" id="filRung">
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-rung" value="Rừng phòng hộ"> Rừng phòng hộ</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-rung" value="Rừng đặc dụng"> Rừng đặc dụng</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-rung" value="Rừng sản xuất"> Rừng sản xuất</label></div>
            </div>
          </div>

          <!-- LỚP ĐẤT (Cập nhật 8 loại theo Form Thêm) -->
          <div class="lop-ban-do">
            <div class="layer-main-row">
              <label><input type="checkbox" id="chkDat"> <span> Tài nguyên Đất</span></label>
              <span class="toggle-arrow" id="arrDat" onclick="toggleBoLoc('filDat', 'arrDat')">V</span>
            </div>
            <div class="layer-filter-row hidden" id="filDat">
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dat" value="Đất chuyên trồng lúa nước"> Đất trồng lúa nước</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dat" value="Đất trồng lúa nương"> Đất trồng lúa nương</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dat" value="Đất trồng cây hàng năm khác"> Đất cây hàng năm khác</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dat" value="Đất trồng cây lâu năm"> Đất trồng cây lâu năm</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dat" value="Đất rừng sản xuất"> Đất rừng sản xuất</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dat" value="Đất nuôi trồng thủy sản"> Đất nuôi trồng thủy sản</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dat" value="Đất ở tại đô thị"> Đất ở tại đô thị</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dat" value="Đất ở tại nông thôn"> Đất ở tại nông thôn</label></div>
            </div>
          </div>

          <!-- LỚP NƯỚC (Cập nhật Sông/Kênh/Rạch) -->
          <div class="lop-ban-do">
            <div class="layer-main-row">
              <label><input type="checkbox" id="chkNuoc"> <span> Tài nguyên Nước</span></label>
              <span class="toggle-arrow" id="arrNuoc" onclick="toggleBoLoc('filNuoc', 'arrNuoc')">V</span>
            </div>
            <div class="layer-filter-row hidden" id="filNuoc">
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-nuoc" value="sông"> Sông</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-nuoc" value="kênh"> Kênh</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-nuoc" value="rạch"> Rạch</label></div>
            </div>
          </div>

          <!-- LỚP KHOÁNG SẢN (Cập nhật 8 loại) -->
          <div class="lop-ban-do">
            <div class="layer-main-row">
              <label><input type="checkbox" id="chkKhoangSan"> <span> Mỏ Khoáng Sản</span></label>
              <span class="toggle-arrow" id="arrKhoangSan" onclick="toggleBoLoc('filKhoangSan', 'arrKhoangSan')">V</span>
            </div>
            <div class="layer-filter-row hidden" id="filKhoangSan">
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-khoangsan" value="Đá xây dựng"> Đá xây dựng</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-khoangsan" value="Sét gạch ngói"> Sét gạch ngói</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-khoangsan" value="Cát xây dựng"> Cát xây dựng</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-khoangsan" value="Cát san lấp"> Cát san lấp</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-khoangsan" value="Đất đá san lấp"> Đất đá san lấp</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-khoangsan" value="Đá vôi"> Đá vôi</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-khoangsan" value="Than bùn"> Than bùn</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-khoangsan" value="Chưa phân loại"> Chưa phân loại</label></div>
            </div>
          </div>

          <!-- LỚP ĐỘNG VẬT -->
          <div class="lop-ban-do">
            <div class="layer-main-row">
              <label><input type="checkbox" id="chkDongVat"> <span> Động vật hoang dã</span></label>
              <span class="toggle-arrow" id="arrDongVat" onclick="toggleBoLoc('filDongVat', 'arrDongVat')">V</span>
            </div>
            <div class="layer-filter-row hidden" id="filDongVat">
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dongvat" value="Bình thường"> Bình thường</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dongvat" value="Ít quan tâm (LC)"> Ít quan tâm (LC)</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dongvat" value="Sắp nguy cấp (VU)"> Sắp nguy cấp (VU)</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dongvat" value="Nguy cấp (EN)"> Nguy cấp (EN)</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-dongvat" value="Cực kỳ nguy cấp (CR)"> Cực kỳ nguy cấp (CR)</label></div>
            </div>
          </div>

          <!-- LỚP THỰC VẬT -->
          <div class="lop-ban-do">
            <div class="layer-main-row">
              <label><input type="checkbox" id="chkThucVat"> <span> Thực vật quý hiếm</span></label>
              <span class="toggle-arrow" id="arrThucVat" onclick="toggleBoLoc('filThucVat', 'arrThucVat')">V</span>
            </div>
            <div class="layer-filter-row hidden" id="filThucVat">
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-thucvat" value="Bình thường"> Bình thường</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-thucvat" value="Ít quan tâm (LC)"> Ít quan tâm (LC)</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-thucvat" value="Sắp nguy cấp (VU)"> Sắp nguy cấp (VU)</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-thucvat" value="Nguy cấp (EN)"> Nguy cấp (EN)</label></div>
              <div class="lop-thuoc-tinh"><label><input type="checkbox" class="sub-thucvat" value="Cực kỳ nguy cấp (CR)"> Cực kỳ nguy cấp (CR)</label></div>
            </div>
          </div>

        </div>
      </form>
    `;

    container.addEventListener("mouseenter", function () {
      container.classList.add("leaflet-control-layers-expanded");
    });
    container.addEventListener("mouseleave", function () {
      container.classList.remove("leaflet-control-layers-expanded");
    });

    return container;
  },
});

map.addControl(new CustomLayerControl());

// ------------------------------------------
// HÀM LOGIC CHO BẢNG LAYER
// ------------------------------------------

document.querySelectorAll('input[name="basemap"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    if (this.value === "osm") {
      map.addLayer(osmLayer);
      map.removeLayer(googleSatLayer);
    } else {
      map.addLayer(googleSatLayer);
      map.removeLayer(osmLayer);
    }
  });
});

window.toggleBoLoc = function (boxId, arrowId) {
  document.getElementById(boxId).classList.toggle("hidden");
  document.getElementById(arrowId).classList.toggle("open");
};

function capNhatLopWMS(layerWMS, chkMainId, subClassName, columnName) {
  var chkMain = document.getElementById(chkMainId);
  if (!chkMain.checked) {
    map.removeLayer(layerWMS);
    return;
  }
  if (!map.hasLayer(layerWMS)) map.addLayer(layerWMS);

  var cacOTick = document.querySelectorAll("." + subClassName + ":checked");
  var tongSoOPhu = document.querySelectorAll("." + subClassName).length;

  if (cacOTick.length === 0) {
    map.removeLayer(layerWMS);
  } else if (cacOTick.length === tongSoOPhu) {
    delete layerWMS.wmsParams.CQL_FILTER;
    layerWMS.redraw();
  } else {
    var mangGiaTri = Array.from(cacOTick).map(
      (chk) => `${columnName} = '${chk.value}'`,
    );
    var cqlString = mangGiaTri.join(" OR ");
    layerWMS.setParams({ CQL_FILTER: cqlString });
  }
}

function dongBoCheckbox(chkMainId, subClassName, layerWMS, columnName) {
  var chkMain = document.getElementById(chkMainId);
  var subChks = document.querySelectorAll("." + subClassName);

  chkMain.addEventListener("change", function () {
    var isChecked = this.checked;
    subChks.forEach((chk) => (chk.checked = isChecked));
    capNhatLopWMS(layerWMS, chkMainId, subClassName, columnName);
  });

  subChks.forEach((chk) => {
    chk.addEventListener("change", function () {
      var anyChecked = document.querySelector("." + subClassName + ":checked");
      chkMain.checked = !!anyChecked;
      capNhatLopWMS(layerWMS, chkMainId, subClassName, columnName);
    });
  });
}

function kichHoat(chkMainId, subClassName, layerWMS, columnName) {
  dongBoCheckbox(chkMainId, subClassName, layerWMS, columnName);
  capNhatLopWMS(layerWMS, chkMainId, subClassName, columnName);
}

// 🌟 ĐÃ CẬP NHẬT TÊN CỘT DATABASE CHO KHỚP VỚI DANH SÁCH MỚI
kichHoat("chkRung", "sub-rung", rung, "loai_rung");
kichHoat("chkDat", "sub-dat", dat, "loai_dat_su_dung"); // Đổi từ nhom_su_dung sang loai_dat_su_dung
kichHoat("chkNuoc", "sub-nuoc", nuoc, "loai"); // Đổi từ cap sang loai
kichHoat("chkKhoangSan", "sub-khoangsan", khoangsan, "loai_khoang_san"); // Đổi từ tinh_trang sang loai_khoang_san
kichHoat("chkDongVat", "sub-dongvat", dongvat, "muc_do_nguy_cap");
kichHoat("chkThucVat", "sub-thucvat", thucvat, "muc_do_nguy_cap");
// =====================================================================
// 🌟 TUYỆT KỸ MỚI: TỪ ĐIỂN DỊCH TÊN CỘT DATABASE SANG TIẾNG VIỆT
// =====================================================================
const TU_DIEN_COT = {
  ten: "Tên tài nguyên",
  ten_don_vi: "Tên mỏ / Đơn vị",
  ten_loai: "Tên loài sinh vật",
  nhom: "Nhóm",
  loai: "Loại",
  loai_rung: "Loại rừng",
  loai_khoang_san: "Loại khoáng sản",
  loai_dat_su_dung: "Loại đất",
  nhom_su_dung: "Nhóm sử dụng",
  tinh_trang: "Tình trạng",
  dien_tich: "Diện tích",
  dien_tich_ha: "Diện tích (Hecta)",
  dien_tich_m2: "Diện tích (m2)",
  tru_luong: "Trữ lượng",
  dia_chi: "Địa chỉ",
  doi_tuong_bao_ve: "Đối tượng bảo vệ",
  cap: "Cấp",
  phan_loai: "Phân loại",
  vi_tri_phan_bo: "Vị trí phân bố",
  muc_do_nguy_cap: "Mức độ nguy cấp",
  nguon_du_lieu: "Nguồn dữ liệu",
  nguon: "Nguồn tham khảo",
};

// =====================================================================
// GIAI ĐOẠN 2: CLICK LẤY THÔNG TIN & SỬA XÓA (WFS GETFEATURE & WFS-T)
// =====================================================================

map.on("click", function (e) {
  var tolerance = 0.001;
  var minx = e.latlng.lng - tolerance;
  var miny = e.latlng.lat - tolerance;
  var maxx = e.latlng.lng + tolerance;
  var maxy = e.latlng.lat + tolerance;
  var promises = [];
  var urlWFS = `/myproxy/angiang/ows?service=WFS&version=1.1.0&request=GetFeature&outputFormat=application/json&srsName=EPSG:4326&bbox=${minx},${miny},${maxx},${maxy},EPSG:4326`;

  // 1. Dò tìm trên các lớp đang hiển thị
  if (map.hasLayer(khoangsan))
    promises.push(
      fetch(urlWFS + "&typeName=angiang:khoangsan_diem_mo")
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0)
            return {
              feature: data.features[0],
              layerName: "angiang:khoangsan_diem_mo",
              layerObj: khoangsan,
              tieuDe: "Khoáng sản",
            };
          return null;
        })
        .catch(() => null),
    );
  if (map.hasLayer(rung))
    promises.push(
      fetch(urlWFS + "&typeName=angiang:rung")
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0)
            return {
              feature: data.features[0],
              layerName: "angiang:rung",
              layerObj: rung,
              tieuDe: "Rừng",
            };
          return null;
        })
        .catch(() => null),
    );
  if (map.hasLayer(nuoc))
    promises.push(
      fetch(urlWFS + "&typeName=angiang:waterways")
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0)
            return {
              feature: data.features[0],
              layerName: "angiang:waterways",
              layerObj: nuoc,
              tieuDe: "Nước",
            };
          return null;
        })
        .catch(() => null),
    );
  if (map.hasLayer(dat))
    promises.push(
      fetch(urlWFS + "&typeName=angiang:dat")
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0)
            return {
              feature: data.features[0],
              layerName: "angiang:dat",
              layerObj: dat,
              tieuDe: "Đất",
            };
          return null;
        })
        .catch(() => null),
    );
  if (map.hasLayer(dongvat))
    promises.push(
      fetch(urlWFS + "&typeName=angiang:dongvat")
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0)
            return {
              feature: data.features[0],
              layerName: "angiang:dongvat",
              layerObj: dongvat,
              tieuDe: "Động vật",
            };
          return null;
        })
        .catch(() => null),
    );
  if (map.hasLayer(thucvat))
    promises.push(
      fetch(urlWFS + "&typeName=angiang:thucvat")
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0)
            return {
              feature: data.features[0],
              layerName: "angiang:thucvat",
              layerObj: thucvat,
              tieuDe: "Thực vật",
            };
          return null;
        })
        .catch(() => null),
    );

  // 2. XỬ LÝ KẾT QUẢ VÀ TẠO GIAO DIỆN POPUP
  Promise.all(promises).then((results) => {
    var validResults = results.filter((r) => r !== null);
    if (validResults.length > 0) {
      var containerDiv = document.createElement("div");

      // CHẶN XUYÊN THẤU XUỐNG BẢN ĐỒ
      L.DomEvent.disableClickPropagation(containerDiv);
      L.DomEvent.disableScrollPropagation(containerDiv);

      validResults.forEach((item) => {
        var featureId = item.feature.id;
        var props = item.feature.properties;

        var block = document.createElement("div");
        block.className = "info-popup";

        // 👉 DÙNG TỪ ĐIỂN ĐỂ IN RA TÊN ĐẸP CHO POPUP
        var htmlInfo = `<h4>Thông tin ${item.tieuDe}</h4>`;
        for (var key in props) {
          // Bỏ qua ID, tọa độ, và các cột rỗng (null hoặc "")
          if (
            key !== "bbox" &&
            key !== "geom" &&
            key !== "id" &&
            props[key] !== null &&
            props[key] !== ""
          ) {
            var tenHienThi = TU_DIEN_COT[key] || key; // Nếu có trong từ điển thì lấy tên đẹp, không thì lấy tên gốc
            htmlInfo += `<p><b>${tenHienThi}:</b> <span class="val-display">${props[key]}</span></p>`;
          }
        }

        // Gắn nút Sửa và Xóa
        htmlInfo += `
          <div class="popup-actions">
            <button class="btn-popup btn-edit">✏️ SỬA</button>
            <button class="btn-popup btn-delete">🗑️ XÓA</button>
          </div>
        `;
        block.innerHTML = htmlInfo;

        // BẮT SỰ KIỆN: XÓA DỮ LIỆU
        block
          .querySelector(".btn-delete")
          .addEventListener("click", function (e) {
            L.DomEvent.stop(e);
            if (
              confirm(
                `Đạo hữu có chắc chắn muốn XÓA đối tượng này khỏi cơ sở dữ liệu không?`,
              )
            ) {
              this.innerHTML = "⏳ Đang xóa...";
              xoaDuLieuWFS(item.layerName, featureId, item.layerObj);
            }
          });

        // BẮT SỰ KIỆN: MỞ FORM SỬA
        block
          .querySelector(".btn-edit")
          .addEventListener("click", function (e) {
            L.DomEvent.stop(e);
            moFormSuaDoi(
              block,
              item.layerName,
              featureId,
              props,
              item.layerObj,
            );
          });

        containerDiv.appendChild(block);
        containerDiv.appendChild(document.createElement("hr"));
      });

      L.popup().setLatLng(e.latlng).setContent(containerDiv).openOn(map);
    }
  });
});

// =====================================================================
// HÀM 1: BIẾN POPUP THÀNH FORM SỬA CHỮA (CÓ DÙNG TỪ ĐIỂN)
// =====================================================================
function moFormSuaDoi(blockElement, layerName, featureId, props, layerObj) {
  var formHtml = `<div class='wfs-form-container'><h4 class="wfs-form-header" style="color:#2196F3; border-color:#2196F3;">CẬP NHẬT DỮ LIỆU</h4>`;

  // 👉 DÙNG TỪ ĐIỂN ĐỂ IN RA TÊN ĐẸP CHO FORM SỬA
  for (var key in props) {
    if (key !== "bbox" && key !== "geom" && key !== "id") {
      var tenHienThi = TU_DIEN_COT[key] || key;
      formHtml += `
              <div class="wfs-form-group">
                <label>${tenHienThi}:</label>
                <!-- data-key giữ nguyên tên gốc để DB hiểu, value lấy dữ liệu hiện tại -->
                <input type='text' class='wfs-input edit-input' data-key='${key}' value='${props[key] || ""}'>
              </div>`;
    }
  }
  formHtml += `
        <div class="wfs-button-group">
            <button class='wfs-btn wfs-btn-cancel' id='btnHuySua' style="background-color:#9e9e9e;">HỦY</button> 
            <button class='wfs-btn wfs-btn-save' id='btnLuuSua' style="background-color:#2196F3;">💾 LƯU LẠI</button>
        </div>
    </div>`;

  blockElement.innerHTML = formHtml; // Biến hình giao diện!

  // Nút Hủy
  blockElement.querySelector("#btnHuySua").addEventListener("click", (e) => {
    L.DomEvent.stop(e);
    map.closePopup();
  });

  // Nút Lưu
  blockElement
    .querySelector("#btnLuuSua")
    .addEventListener("click", function (e) {
      L.DomEvent.stop(e);
      this.innerHTML = "⏳ Đang lưu...";
      var updatedProps = {};

      // Càn quét qua tất cả các ô Input để lấy chữ mới, dùng 'data-key' để đưa về tên cột Postgres gốc
      blockElement.querySelectorAll(".edit-input").forEach((input) => {
        updatedProps[input.getAttribute("data-key")] = input.value;
      });

      suaDuLieuWFS(layerName, featureId, updatedProps, layerObj);
    });
}

// =====================================================================
// ===============================
// API helper: gọi backend WFS-T (RBAC + JWT)
// ===============================
const API_BASE = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("webgis_token");
}

async function postWFST(action, layer, xml) {
  const token = getToken();
  if (!token) throw new Error("Chưa đăng nhập (thiếu webgis_token)");

  const res = await fetch(`${API_BASE}/api/wfst`, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      Authorization: `Bearer ${token}`,
      "X-Action": action, // insert | update | delete
      "X-Layer": layer, // ví dụ: angiang:dat
    },
    body: xml,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text; // XML/JSON trả về từ backend/GeoServer
}

// TUYỆT KỸ WFS-T 1: GỬI LỆNH UPDATE LÊN GEOSERVER (SỬA DỮ LIỆU)
// =====================================================================
function suaDuLieuWFS(layerName, featureId, updatedProps, layerObj) {
  var workspace = layerName.split(":")[0];

  var propXml = "";
  for (var key in updatedProps) {
    propXml += `<wfs:Property><wfs:Name>${key}</wfs:Name><wfs:Value>${updatedProps[key]}</wfs:Value></wfs:Property>`;
  }

  var wfsTx = `
        <wfs:Transaction service="WFS" version="1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:${workspace}="http://angiang.vn">
            <wfs:Update typeName="${layerName}">
                ${propXml}
                <ogc:Filter>
                    <ogc:FeatureId fid="${featureId}"/>
                </ogc:Filter>
            </wfs:Update>
        </wfs:Transaction>`;

  postWFST("update", layerName, wfsTx)
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi khi sửa dữ liệu! Mở F12 để xem chi tiết.");
        console.log(data);
      } else {
        alert("✅ Cập nhật dữ liệu thành công!");
        map.closePopup();
        layerObj.setParams({ fake: Date.now() }, false);
      }
    })
    .catch((e) => {
      const msg = e && e.message ? e.message : String(e);
      alert("❌ " + msg);
      console.error(e);
    });
}

// =====================================================================
// TUYỆT KỸ WFS-T 2: GỬI LỆNH DELETE LÊN GEOSERVER (XÓA DỮ LIỆU)
// =====================================================================
function xoaDuLieuWFS(layerName, featureId, layerObj) {
  var wfsTx = `
        <wfs:Transaction service="WFS" version="1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc">
            <wfs:Delete typeName="${layerName}">
                <ogc:Filter>
                    <ogc:FeatureId fid="${featureId}"/>
                </ogc:Filter>
            </wfs:Delete>
        </wfs:Transaction>`;

  postWFST("delete", layerName, wfsTx)
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi khi xóa dữ liệu! Mở F12 để xem.");
        console.log(data);
      } else {
        alert("🔥 Đã diệt trừ đối tượng khỏi Cơ sở dữ liệu thành công!");
        map.closePopup();
        layerObj.setParams({ fake: Date.now() }, false);
      }
    })
    .catch((e) => {
      const msg = e && e.message ? e.message : String(e);
      alert("❌ " + msg);
      console.error(e);
    });
}

// =====================================================================
// PHẦN DRAW VÀ LƯU DỮ LIỆU (TẠO MỚI TÀI NGUYÊN)
// =====================================================================

const btnThemTaiNguyen = document.getElementById("btnThemTaiNguyen");
const danhSachTaiNguyen = document.getElementById("danhSachTaiNguyen");

var taiNguyenDangChon = "";
const cacLoaiTaiNguyen = document.querySelectorAll(".resource-item");
const menuTaiNguyen = document.getElementById("danhSachTaiNguyen");

cacLoaiTaiNguyen.forEach(function (item) {
  item.addEventListener("click", function () {
    const loaiHinh = this.getAttribute("data-loai");
    taiNguyenDangChon = this.getAttribute("data-ten");
    menuTaiNguyen.classList.add("hidden");

    if (loaiHinh === "polygon") {
      new L.Draw.Polygon(map).enable();
    } else if (loaiHinh === "polyline") {
      new L.Draw.Polyline(map).enable();
    } else if (loaiHinh === "point") {
      new L.Draw.Marker(map).enable();
    }
    alert("Chọn vị trí trên bản đồ để vẽ/chấm điểm cho: " + taiNguyenDangChon);
  });
});

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

map.on("draw:created", function (e) {
  var type = e.layerType;
  var layer = e.layer;
  drawnItems.addLayer(layer);

  // 1. NHÁNH VẼ ĐIỂM (MỎ KHOÁNG SẢN HOẶC SINH VẬT)
  if (type === "marker") {
    var toaDo = layer.getLatLng();

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
    } else if (
      taiNguyenDangChon === "Tài nguyên Động vật" ||
      taiNguyenDangChon === "Tài nguyên Thực vật"
    ) {
      var isDongVat = taiNguyenDangChon === "Tài nguyên Động vật";
      var tieuDe = isDongVat ? "THÊM ĐỘNG VẬT" : "THÊM THỰC VẬT";
      var mauNen = isDongVat ? "#e65100" : "#33691e";
      var tenBangDB = isDongVat ? "dongvat" : "thucvat";

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
    if (taiNguyenDangChon === "Tài nguyên Rừng") {
      var latlngs = layer.getLatLngs()[0];
      var chuoiToaDo = "";
      for (var i = 0; i < latlngs.length; i++) {
        chuoiToaDo += latlngs[i].lng + "," + latlngs[i].lat + " ";
      }
      chuoiToaDo += latlngs[0].lng + "," + latlngs[0].lat;

      var formDivRung = document.createElement("div");
      formDivRung.className = "wfs-form-container";
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
          if (!nhom) nhom = "Chưa xác định";
          if (!dienTich || dienTich === "") dienTich = 0;

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
      var latlngs = layer.getLatLngs()[0];
      var chuoiToaDo = "";
      for (var i = 0; i < latlngs.length; i++) {
        chuoiToaDo += latlngs[i].lng + "," + latlngs[i].lat + " ";
      }
      chuoiToaDo += latlngs[0].lng + "," + latlngs[0].lat;

      var formDivDat = document.createElement("div");
      formDivDat.className = "wfs-form-container";
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
    if (taiNguyenDangChon === "Tài nguyên Nước") {
      var latlngs = layer.getLatLngs();
      var chuoiToaDo = "";
      for (var i = 0; i < latlngs.length; i++) {
        chuoiToaDo += latlngs[i].lng + "," + latlngs[i].lat + " ";
      }
      chuoiToaDo = chuoiToaDo.trim();

      var formDivNuoc = document.createElement("div");
      formDivNuoc.className = "wfs-form-container";
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

          phongDuLieuNuocLenGeoServer(chuoiToaDo, ten, loai, cap);
          map.closePopup();
        });
    }
  }
});
// ==========================================
// PHẦN 5: TUYỆT KỸ WFS-T GỬI LÊN GEOSERVER
// ==========================================

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
  const wfsTransaction = `
        <wfs:Transaction service="WFS" version="1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:${WORKSPACE}="http://angiang.vn">
            <wfs:Insert>
                <${WORKSPACE}:${LAYER_NAME}>
                    <${WORKSPACE}:geom><gml:Point srsName="EPSG:4326"><gml:coordinates>${kinhDo},${viDo}</gml:coordinates></gml:Point></${WORKSPACE}:geom>
                    <${WORKSPACE}:ten_don_vi>${tenTaiNguyen}</${WORKSPACE}:ten_don_vi>
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

  postWFST("insert", `${WORKSPACE}:${LAYER_NAME}`, wfsTransaction)
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Khoáng sản! F12 xem chi tiết");
        console.log(data);
      } else {
        alert("Đại Công Cáo Thành! Đã lưu Khoáng sản!");
        drawnItems.clearLayers();
      }
    })
    .catch((e) => {
      const msg = e && e.message ? e.message : String(e);
      alert("❌ " + msg);
      console.error(e);
    });
}

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
  const geomXml = `<${WORKSPACE}:geom><gml:MultiPolygon srsName="EPSG:4326"><gml:polygonMember><gml:Polygon><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>${chuoiToaDo}</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></gml:polygonMember></gml:MultiPolygon></${WORKSPACE}:geom>`;
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

  postWFST("insert", `${WORKSPACE}:${LAYER_NAME}`, wfsTransaction)
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Rừng! F12 xem chi tiết");
        console.log(data);
      } else {
        alert("Đại Công Cáo Thành! Đã trồng thêm Rừng thành công!");
        drawnItems.clearLayers();
      }
    })
    .catch((e) => {
      const msg = e && e.message ? e.message : String(e);
      alert("❌ " + msg);
      console.error(e);
    });
}

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
  const geomXml = `<${WORKSPACE}:geom><gml:MultiPolygon srsName="EPSG:4326"><gml:polygonMember><gml:Polygon><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>${chuoiToaDo}</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></gml:polygonMember></gml:MultiPolygon></${WORKSPACE}:geom>`;
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

  postWFST("insert", `${WORKSPACE}:${LAYER_NAME}`, wfsTransaction)
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Đất! F12 xem chi tiết");
        console.log(data);
      } else {
        alert("Đại Công Cáo Thành! Đã lưu vùng Đất thành công!");
        drawnItems.clearLayers();
      }
    })
    .catch((e) => {
      const msg = e && e.message ? e.message : String(e);
      alert("❌ " + msg);
      console.error(e);
    });
}

function phongDuLieuNuocLenGeoServer(chuoiToaDo, ten, loai, cap) {
  const WORKSPACE = "angiang";
  const LAYER_NAME = "waterways";
  const geomXml = `<${WORKSPACE}:geom><gml:MultiLineString srsName="EPSG:4326"><gml:lineStringMember><gml:LineString><gml:coordinates>${chuoiToaDo}</gml:coordinates></gml:LineString></gml:lineStringMember></gml:MultiLineString></${WORKSPACE}:geom>`;
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

  postWFST("insert", `${WORKSPACE}:${LAYER_NAME}`, wfsTransaction)
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Nước! F12 xem chi tiết");
        console.log(data);
      } else {
        alert("Đại Công Cáo Thành! Đã khơi thông Thủy Mạch thành công!");
        drawnItems.clearLayers();
      }
    })
    .catch((e) => {
      const msg = e && e.message ? e.message : String(e);
      alert("❌ " + msg);
      console.error(e);
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
  const geomXml = `<${WORKSPACE}:geom><gml:Point srsName="EPSG:4326"><gml:coordinates>${kinhDo},${viDo}</gml:coordinates></gml:Point></${WORKSPACE}:geom>`;
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

  postWFST("insert", `${WORKSPACE}:${tenBang}`, wfsTransaction)
    .then((data) => {
      if (data.includes("Exception") || data.includes("Error")) {
        alert("Lỗi Sinh Vật! Đọc F12 xem chi tiết!");
        console.log(data);
      } else {
        alert("Đại Công Cáo Thành! Đã thêm sinh vật thành công!");
        drawnItems.clearLayers();
      }
    })
    .catch((e) => {
      const msg = e && e.message ? e.message : String(e);
      alert("❌ " + msg);
      console.error(e);
    });
}

// ==========================================
// PHẦN 6: TÌM KIẾM ĐA LUỒNG VÀ HIỂN THỊ FULL POPUP
// ==========================================
const inpSearch = document.getElementById("inpSearch");
const btnSearch = document.getElementById("btnSearch");
const searchResults = document.getElementById("searchResults");

function thucThiTimKiem() {
  var query = inpSearch.value.trim();
  if (!query) return;

  // 1. Mở rộng tìm kiếm: Tìm cả theo Tên và Loại/Phân loại
  const cacLopCanTim = [
    {
      layer: "angiang:dongvat",
      cols: ["ten_loai", "phan_loai"],
      label: "Động vật",
    },
    {
      layer: "angiang:thucvat",
      cols: ["ten_loai", "phan_loai"],
      label: "Thực vật",
    },
    { layer: "angiang:rung", cols: ["ten", "loai_rung"], label: "Rừng" },
    { layer: "angiang:dat", cols: ["ten", "loai_dat_su_dung"], label: "Đất" },
    { layer: "angiang:waterways", cols: ["ten", "loai"], label: "Nước" },
    {
      layer: "angiang:khoangsan_diem_mo",
      cols: ["ten_don_vi", "loai_khoang_san"],
      label: "Khoáng sản",
    },
  ];

  searchResults.classList.remove("hidden");
  searchResults.innerHTML =
    "<div class='search-item'>⏳ Đang tìm kiếm...</div>";

  const promises = cacLopCanTim.map((config) => {
    let filter = config.cols.map((c) => `${c} ILIKE '%${query}%'`).join(" OR ");
    let url = `/myproxy/angiang/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${config.layer}&outputFormat=application/json&CQL_FILTER=${encodeURIComponent(filter)}`;

    return fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.features) return [];
        return data.features.map((f) => ({
          ten:
            f.properties.ten ||
            f.properties.ten_don_vi ||
            f.properties.ten_loai ||
            "Không xác định",
          loai: config.label,
          feature: f,
        }));
      })
      .catch(() => []);
  });

  Promise.all(promises).then((mangKetQua) => {
    let tatCaKetQua = mangKetQua.flat();
    searchResults.innerHTML = "";

    if (tatCaKetQua.length === 0) {
      searchResults.innerHTML =
        "<div class='search-item' style='color:#d32f2f;'>❌ Không tìm thấy kết quả!</div>";
    } else {
      tatCaKetQua.forEach((item) => {
        var div = document.createElement("div");
        div.className = "search-item";
        div.innerHTML = `<b>${item.ten}</b><small>Tài nguyên: ${item.loai}</small>`;

        div.addEventListener("click", function () {
          var geojsonLayer = L.geoJSON(item.feature);
          var tamDiem = geojsonLayer.getBounds().getCenter();
          map.flyTo(tamDiem, 15, { duration: 1.5 });

          setTimeout(() => {
            // 🌟 2. BÍ QUYẾT Ở ĐÂY: Vòng lặp in ra toàn bộ thông tin trong Popup
            let props = item.feature.properties;
            let popupContent = `<div class="info-popup"><h4 style="margin-top:0; color:#2e7d32; border-bottom:2px solid #4caf50; padding-bottom:5px;">${item.ten}</h4>`;

            for (let key in props) {
              if (
                key !== "bbox" &&
                key !== "geom" &&
                key !== "id" &&
                props[key] !== null &&
                props[key] !== ""
              ) {
                let tenDep = TU_DIEN_COT[key] || key; // Dịch tên cột sang tiếng Việt
                popupContent += `<p style="margin:6px 0; font-size:13px;"><b>${tenDep}:</b> <span class="val-display">${props[key]}</span></p>`;
              }
            }
            popupContent += `</div>`;

            L.popup().setLatLng(tamDiem).setContent(popupContent).openOn(map);
          }, 1500);

          searchResults.classList.add("hidden");
        });
        searchResults.appendChild(div);
      });
    }
  });
}

btnSearch.addEventListener("click", thucThiTimKiem);
inpSearch.addEventListener("keypress", function (e) {
  if (e.key === "Enter") thucThiTimKiem();
});
document.addEventListener("click", function (e) {
  if (!e.target.closest(".navbar-search"))
    searchResults.classList.add("hidden");
});
// =========================================================
// 7. LOGIC TRUY VẤN NÂNG CAO (GIAO TIẾP VỚI GEOSERVER)
// =========================================================
var resultLayer = new L.FeatureGroup().addTo(map);

// 1. Quản lý bảng Truy vấn
const bangTruyVan = document.getElementById("bangTruyVan");
const btnDongTruyVan = document.getElementById("btnDongTruyVan");

// 👉 TÍNH NĂNG THOÁT TRUY VẤN KHI NHẤN DẤU X (CẬP NHẬT MỚI)
btnDongTruyVan.addEventListener("click", () => {
  // 1. Giấu bảng truy vấn đi
  bangTruyVan.classList.add("hidden");

  // 2. QUAN TRỌNG: Quét sạch các vùng/điểm kết quả trên bản đồ
  resultLayer.clearLayers();

  // 3. Đưa danh sách kết quả về trạng thái ban đầu
  const lstKetQua = document.getElementById("lstKetQua");
  if (lstKetQua) {
    lstKetQua.innerHTML = `
      <div class='empty-result'>Chưa có dữ liệu. Vui lòng thực hiện truy vấn!</div>
    `;
  }

  // 4. Reset số lượng kết quả hiện tại về con số 0
  const txtCount = document.getElementById("txtCount");
  if (txtCount) {
    txtCount.innerText = "0";
  }

  // 5. Tự động chuyển về Tab "Truy vấn" để lần sau mở ra cho chuẩn
  const tabBtns = bangTruyVan.querySelectorAll(".tab-btn");
  if (tabBtns.length > 0) {
    tabBtns[0].click();
  }
});

// 2. Logic Chuyển Tab (Đã sửa lỗi không làm ảnh hưởng đến bảng Thống kê)
const tabBtns = bangTruyVan.querySelectorAll(".tab-btn");
const tabContents = bangTruyVan.querySelectorAll(".tab-content");

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Chỉ xử lý các Tab bên trong bảng Truy vấn
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    const targetId = btn.getAttribute("data-target");
    const targetContent = bangTruyVan.querySelector("#" + targetId);
    if (targetContent) {
      targetContent.classList.add("active");
    }
  });
});

// --- TUYỆT KỸ LỌC TÌNH TRẠNG THÔNG MINH (ĐÃ ĐỦ 6 LỚP) ---
const CAU_HINH_LOC_DONG = {
  "angiang:khoangsan_diem_mo": {
    tieuDe: "LỌC THEO TÌNH TRẠNG",
    cotDB: "tinh_trang",
    danhSach: [
      "Đang khai thác",
      "Chưa khai thác",
      "Tạm dừng khai thác",
      "Đóng cửa mỏ",
    ],
  },
  "angiang:rung": {
    tieuDe: "LỌC THEO TÌNH TRẠNG",
    cotDB: "tinh_trang",
    danhSach: [
      "Ổn định - Bảo vệ",
      "Cảnh báo cháy",
      "Đang cháy",
      "Bị suy thoái",
      "Đang tái sinh",
    ],
  },
  "angiang:dongvat": {
    tieuDe: "MỨC ĐỘ NGUY CẤP",
    cotDB: "muc_do_nguy_cap",
    danhSach: [
      "Ít quan tâm (LC)",
      "Sắp nguy cấp (VU)",
      "Nguy cấp (EN)",
      "Cực kỳ nguy cấp (CR)",
    ],
  },
  "angiang:thucvat": {
    tieuDe: "MỨC ĐỘ NGUY CẤP",
    cotDB: "muc_do_nguy_cap",
    danhSach: [
      "Ít quan tâm (LC)",
      "Sắp nguy cấp (VU)",
      "Nguy cấp (EN)",
      "Cực kỳ nguy cấp (CR)",
    ],
  },
  "angiang:dat": {
    tieuDe: "NHÓM SỬ DỤNG ĐẤT",
    cotDB: "nhom_su_dung",
    danhSach: ["Đất nông nghiệp", "Đất phi nông nghiệp", "Đất chưa sử dụng"],
  },
  "angiang:waterways": {
    tieuDe: "CẤP ĐỘ SÔNG/KÊNH",
    cotDB: "cap",
    danhSach: ["chính", "nhánh"],
  },
};

const cboLopDuLieu = document.getElementById("cboLopDuLieu");
const cboTinhTrang = document.getElementById("cboTinhTrang");
const khungLocTinhTrang = document.getElementById("khungLocTinhTrang");
const lblTinhTrang = document.getElementById("lblTinhTrang");

function capNhatOChonTinhTrang() {
  let lopDangChon = cboLopDuLieu.value;
  let cauHinh = CAU_HINH_LOC_DONG[lopDangChon];
  cboTinhTrang.innerHTML = '<option value="all">-- Tất cả --</option>';

  if (cauHinh) {
    khungLocTinhTrang.style.display = "block";
    lblTinhTrang.innerText = cauHinh.tieuDe;
    cauHinh.danhSach.forEach((tt) => {
      let opt = document.createElement("option");
      opt.value = tt;
      opt.innerText = tt;
      cboTinhTrang.appendChild(opt);
    });
  } else {
    khungLocTinhTrang.style.display = "none";
  }
}
cboLopDuLieu.addEventListener("change", capNhatOChonTinhTrang);
capNhatOChonTinhTrang(); // Chạy lần đầu

// --- LỆNH TRUY VẤN LÊN MÁY CHỦ ---
document.getElementById("btnApDung").addEventListener("click", () => {
  const chonLop = cboLopDuLieu.value;
  const chonTinhTrang = cboTinhTrang.value;
  const tuKhoa = document.getElementById("txtTuKhoa").value.trim();

  let cqlArray = [];
  let cauHinhDong = CAU_HINH_LOC_DONG[chonLop];

  // Khớp đúng cột DB để truy vấn
  if (chonTinhTrang !== "all" && cauHinhDong) {
    cqlArray.push(`${cauHinhDong.cotDB} = '${chonTinhTrang}'`);
  }

  // Khớp đúng cột Tên để truy vấn
  if (tuKhoa !== "") {
    if (chonLop === "angiang:khoangsan_diem_mo")
      cqlArray.push(`ten_don_vi ILIKE '%${tuKhoa}%'`);
    else if (
      chonLop === "angiang:rung" ||
      chonLop === "angiang:dat" ||
      chonLop === "angiang:waterways"
    )
      cqlArray.push(`ten ILIKE '%${tuKhoa}%'`);
    else if (chonLop === "angiang:dongvat" || chonLop === "angiang:thucvat")
      cqlArray.push(`ten_loai ILIKE '%${tuKhoa}%'`);
  }

  let cqlString =
    cqlArray.length > 0
      ? `&CQL_FILTER=${encodeURIComponent(cqlArray.join(" AND "))}`
      : "";
  let urlWFSQuery = `/myproxy/angiang/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=${chonLop}&outputFormat=application/json${cqlString}`;

  const btn = document.getElementById("btnApDung");
  btn.innerHTML = "⏳ ĐANG LẤY DỮ LIỆU...";

  fetch(urlWFSQuery)
    .then((res) => res.text())
    .then((text) => {
      if (text.startsWith("<") || text.includes("Exception")) {
        console.error("Lỗi XML:", text);
        alert("Lệnh truy vấn bị lỗi, hãy xem F12!");
        btn.innerHTML = "ÁP DỤNG LỌC DỮ LIỆU";
        return;
      }
      try {
        let data = JSON.parse(text);
        HienThiKetQuaTruyVan(data.features, chonLop);
        btn.innerHTML = "ÁP DỤNG LỌC DỮ LIỆU";
        tabBtns[1].click();
      } catch (e) {
        console.error("Lỗi JSON:", e);
      }
    })
    .catch((err) => {
      btn.innerHTML = "ÁP DỤNG LỌC DỮ LIỆU";
      alert("Lỗi mạng!");
    });
});

// --- VẼ UI KẾT QUẢ CỰC XỊN ---
function HienThiKetQuaTruyVan(features, lop) {
  const lstKetQua = document.getElementById("lstKetQua");
  document.getElementById("txtCount").innerText = features
    ? features.length
    : 0;
  lstKetQua.innerHTML = "";
  resultLayer.clearLayers();

  if (!features || features.length === 0) {
    lstKetQua.innerHTML =
      "<div class='empty-result'>❌ Không tìm thấy dữ liệu!</div>";
    return;
  }

  let icon = "📍",
    nhanLop = "Tài nguyên";
  if (lop.includes("khoangsan")) {
    icon = "⛏️";
    nhanLop = "Khoáng sản";
  } else if (lop.includes("rung")) {
    icon = "🌳";
    nhanLop = "Rừng";
  } else if (lop.includes("dongvat")) {
    icon = "🐅";
    nhanLop = "Động vật";
  } else if (lop.includes("dat")) {
    icon = "🟤";
    nhanLop = "Đất";
  } else if (lop.includes("waterways")) {
    icon = "💧";
    nhanLop = "Nước";
  } else if (lop.includes("thucvat")) {
    icon = "🌿";
    nhanLop = "Thực vật";
  }

  features.forEach((f) => {
    let props = f.properties;
    let ten =
      props.ten || props.ten_don_vi || props.ten_loai || "Không xác định";

    let chiTietHtml = "";
    let dongHienThi = 0;
    for (let key in props) {
      if (
        key !== "bbox" &&
        key !== "geom" &&
        key !== "id" &&
        key !== "ten" &&
        key !== "ten_don_vi" &&
        key !== "ten_loai" &&
        props[key]
      ) {
        if (dongHienThi < 3) {
          let tenDep = TU_DIEN_COT[key] || key;
          chiTietHtml += `<p style="margin: 3px 0; font-size: 12px; color: #555;"><b>${tenDep}:</b> ${props[key]}</p>`;
          dongHienThi++;
        }
      }
    }

    let div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="font-size: 20px; background: #e8f5e9; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${icon}</div>
          <div style="flex: 1;">
              <h4 style="margin: 0 0 5px 0; color: #2e7d32; font-size: 14px;">${ten}</h4>
              <span style="display: inline-block; background: #c8e6c9; color: #1b5e20; font-size: 10px; padding: 2px 8px; border-radius: 12px; margin-bottom: 6px; font-weight: bold;">${nhanLop}</span>
              ${chiTietHtml}
          </div>
      </div>
    `;

    let geojsonLayer = L.geoJSON(f);
    resultLayer.addLayer(geojsonLayer);

    div.addEventListener("click", () => {
      var tamDiem = geojsonLayer.getBounds().getCenter();
      map.flyTo(tamDiem, 15, { duration: 1.5 });

      let popupContent = `<div class="info-popup"><h4 style="margin-top:0; color:#2e7d32; border-bottom:2px solid #4caf50; padding-bottom:5px;">${ten}</h4>`;
      for (let key in props) {
        if (key !== "bbox" && key !== "geom" && key !== "id" && props[key]) {
          let tenDep = TU_DIEN_COT[key] || key;
          popupContent += `<p style="margin:6px 0; font-size:13px;"><b>${tenDep}:</b> ${props[key]}</p>`;
        }
      }
      popupContent += `</div>`;
      setTimeout(() => {
        L.popup().setLatLng(tamDiem).setContent(popupContent).openOn(map);
      }, 1500);
    });
    lstKetQua.appendChild(div);
  });
  map.fitBounds(resultLayer.getBounds(), { padding: [50, 50] });
}
// =====================================================================
// TÍNH NĂNG THỐNG KÊ BIỂU ĐỒ (CHART.JS)
// =====================================================================
let chartHienTai = null;
let currentReportFeatures = []; // Biến hứng dữ liệu để lát in Báo Cáo
let currentReportLayerName = "";
const btnThongKe = document.getElementById("btnThongKe");
const danhSachThongKe = document.getElementById("danhSachThongKe");
const panelThongKe = document.getElementById("panelThongKe");
const btnDongThongKe = document.getElementById("btnDongThongKe");

// Sự kiện bật tắt menu thống kê
// =====================================================================
// ĐẠI PHÁP QUẢN LÝ THANH CÔNG CỤ (TẮT/MỞ ĐỒNG BỘ 3 NÚT)
// =====================================================================

// 1. Lấy các phần tử DOM
const uiBtnThem = document.getElementById("btnThemTaiNguyen");
const uiPanelThem = document.getElementById("danhSachTaiNguyen");

const uiBtnTruyVan = document.getElementById("btnMoTruyVan");
const uiPanelTruyVan = document.getElementById("bangTruyVan");

const uiBtnThongKe = document.getElementById("btnThongKe");
const uiListThongKe = document.getElementById("danhSachThongKe");
const uiDashThongKe = document.getElementById("panelThongKe");

// 2. Hàm dọn dẹp: Tắt tất cả các bảng, ngoại trừ bảng đang được chỉ định
function tatTatCaMenuTru(menuGiuLai) {
  if (menuGiuLai !== "Them") uiPanelThem.classList.add("hidden");
  if (menuGiuLai !== "TruyVan") uiPanelTruyVan.classList.add("hidden");
  if (menuGiuLai !== "ThongKe") {
    uiListThongKe.classList.add("hidden");
    uiDashThongKe.classList.add("hidden"); // Tắt luôn cái biểu đồ nếu đang mở
  }
}

// 3. Gắn sự kiện cho nút THÊM (+)
uiBtnThem.addEventListener("click", () => {
  const dangAn = uiPanelThem.classList.contains("hidden");
  tatTatCaMenuTru("Them"); // Tắt các bảng khác
  if (dangAn) {
    uiPanelThem.classList.remove("hidden"); // Mở lên
  } else {
    uiPanelThem.classList.add("hidden"); // Bấm lần 2 thì tự tắt
  }
});

// 4. Gắn sự kiện cho nút TRUY VẤN (🔍)
uiBtnTruyVan.addEventListener("click", () => {
  const dangAn = uiPanelTruyVan.classList.contains("hidden");
  tatTatCaMenuTru("TruyVan");
  if (dangAn) {
    uiPanelTruyVan.classList.remove("hidden");
  } else {
    uiPanelTruyVan.classList.add("hidden");
  }
});

// 5. Gắn sự kiện cho nút THỐNG KÊ (📊)
uiBtnThongKe.addEventListener("click", () => {
  const dangAn = uiListThongKe.classList.contains("hidden");
  tatTatCaMenuTru("ThongKe");
  if (dangAn) {
    uiListThongKe.classList.remove("hidden");
  } else {
    uiListThongKe.classList.add("hidden");
  }
});
// Nút tắt bảng thống kê
btnDongThongKe.addEventListener("click", () => {
  panelThongKe.classList.add("hidden");
});

// Sự kiện khi bấm vào từng lớp trong danh sách
document.querySelectorAll(".stat-select-item").forEach((item) => {
  item.onclick = function () {
    const lopId = this.getAttribute("data-lop");
    const tenHienThi = this.getAttribute("data-ten");

    danhSachThongKe.classList.add("hidden");
    panelThongKe.classList.remove("hidden");

    thucThiThongKeLop(lopId, tenHienThi);
  };
});

// Hàm gọi GeoServer và tính toán
async function thucThiThongKeLop(lopId, tenLop) {
  document.getElementById("txtTenLopThongKe").innerText =
    "📊 Thống kê: " + tenLop;
  const loader = document.getElementById("statLoader");
  const container = document.getElementById("statContainer");

  loader.style.display = "block";
  container.classList.add("hidden");

  try {
    let keyPhanLoai = "";
    if (lopId.includes("khoangsan")) keyPhanLoai = "tinh_trang";
    else if (lopId.includes("rung")) keyPhanLoai = "loai_rung";
    else if (lopId.includes("dongvat") || lopId.includes("thucvat"))
      keyPhanLoai = "muc_do_nguy_cap";
    else if (lopId.includes("dat")) keyPhanLoai = "loai_dat_su_dung";
    else if (lopId.includes("waterways")) keyPhanLoai = "loai";

    // Gọi dữ liệu từ máy chủ
    const url = `/myproxy/angiang/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=${lopId}&outputFormat=application/json&maxFeatures=2000`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Mất kết nối mạng");

    const data = await res.json();
    const features = data.features || [];
    let total = data.totalFeatures || features.length;
    // Gán dữ liệu vào biến để dùng cho nút Báo cáo
    currentReportFeatures = features;
    currentReportLayerName = tenLop;
    // Đếm gom nhóm
    let dict = {};
    features.forEach((f) => {
      let val = f.properties[keyPhanLoai] || "Chưa xác định";
      dict[val] = (dict[val] || 0) + 1;
    });

    veBieuDo(Object.keys(dict), Object.values(dict));

    document.getElementById("statSummaryText").innerHTML = `
        <strong>✅ Báo cáo tự động:</strong><br>
        Hệ thống đang lưu trữ tổng cộng <b style="color:#d32f2f; font-size:16px;">${total}</b> đối tượng thuộc lớp <b>${tenLop}</b>.<br><br>
        <i>Tiêu chí phân loại: ${keyPhanLoai.replace(/_/g, " ").toUpperCase()}.</i>
    `;

    loader.style.display = "none";
    container.classList.remove("hidden");
  } catch (err) {
    console.error("Lỗi thống kê:", err);
    loader.innerHTML =
      "<div style='color:red; font-weight:bold;'>❌ Lỗi lấy dữ liệu từ GeoServer! Vui lòng bật Live Server.</div>";
  }
}

// Hàm vẽ biểu đồ
function veBieuDo(labels, data) {
  const ctx = document.getElementById("chartChinh").getContext("2d");

  if (chartHienTai) chartHienTai.destroy();

  const colors = [
    "#4caf50",
    "#2196f3",
    "#ff9800",
    "#f44336",
    "#9c27b0",
    "#795548",
    "#00bcd4",
  ];

  chartHienTai = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        { data: data, backgroundColor: colors, borderWidth: 1, hoverOffset: 8 },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 13 } } },
        title: {
          display: true,
          text: "BIỂU ĐỒ PHÂN LOẠI CHI TIẾT",
          font: { size: 14 },
        },
      },
      cutout: "55%",
    },
  });
}
// =====================================================================
// LOGIC MỞ TRANG BÁO CÁO ĐỘC LẬP (CHỐNG TREO TRÌNH DUYỆT)
// =====================================================================
document.getElementById("btnMoBaoCao").addEventListener("click", () => {
  if (currentReportFeatures.length === 0) {
    alert("Chưa có dữ liệu để lập báo cáo!");
    return;
  }

  // 1. Gói dữ liệu truyền sang trang baocao.html
  const dataToExport = {
    layerName: currentReportLayerName,
    features: currentReportFeatures,
    date: new Date().toLocaleDateString("vi-VN"),
    dictionary: TU_DIEN_COT, // Đưa luôn từ điển sang để trang kia dịch tên cột
  };

  // 2. Lưu vào bộ nhớ tạm
  sessionStorage.setItem("webgis_report_data", JSON.stringify(dataToExport));

  // 3. Mở tab mới
  window.open("baocao.html", "_blank");
});
