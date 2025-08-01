// updated: fix reactivity in custom mode, combo 1 vị expansion, and brownie/greenie visual fill
// fix custom mode creating full combo from single item

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';
import { colorMap } from '../constants';
import { a } from '@react-spring/three';

const BOX_TYPES = {
  L: { capacity: 12, price: 5000, rows: 3 },
  M: { capacity: 8, price: 3000, rows: 2 },
  S: { capacity: 4, price: 2000, rows: 1 },
  SPECIAL: { capacity: Infinity, price: 0, rows: 2 },
};
const BOX_TYPE_KEYS = ['L', 'M', 'S'];

function expandItems(cart) {
  const items = [];
  cart.forEach(item => {
    const { id, type = 0, count = 0 } = item;
    if (type === 'mix6') {
      const flavors = ['original', 'chocolate', 'rice', 'cafe', 'strawberry', 'matcha'];
      flavors.forEach(flavor => {
        for (let i = 0; i < 2 * count; i++) {
          items.push({ key: `${id}-${flavor}-${i}`, type: flavor });
        }
      });
    } else if (['brownie', 'greenie'].includes(type)) {
      for (let i = 0; i < count; i++) {
        items.push({ key: `${id}-${i}`, type });
      }
    } else {
      for (let i = 0; i < count; i++) {
        items.push({ key: `${id}-${i}`, type });
      }
    }
  });
  return items;
}

function autoDistribute(rawItems) {
  const boxes = [];
  let boxIndex = 0;
  let currentBox = {
    id: `box-${boxIndex++}`, 
    type: 'L', 
    items: [], 
    addedByUser: false
  };

  rawItems.forEach(item => {
    if (['brownie', 'greenie'].includes(item.type)) {
      // mỗi SPECIAL box đều cấp ID mới
      boxes.push({
        id: `box-${boxIndex++}`,
        type: 'SPECIAL',
        items: [item],
        addedByUser: false
      });
      return;
    }

    const capacity = BOX_TYPES[currentBox.type].capacity;
    if (currentBox.items.length >= capacity) {
      // full ⇒ đẩy currentBox (với id đã cấp) rồi tạo box mới với ID tiếp
      boxes.push(currentBox);
      currentBox = {
        id: `box-${boxIndex++}`,
        type: 'L',
        items: [],
        addedByUser: false
      };
    }
    currentBox.items.push(item);
  });

  // đẩy nốt currentBox còn sót
  if (currentBox.items.length) {
    boxes.push(currentBox);
  }

  return boxes;
}

export default function BoxPacking({ cartItems, onPackingCostChange, onBoxesChange }) {
  const [mode, setMode] = useState('default');
  const [boxes, setBoxes] = useState([]);
  const [newBoxType, setNewBoxType] = useState('L');

  useEffect(() => {
    const rawItems = expandItems(cartItems);
    const autoBoxes = autoDistribute(rawItems);
    if (mode === 'default') {
      setBoxes(autoBoxes);
    } else {
      setBoxes(prev => {
      const userBoxes = prev
        .filter(b => b.addedByUser)
        .map((b, i) => ({
          id: `box-${autoBoxes.length + i}`,
          type: 'L',
          items: [],
          addedByUser: true
        }));

      // ghép autoBoxes + userBoxes (tuỳ bạn muốn thứ tự)
      return [...autoBoxes, ...userBoxes];
    });
    }
  }, [cartItems, mode]);

  useEffect(() => {
    if (mode !== 'default') {
      onBoxesChange(boxes);
    } else {
      onBoxesChange([]);
    }
  }, [boxes, onBoxesChange]);

  useEffect(() => {
    if (mode !== 'default') {
    const cost = boxes.reduce((sum, box) => {
      if (box.addedByUser && box.type !== 'SPECIAL') {
        return sum + BOX_TYPES[box.type].price;
      }
      return sum;
    }, 0);
    onPackingCostChange(cost);
    } else {
      onPackingCostChange(0);
    }
  }, [boxes, onPackingCostChange]);

  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setBoxes(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const srcBox = copy.find(b => b.id === source.droppableId);
      const destBox = copy.find(b => b.id === destination.droppableId);
      const [moved] = srcBox.items.splice(source.index, 1);

      if (['brownie', 'greenie'].includes(moved.type) || destBox.type === 'SPECIAL') {
        alert('Brownie và Greenie không thể di chuyển sang hộp khác');
        srcBox.items.splice(source.index, 0, moved);
        return copy;
      }

      if (destBox.items.length >= BOX_TYPES[destBox.type].capacity) {
        const temp = destBox.items[destination.index];
        destBox.items[destination.index] = moved;
        srcBox.items.splice(source.index, 0, temp);
      } else {
        destBox.items.splice(destination.index, 0, moved);
      }
      return copy;
    });
  }

  function handleAddBox() {
    setBoxes(prev => [
      ...prev,
      { id: `box-${prev.length}`, type: newBoxType, items: [], addedByUser: true }
    ]);
  }

  function handleChangeBoxType(id, newType) {
    setBoxes(prev => prev.map(b => {
      if (b.id !== id) return b;
      const count = b.items.length;
      const maxCap = BOX_TYPES[newType].capacity;
      if (count > maxCap) {
        alert(`Hộp ${id} chỉ chứa tối đa ${maxCap} cái. Số bánh hiện tại là ${count}, vì vậy chưa thể đổi size được`);
        return b;
      }
      return { ...b, type: newType };
    }));
  }

  function handleRemoveBox(id) {
    const box = boxes.find(b => b.id === id);
    if (box.items.length > 0) {
      alert('Hộp đang chứa bánh, không thể xóa');
      return;
    }
    setBoxes(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${mode === 'default' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('default')}
        >Auto</button>
        <button
          className={`px-4 py-2 rounded ${mode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('custom')}
        >Custom</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {boxes.map(box => {
            const rows = BOX_TYPES[box.type].rows;
            const isSpecial = box.type === 'SPECIAL';
            return (
              <Droppable droppableId={box.id} key={box.id} direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`border border-gray-400 p-2 rounded relative grid grid-rows-${rows} gap-1`}
                    style={{ minHeight: `${rows * 32}px`, maxWidth: '150px' }}
                  >
                    <div className="absolute top-1 left-2 flex items-center space-x-1">
                      <span className="text-sm font-bold">{box.id}</span>
                      <select
                        className="text-xs border p-1 rounded"
                        value={box.type}
                        onChange={e => handleChangeBoxType(box.id, e.target.value)}
                        disabled={box.type === 'SPECIAL'}
                      >
                        {BOX_TYPE_KEYS.map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                      {mode === 'custom' && box.type !== 'SPECIAL' && (
                        <button
                          className="text-red-500 text-xs"
                          onClick={() => handleRemoveBox(box.id)}
                        >x</button>
                      )}
                    </div>

                    <div className="w-full h-full grid grid-cols-4 gap-1 mt-5">
                      {box.items.map((cake, index) => (
                        <Draggable 
                          draggableId={cake.key} 
                          index={index} 
                          key={cake.key} 
                          isDragDisabled={isSpecial || ['brownie','greenie'].includes(cake.type)}>
                          {(draggableProvided) => (
                            <div
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              {...draggableProvided.dragHandleProps}
                              className={`rounded border border-black hover:border-white relative 
                                ${['brownie','greenie'].includes(cake.type) ? 
                                  'w-full h-full col-span-4 row-span-2' : 
                                  'w-6 h-6'}`}
                              style={{
                                ...draggableProvided.draggableProps.style,
                                backgroundColor: colorMap[cake.type] || '#ccc'
                              }}
                              title={cake.type}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {mode === 'custom' && (
        <div className="mt-4 flex items-center space-x-2">
          <select
            className="border p-2 rounded text-sm"
            value={newBoxType}
            onChange={e => setNewBoxType(e.target.value)}
          >
            {BOX_TYPE_KEYS.map(key => (
              <option key={key} value={key}>Box {key}</option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleAddBox}
          >+ Add Box</button>
        </div>
      )}
    </div>
  );
}

BoxPacking.propTypes = {
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number, type: PropTypes.string, count: PropTypes.number })
  ).isRequired,
  onPackingCostChange: PropTypes.func.isRequired,
  onBoxesChange: PropTypes.func.isRequired,
};
