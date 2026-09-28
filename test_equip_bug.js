const { Player } = require('./server/game/Player');
const { generateEquipment } = require('./server/game/ItemSystem');
const { World } = require('./server/game/World');

const mockIO = { emit: () => {}, to: () => ({ emit: () => {} }) };
const world = new World(mockIO);
const p = world.addPlayer('test_p', 'TestUser', 'huashan');

console.log('1. Khởi tạo inventory ban đầu:', p.inventory.map(i => i.name || i.itemId));
console.log('   Trang bị ban đầu:', Object.keys(p.equipment).map(k => `${k}: ${p.equipment[k]?.name}`));

// Giả lập quái rớt đồ và nhặt đồ
world.dropLoot(p.x + 20, p.y + 20, true, p.currentMap);
console.log(`2. Số lượng đồ rơi: ${world.droppedItems.length}`);
const equipDrop = world.droppedItems.find(d => d.isEquipment);
console.log('   Món đồ trang bị rơi:', equipDrop?.itemInstance?.name, 'Slot:', equipDrop?.itemInstance?.slot);

if (equipDrop) {
  world.pickupItem(p.id, equipDrop.id);
  console.log('3. Sau khi nhặt đồ, inventory:', p.inventory.map((it, idx) => `[${idx}] ${it.name || it.itemId}`));

  // Tìm vị trí món đồ vừa nhặt trong túi
  const newIndex = p.inventory.findIndex(i => i.uid === equipDrop.itemInstance.uid);
  console.log(`4. Vị trí món đồ vừa nhặt trong túi: ${newIndex}`);

  // Thử bấm trang bị
  const ok = p.equipItem(newIndex);
  console.log(`5. Kết quả trang bị món đồ (slot: ${equipDrop.itemInstance.slot}):`, ok);
  console.log('   Trang bị sau khi mặc:', Object.keys(p.equipment).map(k => `${k}: ${p.equipment[k]?.name}`));
  console.log('   Inventory sau khi mặc:', p.inventory.map((it, idx) => `[${idx}] ${it.name || it.itemId}`));

  // Kiểm tra client state
  const clientState = p.toClientState();
  console.log('6. Client state equipment:', Object.keys(clientState.equipment).map(k => `${k}: ${clientState.equipment[k]?.name}`));
}
