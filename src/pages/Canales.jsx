import React, { useState, useMemo } from 'react';
import { Facebook, Instagram, Phone, MapPin } from 'lucide-react';
import { logo_caneles } from '../assets/images';
import { tiktok } from '../assets/icons';
import { products, colorMap } from '../constants';
import { BoxPacking } from '../components';

export default function Caneles() {
  const [cart, setCart] = useState({});
  const [packingCost, setPackingCost] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [desiredDateTime, setDesiredDateTime] = useState('');
  const [boxes, setBoxes] = useState([]);

  function handleQuantityChange(id, type, delta) {
    setCart(prev => {
      const item = prev[id] || { unit: 0, combo: 0 };
      let { unit, combo } = item;
      if (type === 'unit') {
        unit = Math.max(0, unit + delta);
        if (unit >= 12 && delta > 0) {
          const extra = Math.floor(unit / 12);
          combo += extra;
          unit %= 12;
        }
      } else combo = Math.max(0, combo + delta);
      const next = { ...prev, [id]: { unit, combo } };
      if (unit + combo === 0) delete next[id];
      return next;
    });
  }

  const total = Object.entries(cart).reduce((sum, [i, c]) => {
    const p = products.find(x => x.id === +i);
    return sum + (c.unit || 0) * (p.unitPrice || 0) + (c.combo || 0) * (p.comboPrice || 0);
  }, 0);

  function handleSubmit(e) {
    e.preventDefault();
    const order = {
      cart,
      total,
      boxes,
      packingCost,
      deliveryMethod,
      desiredDateTime,
      // Ghi chú thêm tùy phương thức
      note:
        deliveryMethod === 'pickup'
          ? `Thời gian đến nhận: ${desiredDateTime}`
          : deliveryMethod === 'ship_dl'
          ? `Ship nội thành (Grab), thời gian mong muốn: ${desiredTime}`
          : `Ship ngoại thành, thời gian dự kiến giao: 1-2 ngày`
    };
    console.log('Đặt hàng', order);
    // submit lên server...
  }

  const cartItems = useMemo(() => 
    Object.entries(cart).map(([key, { unit, combo }]) => ({
      id: +key,
      type: products.find(p => p.id === +key).key,
      count: products.find(p => p.id === +key).key === 'mix6' 
        ? combo 
        : combo * 12 + unit
    })),
    [cart]
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#3a2e2b' }}>
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white">
            <img src={logo_caneles} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-bold">Canelés Dalat since 2020</h1>
            <p className="text-sm italic opacity-80">More than a cake</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <a href="https://www.facebook.com/canelesdalat" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80">
            <Facebook size={24} />
          </a>
          <a href="https://www.instagram.com/canelesdalat" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80">
            <Instagram size={24} />
          </a>
          <a href="https://www.tiktok.com/@canelesdalat" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80">
            <img src={tiktok} alt="TikTok" className="w-8 h-8" />
          </a>
          <a href="tel:0332043550" className="text-white hover:opacity-80">
            <Phone size={24} />
          </a>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3 bg-white/90 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Đơn hàng</h2>
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {Object.entries(cart).map(([i, c]) => {
              const p = products.find(x => x.id === +i);
              return (
                <li key={i} className="flex justify-between bg-white/70 p-2 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {c.unit > 0 && <p>{c.unit} x {p.unitPrice.toLocaleString()}₫</p>}
                    {c.combo > 0 && <p>{c.combo} x {p.comboPrice.toLocaleString()}₫</p>}
                  </div>
                  <span className="font-semibold text-gray-900">{((c.unit||0)*(p.unitPrice||0)+(c.combo||0)*(p.comboPrice||0)).toLocaleString()}₫</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 font-bold text-gray-900 text-lg">
            Tiền bánh: {total.toLocaleString()}₫<br />
            Tiền hộp: {packingCost.toLocaleString()}₫<br />
            Tổng: {(total + packingCost).toLocaleString()}₫
          </div>
        </aside>

        <main className="col-span-6 grid grid-cols-3 gap-4">
          {products.map(p => (
            <div
              key={p.id}
              className="p-3 rounded-lg shadow-lg text-white transition-transform transform hover:-translate-y-1 hover:shadow-2xl"
              style={{ backgroundColor: colorMap[p.key] }}
            >
              <img src={p.img} alt={p.name} className="w-full h-24 object-cover mb-1 rounded" />
              <h3 className="font-semibold text-base mb-1">{p.name}</h3>
              <p className="text-xs italic mb-2 opacity-80">{p.desc}</p>
              {p.unitPrice && (
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{p.unitPrice.toLocaleString()}₫/cái</span>
                  <div className="flex items-center">
                    <button onClick={() => handleQuantityChange(p.id, 'unit', -1)} className="px-1">-</button>
                    <span className="px-1 text-sm">{cart[p.id]?.unit||0}</span>
                    <button onClick={() => handleQuantityChange(p.id, 'unit', 1)} className="px-1">+</button>
                  </div>
                </div>
              )}
              {p.comboPrice && (
                <div className="flex items-center justify-between text-xs">
                  <span>{p.comboPrice.toLocaleString()}₫/12</span>
                  <div className="flex items-center">
                    <button onClick={() => handleQuantityChange(p.id, 'combo', -1)} className="px-1">-</button>
                    <span className="px-1 text-sm">{cart[p.id]?.combo||0}</span>
                    <button onClick={() => handleQuantityChange(p.id, 'combo', 1)} className="px-1">+</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </main>

        <aside className="col-span-3 bg-white/90 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Thông tin khách</h2>
          <form onSubmit={handleSubmit} className="mt-6 bg-white/90 p-4 rounded-lg shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Thông tin khách</h2>

            <input type="text" placeholder="Họ và tên" className="w-full border p-2 rounded text-sm" required />
            <input type="tel" placeholder="Số điện thoại" className="w-full border p-2 rounded text-sm" required />

            <select
              className="w-full border p-2 rounded text-sm"
              value={deliveryMethod}
              onChange={e => setDeliveryMethod(e.target.value)}
              required
            >
              <option value="pickup">Nhận tại quầy</option>
              <option value="ship_dl">Ship nội thành</option>
              <option value="ship_else">Ship ngoại thành</option>
            </select>

            {deliveryMethod !== 'ship_else' && (
              <div>
                <label className="block text-sm mb-1">
                  {deliveryMethod === 'pickup'
                    ? 'Ngày & giờ đến nhận'
                    : 'Ngày & giờ mong muốn giao'}
                </label>
                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded text-sm"
                  value={desiredDateTime}
                  onChange={e => setDesiredDateTime(e.target.value)}
                  required
                />
              </div>
            )}

            {deliveryMethod === 'ship_else' && (
              <p className="text-sm text-gray-600">
                Ship ngoại thành, thời gian dự kiến giao hàng: 1-2 ngày
              </p>
            )}

            <button type="submit" className="w-full bg-[#b0916a] text-white p-2 rounded text-sm">
              Đặt bánh
            </button>
          </form>
          <div className="mt-4 space-y-2 text-gray-900">
            <div className="flex items-center text-sm"><Phone size={16} className="mr-1"/>0332.043.550</div>
            <div className="flex items-center text-sm"><MapPin size={32} className="mr-1"/>Đi thẳng lên dốc nhìn BÊN TRÁI ạ, DỐC CẠNH, 79 Phan Bội Châu, Đà Lạt, Lâm Đồng 66000</div>
            <div className="mt-2">
              <iframe
                title="Caneles Dalat Location"
                width="100%"
                height="200"
                style={{ border: 0 }}
                loading="lazy"
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyA8SjDTHR6bvi5q_D-dL4FA2SfUfJG2GSc&q=Caneles+Dalat+79+Phan+Bội+Châu,+Đà+Lạt,+Lâm+Đồng"
              ></iframe>
            </div>
          </div>
        </aside>
      </div>
      <BoxPacking 
        cartItems={cartItems}
        onPackingCostChange={setPackingCost} // Truyền callback
        onBoxesChange={setBoxes} // Truyền callback để cập nhật hộp
      />
    </div>
  );
}
