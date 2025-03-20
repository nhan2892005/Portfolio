// src/templates.js

export const templates = {
  twoByFourWhite: {
    label: "2×4 White Background",
    width: 1200,
    height: 2800,
    backgroundColor: "#ffffff", // nền trắng
    slots: [
      // Hàng 1
      { x: 50,  y: 50,  width: 500, height: 500 }, // cột 1
      { x: 650, y: 50,  width: 500, height: 500 }, // cột 2
      // Hàng 2
      { x: 50,  y: 600, width: 500, height: 500 },
      { x: 650, y: 600, width: 500, height: 500 },
      // Hàng 3
      { x: 50,  y: 1150, width: 500, height: 500 },
      { x: 650, y: 1150, width: 500, height: 500 },
      // Hàng 4
      { x: 50,  y: 1700, width: 500, height: 500 },
      { x: 650, y: 1700, width: 500, height: 500 },
    ],
    // Tuỳ bạn thêm logic hiển thị text cố định ở dưới
  },

  twoByFourBlack: {
    label: "2×4 Black Background",
    width: 1200,
    height: 2800,
    backgroundColor: "#000000", // nền đen
    slots: [
      { x: 50,  y: 50,   width: 500, height: 500 },
      { x: 650, y: 50,   width: 500, height: 500 },
      { x: 50,  y: 600,  width: 500, height: 500 },
      { x: 650, y: 600,  width: 500, height: 500 },
      { x: 50,  y: 1150, width: 500, height: 500 },
      { x: 650, y: 1150, width: 500, height: 500 },
      { x: 50,  y: 1700, width: 500, height: 500 },
      { x: 650, y: 1700, width: 500, height: 500 },
    ],
  },
  oneByFourWhite: {
    label: "1×4 White Background",
    width: 600,       // Tổng chiều rộng
    height: 2350,     // Tổng chiều cao (50px lề trên + 500px ảnh + 50px lề giữa, lặp lại)
    backgroundColor: "#ffffff",
    slots: [
      { x: 50,  y: 50, width: 500, height: 500 },   // Slot 1
      { x: 50,  y: 600, width: 500, height: 500 },   // Slot 2
      { x: 50,  y: 1150, width: 500, height: 500 },  // Slot 3
      { x: 50,  y: 1700, width: 500, height: 500 },  // Slot 4
    ],
  },

  // Các template khác (photostrip4...) tuỳ ý
};
