export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Trà Sữa Trân Châu",
    price: 30000,
    image: "/products/trasua.png",
    description: "Trà sữa thơm béo kèm trân châu dai mềm",
    category: "Trà",
  },
  {
    id: 2,
    name: "Cà Phê Sữa Đá",
    price: 25000,
    image: "/products/caphe.png",
    description: "Cà phê đậm đà pha sữa đặc truyền thống",
    category: "Cà phê",
  },
  {
    id: 3,
    name: "Nước Cam Tươi",
    price: 35000,
    image: "/products/nuoccam.png",
    description: "Nước cam tươi vắt nguyên chất, giàu vitamin C",
    category: "Nước ép",
  },
  {
    id: 4,
    name: "Matcha Latte",
    price: 40000,
    image: "/products/matcha.png",
    description: "Matcha Nhật Bản hòa quyện cùng sữa tươi béo ngậy",
    category: "Trà",
  },
  {
    id: 5,
    name: "Coca Cola",
    price: 15000,
    image: "/products/cocacola.png",
    description: "Coca Cola mát lạnh, sảng khoái tức thì",
    category: "Nước ngọt",
  },
  {
    id: 6,
    name: "Sinh Tố Bơ",
    price: 35000,
    image: "/products/sinhtobo.png",
    description: "Sinh tố bơ béo ngậy, thơm lừng",
    category: "Sinh tố",
  },
  {
    id: 7,
    name: "Trà Đào Cam Sả",
    price: 30000,
    image: "/products/tradao.png",
    description: "Trà đào thơm ngát kết hợp cam tươi và sả",
    category: "Trà",
  },
  {
    id: 8,
    name: "Soda Chanh Tươi",
    price: 20000,
    image: "/products/sodachanh.png",
    description: "Soda chanh mát lạnh, thanh mát giải nhiệt",
    category: "Nước ngọt",
  },
];
