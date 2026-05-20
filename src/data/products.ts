export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  isCustom?: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Cà phê",
    price: 10000,
    image: "/products/caphe.png",
    description: "Cà phê truyền thống thơm ngon đậm vị",
    category: "Cà phê",
  },
  {
    id: 2,
    name: "Cà phê sữa",
    price: 15000,
    image: "/products/caphesua.png",
    description: "Cà phê pha với sữa đặc ngọt dịu béo ngậy",
    category: "Cà phê",
  },
  {
    id: 3,
    name: "Nước cam",
    price: 15000,
    image: "/products/nuoccam.png",
    description: "Nước cam vắt nguyên chất, giàu vitamin C",
    category: "Nước ép",
  },
  {
    id: 4,
    name: "Nước mía",
    price: 10000,
    image: "/products/nuocmia.png",
    description: "Nước mía tươi ép ngọt mát tự nhiên",
    category: "Nước ép",
  },
  {
    id: 5,
    name: "Trà đường",
    price: 10000,
    image: "/products/traduong.png",
    description: "Trà thanh mát pha đường ngọt nhẹ giải nhiệt",
    category: "Trà",
  },
  {
    id: 6,
    name: "Trà lai",
    price: 12000,
    image: "/products/tralai.png",
    description: "Trà lai đặc sản thơm lừng khó quên",
    category: "Trà",
  },
  {
    id: 7,
    name: "Bạc xỉu",
    price: 15000,
    image: "/products/bacxiu.png",
    description: "Sữa nóng pha chút cà phê thơm nồng",
    category: "Cà phê",
  },
  {
    id: 8,
    name: "Đá me",
    price: 15000,
    image: "/products/dame.png",
    description: "Đá me chua ngọt thơm bùi hạt me mát lạnh",
    category: "Nước giải khát",
  },
  {
    id: 9,
    name: "Trà tắc",
    price: 10000,
    image: "/products/tratac.png",
    description: "Trà tắc thơm mát, chua ngọt sảng khoái",
    category: "Trà",
  },
  {
    id: 10,
    name: "Dừa tắc",
    price: 15000,
    image: "/products/duatac.png",
    description: "Nước dừa tươi pha tắc chua ngọt thanh mát",
    category: "Nước giải khát",
  },
  {
    id: 11,
    name: "Dừa",
    price: 15000,
    image: "/products/dua.png",
    description: "Trái dừa tươi ngọt lịm thanh mát tự nhiên",
    category: "Nước giải khát",
  },
  {
    id: 12,
    name: "Order khác: tự ghi",
    price: 0,
    image: "/products/custom.png",
    description: "Tự ghi món nước và giá tiền theo ý muốn của bạn",
    category: "Món khác",
    isCustom: true,
  },
];
