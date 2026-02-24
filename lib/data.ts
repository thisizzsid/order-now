import { MenuItem } from "../types";

export const MENU_ITEMS: MenuItem[] = [
  // --- CHAI TYPES ---
  {
    id: "c1",
    name: "Classic Chai",
    description: "Our signature milk tea, brewed to perfection.",
    price: 10,
    category: "Chai Types",
    variants: [
      { name: "Small", price: 10 },
      { name: "Medium", price: 15 },
      { name: "Full", price: 20 }
    ]
  },
  {
    id: "c2",
    name: "Masala Chai",
    description: "Classic tea brewed with a blend of aromatic spices.",
    price: 30,
    category: "Chai Types",
    variants: [
      { name: "Half", price: 30 },
      { name: "Full", price: 50 }
    ]
  },
  {
    id: "c3",
    name: "Elaichi Chai",
    description: "Fragrant cardamom-infused milk tea.",
    price: 30,
    category: "Chai Types",
    variants: [
      { name: "Half", price: 30 },
      { name: "Full", price: 50 }
    ]
  },
  {
    id: "c4",
    name: "Doodh Mein Patti",
    description: "Rich and strong tea brewed directly in milk.",
    price: 40,
    category: "Chai Types",
    variants: [
      { name: "Half", price: 40 },
      { name: "Full", price: 50 }
    ]
  },

  // --- TEA VARIANTS ---
  {
    id: "t1",
    name: "Black Tea",
    description: "Strong and refreshing black tea without milk.",
    price: 25,
    category: "Tea Specials",
    variants: [
      { name: "Half", price: 25 },
      { name: "Full", price: 40 }
    ]
  },
  {
    id: "t2",
    name: "Ginger Honey Lemon Tea",
    description: "A soothing blend of ginger, honey, and fresh lemon.",
    price: 40,
    category: "Tea Specials",
    variants: [
      { name: "Half", price: 40 },
      { name: "Full", price: 60 }
    ]
  },
  {
    id: "t3",
    name: "Hot Lemon Tea",
    description: "Zesty and warm lemon tea.",
    price: 40,
    category: "Tea Specials",
    variants: [
      { name: "Half", price: 40 },
      { name: "Full", price: 50 }
    ]
  },
  {
    id: "t4",
    name: "Hot Green Tea",
    description: "Healthy and antioxidant-rich green tea.",
    price: 40,
    category: "Tea Specials",
    variants: [
      { name: "Half", price: 40 },
      { name: "Full", price: 50 }
    ]
  },

  // --- HOT COFFEE & CHOCOLATE ---
  {
    id: "hc1",
    name: "Black Coffee",
    description: "Pure and intense coffee for a quick energy boost.",
    price: 25,
    category: "Hot Coffee",
    variants: [
      { name: "Half", price: 25 },
      { name: "Full", price: 30 }
    ]
  },
  {
    id: "hc2",
    name: "Coffee with Milk",
    description: "Classic creamy coffee with milk.",
    price: 30,
    category: "Hot Coffee",
    variants: [
      { name: "Half", price: 30 },
      { name: "Full", price: 40 }
    ]
  },
  { id: "hc3", name: "Hazelnut Coffee", description: "Rich coffee with a smooth hazelnut flavor.", price: 40, category: "Hot Coffee", variants: [{ name: "Half", price: 40 }, { name: "Full", price: 50 }] },
  { id: "hc4", name: "Vanilla Coffee", description: "A sweet and aromatic vanilla coffee.", price: 40, category: "Hot Coffee", variants: [{ name: "Half", price: 40 }, { name: "Full", price: 50 }] },
  { id: "hc5", name: "Irish Coffee", description: "Coffee with a classic Irish flavor twist.", price: 40, category: "Hot Coffee", variants: [{ name: "Half", price: 40 }, { name: "Full", price: 50 }] },
  { id: "hc6", name: "Caramel Coffee", description: "Sweet and buttery caramel infused coffee.", price: 40, category: "Hot Coffee", variants: [{ name: "Half", price: 40 }, { name: "Full", price: 50 }] },
  { id: "hc7", name: "Hot Chocolate", description: "Creamy and decadent hot chocolate.", price: 40, category: "Hot Coffee", variants: [{ name: "Half", price: 40 }, { name: "Full", price: 50 }] },

  // --- ICE TEAS ---
  { id: "it1", name: "Lemon Ice Tea", description: "Chilled tea with a zesty lemon punch.", price: 60, category: "Ice Teas", variants: [{ name: "Half", price: 60 }, { name: "Full", price: 80 }] },
  { id: "it2", name: "Peach Ice Tea", description: "Chilled tea with sweet peach flavor.", price: 70, category: "Ice Teas", variants: [{ name: "Half", price: 70 }, { name: "Full", price: 80 }] },
  { id: "it3", name: "Raspberry Ice Tea", description: "Chilled tea with a tangy raspberry twist.", price: 70, category: "Ice Teas", variants: [{ name: "Half", price: 70 }, { name: "Full", price: 80 }] },
  { id: "it4", name: "Ice Green Tea", description: "Healthy chilled green tea.", price: 60, category: "Ice Teas", variants: [{ name: "Half", price: 60 }, { name: "Full", price: 80 }] },

  // --- SHAKES ---
  {
    id: "sh1",
    name: "Classic Shake",
    description: "Your choice of Chocolate, Vanilla, Strawberry, Butterscotch, or Mango.",
    price: 70,
    category: "Shakes",
    variants: [
      { name: "Half", price: 70 },
      { name: "Full", price: 90 }
    ]
  },
  {
    id: "sh2",
    name: "Special Fruit Shake",
    description: "Your choice of Black Currant, Blue Berry, Caramel, or Banana.",
    price: 70,
    category: "Shakes",
    variants: [
      { name: "Half", price: 70 },
      { name: "Full", price: 90 }
    ]
  },
  { id: "sh3", name: "Banana Dates Shake", description: "Healthy and filling banana and dates shake.", price: 80, category: "Shakes", variants: [{ name: "Half", price: 80 }, { name: "Full", price: 100 }] },
  { id: "sh4", name: "Peanut Butter Banana Shake", description: "Protein-rich shake with peanut butter and banana.", price: 80, category: "Shakes", variants: [{ name: "Half", price: 80 }, { name: "Full", price: 100 }] },
  { id: "sh5", name: "Brownie Shake", description: "Thick shake with chunks of chocolate brownie.", price: 80, category: "Shakes", variants: [{ name: "Half", price: 80 }, { name: "Full", price: 100 }] },
  { id: "sh6", name: "Oreo / KitKat Shake", description: "Classic favorite cookie or chocolate bar shake.", price: 80, category: "Shakes", variants: [{ name: "Half", price: 80 }, { name: "Full", price: 90 }] },

  // --- FRAPPES ---
  { id: "fr1", name: "Cold Frappe", description: "Chilled and blended coffee perfection.", price: 80, category: "Frappes", variants: [{ name: "Half", price: 80 }, { name: "Full", price: 90 }] },
  {
    id: "fr2",
    name: "Flavored Frappe",
    description: "Mocha, Hazelnut, Vanilla, Irish, or Caramel.",
    price: 80,
    category: "Frappes",
    variants: [
      { name: "Half", price: 80 },
      { name: "Full", price: 100 }
    ]
  },
  { id: "fr3", name: "Brownie Frappe", description: "Rich frappe with brownie chunks.", price: 90, category: "Frappes", variants: [{ name: "Half", price: 90 }, { name: "Full", price: 100 }] },
  { id: "fr4", name: "Chocolate Banana Frappe", description: "Unique blend of chocolate, banana, and coffee.", price: 90, category: "Frappes", variants: [{ name: "Half", price: 90 }, { name: "Full", price: 100 }] },

  // --- SANDWICHES ---
  { id: "sw1", name: "Mix Veg / Spicy Veg Sandwich", description: "Classic vegetable sandwich with a spicy twist option.", price: 60, category: "Sandwiches" },
  { id: "sw2", name: "Veg Cheese Sandwich", description: "Vegetable sandwich loaded with cheese.", price: 80, category: "Sandwiches" },
  { id: "sw3", name: "Aloo Patty Cheese Sandwich", description: "Sandwich with a crispy potato patty and cheese.", price: 90, category: "Sandwiches" },
  { id: "sw4", name: "Paneer / Corn Cheese / Tandoori Paneer", description: "Premium options with paneer or corn and cheese.", price: 80, category: "Sandwiches" },
  { id: "sw5", name: "Beetroot Sandwich", description: "Unique and healthy beetroot based sandwich.", price: 90, category: "Sandwiches" },
  { id: "sw6", name: "Coleslaw Sandwich", description: "Creamy coleslaw filling in fresh bread.", price: 80, category: "Sandwiches" },

  // --- SUBS ---
  { id: "sb1", name: "Green Veg Sub", description: "Healthy sub with fresh green vegetables.", price: 80, category: "Subs" },
  { id: "sb2", name: "Premium Veg Sub", description: "Choice of Veg Cheese, Spicy Veg, Corn Cheese, or Paneer.", price: 100, category: "Subs" },
  { id: "sb3", name: "Aloo Tikki Sub", description: "Sub with crispy aloo tikki and fresh veggies.", price: 120, category: "Subs" },
  { id: "sb4", name: "Paneer Tikka Sub", description: "Classic paneer tikka flavored sub.", price: 120, category: "Subs" },
  { id: "sb5", name: "Tandoori Paneer Sub", description: "Sub with smoky tandoori paneer.", price: 110, category: "Subs" },

  // --- BURGERS ---
  { id: "bg1", name: "Aloo Tikki Burger", description: "Classic Indian potato patty burger.", price: 60, category: "Burgers" },
  { id: "bg2", name: "Aloo Tikki Supreme / Veg Supreme", description: "Enhanced version of our classic burgers.", price: 80, category: "Burgers" },
  { id: "bg3", name: "Veg Crispy & Crunchy", description: "Extra crunchy vegetable patty burger.", price: 100, category: "Burgers" },
  { id: "bg4", name: "Veg Maharaja", description: "Grand burger with double patty and special toppings.", price: 120, category: "Burgers" },
  { id: "bg5", name: "Paneer Patty Burger", description: "Burger with a thick and juicy paneer patty.", price: 100, category: "Burgers" },

  // --- BUN & BREAD ---
  { id: "bb1", name: "Bread Toast", description: "Crispy and warm toasted bread slices.", price: 40, category: "Bun & Bread" },
  { id: "bb2", name: "Bun Maska", description: "Freshly baked bun with a generous amount of butter.", price: 40, category: "Bun & Bread" },
  { id: "bb3", name: "Nutella Bun Maska", description: "Bun maska with a sweet Nutella layer.", price: 60, category: "Bun & Bread" },
  { id: "bb4", name: "Peanut Butter Bun Maska", description: "Bun maska with crunchy peanut butter.", price: 60, category: "Bun & Bread" },

  // --- MAGGI ---
  { id: "mg1", name: "Plain Maggi", description: "The classic comfort noodles.", price: 49, category: "Maggi" },
  { id: "mg2", name: "Vegetable / Masala Maggi", description: "Maggi with mixed veggies and extra spice.", price: 60, category: "Maggi" },
  { id: "mg3", name: "Special Tadka Maggi", description: "Choice of Butter Tadka, Tandoori, or Chilly Spicy.", price: 70, category: "Maggi" },
  { id: "mg4", name: "Tandoori Paneer / Mushroom Maggi", description: "Premium Maggi with paneer or mushroom.", price: 80, category: "Maggi" },

  // --- FRIES ---
  { id: "ff1", name: "Salted Fries", description: "Classic salted crispy potato fries.", price: 80, category: "Fries" },
  { id: "ff2", name: "Peri Peri / Masala Fries", description: "Spicy fries with your choice of seasoning.", price: 90, category: "Fries" },
  { id: "ff3", name: "Cheesy Fries", description: "Fries loaded with melted cheese sauce.", price: 100, category: "Fries" },
  { id: "ff4", name: "Loaded Fries", description: "Fries topped with veggies, cheese, and sauces.", price: 110, category: "Fries" },

  // --- LEMONADES & MOJITOS ---
  { id: "lm1", name: "Classic Lemonade", description: "Refreshing and sweet lemon drink.", price: 50, category: "Lemonades" },
  { id: "lm2", name: "Masala Lemonade", description: "Lemonade with a tangy Indian spice twist.", price: 60, category: "Lemonades" },
  { id: "lm3", name: "Virgin Mojito", description: "Chilled mint and lime refreshment.", price: 80, category: "Lemonades" },
  { id: "lm4", name: "Blue Curacao Soda", description: "Vibrant blue soda with a citrusy flavor.", price: 80, category: "Lemonades" },
  { id: "lm5", name: "Watermelon Mojito", description: "Sweet watermelon flavored mojito.", price: 80, category: "Lemonades" },
  { id: "lm6", name: "Green Apple Soda", description: "Crisp green apple flavored fizzy drink.", price: 80, category: "Lemonades" },

  // --- PASTA ---
  { id: "ps1", name: "Indian Desi Pasta", description: "Pasta cooked with Indian spices and flavors.", price: 90, category: "Pasta" },
  { id: "ps2", name: "White Sauce / Red Sauce Pasta", description: "Choice of creamy white or tangy red sauce.", price: 100, category: "Pasta" },
  { id: "ps3", name: "Mix Sauce Pasta", description: "The best of both - creamy and tangy mix sauce.", price: 120, category: "Pasta" },

  // --- WRAPS ---
  { id: "wr1", name: "Veg Wrap", description: "Healthy wrap with mixed vegetable filling.", price: 80, category: "Wraps" },
  { id: "wr2", name: "Paneer Wrap", description: "Soft wrap filled with spiced paneer chunks.", price: 100, category: "Wraps" },
  { id: "wr3", name: "Aloo Patty Wrap", description: "Wrap with a crispy potato patty.", price: 110, category: "Wraps" },
  { id: "wr4", name: "Tandoori Paneer Wrap", description: "Smoky tandoori paneer flavored wrap.", price: 100, category: "Wraps" },
  { id: "wr5", name: "Paneer Tikka Wrap", description: "Classic paneer tikka pieces in a soft wrap.", price: 120, category: "Wraps" },

  // --- DESSERTS ---
  { id: "ds1", name: "Muffin", description: "Soft and delicious freshly baked muffin.", price: 80, category: "Desserts" },
  { id: "ds2", name: "Brownie", description: "Rich and fudgy chocolate brownie.", price: 90, category: "Desserts" },
  { id: "ds3", name: "Donuts", description: "Assorted flavored sweet donuts.", price: 90, category: "Desserts" },
  { id: "ds4", name: "Chocolate Strawberry Combo", description: "Delightful pairing of chocolate and strawberries.", price: 120, category: "Desserts" },
];
