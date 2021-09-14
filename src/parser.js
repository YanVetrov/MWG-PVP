const sample_json = {
  asset_id: "1099544520123",
  owner: "test.wam",
  template_id: 126336,
  location: 100001,
  name: "Raccoon",
  img: "Qmaftc3FY3gqgTSV4QsiiKAhyZhAUwSPQn52CvTj6mc8ie",
  rarity: "Common",
  attack: 14,
  armor: 6,
  speed: 30,
  strength: 600,
  hp: 600,
  capacity: 6,
  type: "battle",
  armor_piercing: 0,
  poisoning: 0,
  fire_radius: 3,
  x: 1,
  y: 1,
  next_availability: 1627088775,
  stuff: [
    { type: "ore", amount: 0, weight: 1 },
    { type: "fuel", amount: 0, weight: 1 },
  ],
  poised_value: 0,
  poised_cnt: 0,
};

const hashCode = s => {
  let hash = 0;
  if (s.length === 0) return hash;
  for (let i = 0; i < s.length; i++) {
    let chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const uint32_keys = ["template_id"];
const uint16_keys = ["strength", "capacity"];
const uint8_keys = [
  "attack",
  "armor",
  "speed",
  "armor_piercing",
  "poisoning",
  "fire_radius",
];
const string_keys = ["name", "img", "rarity", "type"];

const uint64_keys_mut = ["asset_id", "location", "next_availability"];
const uint32_keys_mut = ["x", "y"];
const uint16_keys_mut = ["hp"];
const uint8_keys_mut = ["poised_value", "poised_cnt"];
const string_keys_mut = ["owner", "action_data", "action_name"];

const unpack_units = array => {
  const dataView = new DataView(array.buffer);
  let offset = 0;

  const read_uint64 = () => {
    // const data = Number(dataView.getBigUint64(offset));
    // offset += 8;
    // return data;
    let q = read_uint32();
    return q * ((1 << 30) * 4) + read_uint32();
  };
  const read_uint32 = () => {
    const data = dataView.getUint32(offset);
    offset += 4;
    return data;
  };
  const read_uint16 = () => {
    const data = dataView.getUint16(offset);
    offset += 2;
    return data;
  };
  const read_uint8 = () => {
    const data = dataView.getUint8(offset);
    offset += 1;
    return data;
  };
  const read_string = () => {
    let data = [];
    let length = read_uint8();
    for (let i = 0; i < length; i++) {
      data.push(read_uint8());
    }
    return String.fromCharCode(...data);
  };

  console.assert(read_uint8() === 1); // check packer id

  let units = {};

  let group_length = read_uint16();
  while (group_length > 0) {
    const unit_const = {};
    {
      // read const parameters
      uint32_keys.forEach(key => (unit_const[key] = read_uint32()));
      uint16_keys.forEach(key => (unit_const[key] = read_uint16()));
      uint8_keys.forEach(key => (unit_const[key] = read_uint8()));
      string_keys.forEach(key => (unit_const[key] = read_string()));
    }

    for (let i = 0; i < group_length; i++) {
      // read mutable parameters
      const unit = Object.assign({}, unit_const);
      uint64_keys_mut.forEach(key => (unit[key] = read_uint64()));
      uint32_keys_mut.forEach(key => (unit[key] = read_uint32()));
      uint16_keys_mut.forEach(key => (unit[key] = read_uint16()));
      uint8_keys_mut.forEach(key => (unit[key] = read_uint8()));
      string_keys_mut.forEach(key => (unit[key] = read_string()));

      const stuff_length = read_uint8();
      unit.stuff = [];
      for (let i = 0; i < stuff_length; i++) {
        const type = read_string();
        const amount = read_uint16();
        const weight = read_uint8();
        unit.stuff.push({
          type,
          amount,
          weight,
        });
      }
      unit.asset_id = "" + unit.asset_id;
      units[unit.asset_id] = unit;
    }
    group_length = read_uint16();
  }
  return units;
};

export default unpack_units;
