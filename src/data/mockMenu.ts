import type { Menu, MenuCategory, MenuItem } from '../types/bookingCustomization'

/**
 * Offline fallback for the menu catalog. Mirrors `public/menu.json`.
 * À la Carte: Gilgamesh Covent Garden — À la Carte (03.09.24).
 * Brunch and Drinks are illustrative samples to demonstrate the menu picker.
 * IDs must remain stable so saved selections keep resolving.
 */

export const MOCK_MENUS: Menu[] = [
  { id: 'a-la-carte', label: 'À la Carte', order: 0 },
  { id: 'brunch', label: 'Brunch', order: 1 },
  { id: 'drinks', label: 'Drinks', order: 2 },
]

export const MOCK_MENU_CATEGORIES: MenuCategory[] = [
  // À la Carte
  { id: 'small-sharing', menuId: 'a-la-carte', label: 'Small sharing', order: 0 },
  { id: 'salad', menuId: 'a-la-carte', label: 'Salad', order: 1 },
  { id: 'baskets', menuId: 'a-la-carte', label: 'Baskets', order: 2 },
  { id: 'rolls', menuId: 'a-la-carte', label: 'Rolls', order: 3 },
  { id: 'skewers', menuId: 'a-la-carte', label: 'Skewers', order: 4 },
  { id: 'sashimi-nigiri', menuId: 'a-la-carte', label: 'Sashimi & Nigiri', order: 5 },
  { id: 'sushi', menuId: 'a-la-carte', label: 'Sushi', order: 6 },
  { id: 'plant-based', menuId: 'a-la-carte', label: 'Plant based', order: 7 },
  { id: 'from-the-sea', menuId: 'a-la-carte', label: 'From the sea', order: 8 },
  { id: 'from-the-land', menuId: 'a-la-carte', label: 'From the land', order: 9 },
  { id: 'sides', menuId: 'a-la-carte', label: 'Sides', order: 10 },

  // Brunch
  { id: 'brunch-bowls', menuId: 'brunch', label: 'Bowls', order: 0 },
  { id: 'brunch-eggs', menuId: 'brunch', label: 'Eggs', order: 1 },
  { id: 'brunch-pastries', menuId: 'brunch', label: 'Pastries', order: 2 },

  // Drinks
  { id: 'drinks-soft', menuId: 'drinks', label: 'Soft drinks', order: 0 },
  { id: 'drinks-cocktails', menuId: 'drinks', label: 'Cocktails', order: 1 },
  { id: 'drinks-wines', menuId: 'drinks', label: 'Wines', order: 2 },
]

export const MOCK_MENU_ITEMS: MenuItem[] = [
  // ===== À la Carte =====
  // Small sharing
  { id: 'ss-asian-crackers', name: 'Asian crackers', description: 'Fresh tomato salsa', categoryId: 'small-sharing', priceCents: 500 },
  { id: 'ss-corn-rocks', name: 'Sweet corn rocks', description: 'Shiso butter', categoryId: 'small-sharing', priceCents: 600, dietaryTags: ['vegetarian'] },
  { id: 'ss-edamame', name: 'Edamame', description: 'Chilli garlic, or truffle salt (+£1)', categoryId: 'small-sharing', priceCents: 600, dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'ss-kimchi-cabbage', name: 'Kimchi cabbage salad', categoryId: 'small-sharing', priceCents: 700, dietaryTags: ['vegetarian'] },
  { id: 'ss-chicken-wings', name: 'Grilled chicken wings', description: 'Sesame seeds', categoryId: 'small-sharing', priceCents: 700, dietaryTags: ['gluten-free'] },
  { id: 'ss-avocado-tempura', name: 'Avocado & sweet potato tempura', categoryId: 'small-sharing', priceCents: 1200, dietaryTags: ['vegetarian'] },
  { id: 'ss-crispy-squid', name: 'Crispy squid', description: 'Sea salt, chilli & garlic', categoryId: 'small-sharing', priceCents: 1500, dietaryTags: ['gluten-free'] },
  { id: 'ss-salmon-tartar', name: 'Salmon tartar', description: 'Shiso ponzu', categoryId: 'small-sharing', priceCents: 1500 },
  { id: 'ss-tuna-tartar', name: 'Tuna tartar', description: 'Crispy rice bites', categoryId: 'small-sharing', priceCents: 1500, dietaryTags: ['gluten-free'] },
  { id: 'ss-popcorn-shrimp', name: 'Popcorn shrimp', description: 'Miso chipotle mayo', categoryId: 'small-sharing', priceCents: 1600 },
  { id: 'ss-wagyu-taco', name: 'Wagyu taco', description: 'Pineapple salsa', categoryId: 'small-sharing', priceCents: 1800 },
  { id: 'ss-beef-tataki', name: 'Beef tataki', description: 'Foie gras & black caviar', categoryId: 'small-sharing', priceCents: 1900 },

  // Salad
  { id: 'sl-kale-tofu-quinoa', name: 'Kale, crispy tofu & quinoa', categoryId: 'salad', priceCents: 1200, dietaryTags: ['vegan'] },
  { id: 'sl-warm-aubergine', name: 'Warm aubergine salad', categoryId: 'salad', priceCents: 1400, dietaryTags: ['vegetarian'] },
  { id: 'sl-crispy-duck', name: 'Crispy duck salad', description: 'Watermelon & cashewnut', categoryId: 'salad', priceCents: 1600 },

  // Baskets
  { id: 'bk-chive-lotus', name: 'Chive & lotus dumpling', categoryId: 'baskets', priceCents: 900, dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'bk-prawn-chive', name: 'Prawn & chive dumpling', categoryId: 'baskets', priceCents: 1200, dietaryTags: ['gluten-free'] },
  { id: 'bk-har-gau', name: 'King prawn har gau', categoryId: 'baskets', priceCents: 1200 },
  { id: 'bk-siu-mai', name: 'Chicken siu mai', categoryId: 'baskets', priceCents: 1200 },
  { id: 'bk-duck-bao', name: 'Duck bao', categoryId: 'baskets', priceCents: 1300 },

  // Rolls
  { id: 'rl-vegetable-spring', name: 'Vegetable spring rolls', categoryId: 'rolls', priceCents: 700, dietaryTags: ['vegetarian'] },
  { id: 'rl-sesame-prawn', name: 'Sesame prawn spring rolls', description: 'Tomato salsa', categoryId: 'rolls', priceCents: 1000 },
  { id: 'rl-crispy-duck', name: 'Crispy duck spring rolls', categoryId: 'rolls', priceCents: 1200 },

  // Skewers
  { id: 'sk-japanese-veg', name: 'Japanese vegetables', categoryId: 'skewers', priceCents: 700, dietaryTags: ['vegan'] },
  { id: 'sk-chicken-yakitori', name: 'Chicken yakitori', categoryId: 'skewers', priceCents: 1000 },

  // Sashimi & Nigiri
  { id: 'sn-seabass-ceviche', name: 'Seabass ceviche', categoryId: 'sashimi-nigiri', priceCents: 1700 },
  { id: 'sn-tuna-tataki', name: 'Tuna tataki', categoryId: 'sashimi-nigiri', priceCents: 1800 },
  { id: 'sn-yellowtail-jalapeno', name: 'Yellowtail jalapéno', categoryId: 'sashimi-nigiri', priceCents: 1900 },
  { id: 'sn-sashimi-platter', name: 'Assorted sashimi platter', description: '15 pieces', categoryId: 'sashimi-nigiri', priceCents: 4800 },
  { id: 'sn-nigiri-platter', name: 'Assorted nigiri platter', description: '10 pieces', categoryId: 'sashimi-nigiri', priceCents: 4800 },

  // Sushi
  { id: 'su-veg-maki', name: 'Vegetarian maki', categoryId: 'sushi', priceCents: 1300, dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'su-jade-dragon', name: 'Jade dragon roll', categoryId: 'sushi', priceCents: 1500 },
  { id: 'su-salmon-avocado', name: 'Salmon & avocado roll', categoryId: 'sushi', priceCents: 1500, dietaryTags: ['gluten-free'] },
  { id: 'su-gilgamesh-dragon', name: 'Gilgamesh dragon roll', categoryId: 'sushi', priceCents: 1700 },
  { id: 'su-mr-chang', name: 'Mr Chang roll', categoryId: 'sushi', priceCents: 1800 },

  // Plant based
  { id: 'pb-asparagus-rice', name: 'Asparagus & cauliflower fried rice', categoryId: 'plant-based', priceCents: 800, dietaryTags: ['vegan'] },
  { id: 'pb-tofu-steak', name: 'Crispy sliced tofu steak', description: 'Kimchi salad', categoryId: 'plant-based', priceCents: 1400, dietaryTags: ['vegetarian'] },
  { id: 'pb-malaysian-curry-tofu', name: 'Malaysian curry', description: 'Tofu & vegetables', categoryId: 'plant-based', priceCents: 1500, dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'pb-cauliflower-steak', name: 'Cauliflower steak', categoryId: 'plant-based', priceCents: 1500, dietaryTags: ['vegan'] },
  { id: 'pb-aubergine-miso', name: 'Aubergine miso', categoryId: 'plant-based', priceCents: 1600, dietaryTags: ['vegan', 'gluten-free'] },

  // From the sea
  { id: 'ts-baked-seabass', name: 'Baked seabass fillet', description: 'Basil', categoryId: 'from-the-sea', priceCents: 2700 },
  { id: 'ts-tiger-prawn', name: 'Grilled jumbo tiger prawn', description: 'XO sauce', categoryId: 'from-the-sea', priceCents: 3500 },
  { id: 'ts-miso-seabass', name: 'Miso Chilean seabass', categoryId: 'from-the-sea', priceCents: 4900, dietaryTags: ['gluten-free'] },

  // From the land
  { id: 'tl-mekong-chicken', name: 'Mekong lemongrass chicken', categoryId: 'from-the-land', priceCents: 1900, dietaryTags: ['gluten-free'] },
  { id: 'tl-malaysian-curry-chicken', name: 'Malaysian curry', description: 'Chicken & vegetables', categoryId: 'from-the-land', priceCents: 1900, dietaryTags: ['gluten-free'] },
  { id: 'tl-beef-rendang', name: 'Beef rendang', description: 'Roti', categoryId: 'from-the-land', priceCents: 1900 },
  { id: 'tl-shaking-beef', name: 'Shaking beef', categoryId: 'from-the-land', priceCents: 2900 },
  { id: 'tl-ribeye-bulgogi', name: 'Ribeye bulgogi', description: 'Chive mash', categoryId: 'from-the-land', priceCents: 2900 },
  { id: 'tl-lamb-chops', name: 'Lamb chops', description: 'Wasabi seasoning', categoryId: 'from-the-land', priceCents: 3200 },

  // Sides
  { id: 'sd-jasmine-rice', name: 'Jasmine rice', categoryId: 'sides', priceCents: 500, dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'sd-asian-greens', name: 'Asian greens', categoryId: 'sides', priceCents: 600, dietaryTags: ['vegan'] },
  { id: 'sd-singapore-noodles', name: 'Singapore noodles', categoryId: 'sides', priceCents: 1200 },

  // ===== Brunch (sample) =====
  // Bowls
  { id: 'br-acai-bowl', name: 'Açaí bowl', description: 'Granola, banana, coconut', categoryId: 'brunch-bowls', priceCents: 1000, dietaryTags: ['vegan'] },
  { id: 'br-yogurt-bowl', name: 'Greek yogurt bowl', description: 'Honey, seasonal fruit', categoryId: 'brunch-bowls', priceCents: 900, dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'br-poke-bowl', name: 'Salmon poke bowl', description: 'Sushi rice, edamame', categoryId: 'brunch-bowls', priceCents: 1600 },
  { id: 'br-tofu-bowl', name: 'Crispy tofu rice bowl', description: 'Pickles, sesame', categoryId: 'brunch-bowls', priceCents: 1300, dietaryTags: ['vegan'] },

  // Eggs
  { id: 'br-avo-toast', name: 'Avocado toast', description: 'Sourdough, chilli, lime', categoryId: 'brunch-eggs', priceCents: 1100, dietaryTags: ['vegetarian'] },
  { id: 'br-eggs-bene', name: 'Eggs Benedict', description: 'Black forest ham, hollandaise', categoryId: 'brunch-eggs', priceCents: 1400 },
  { id: 'br-shak', name: 'Shakshuka', description: 'Two eggs, harissa, feta', categoryId: 'brunch-eggs', priceCents: 1300, dietaryTags: ['vegetarian'] },
  { id: 'br-omelette', name: 'Smoked salmon omelette', description: 'Chives, crème fraîche', categoryId: 'brunch-eggs', priceCents: 1500, dietaryTags: ['gluten-free'] },

  // Pastries
  { id: 'br-pain-choc', name: 'Pain au chocolat', categoryId: 'brunch-pastries', priceCents: 400, dietaryTags: ['vegetarian'] },
  { id: 'br-croissant', name: 'Almond croissant', categoryId: 'brunch-pastries', priceCents: 400, dietaryTags: ['vegetarian'] },
  { id: 'br-cinnamon', name: 'Cinnamon swirl', categoryId: 'brunch-pastries', priceCents: 450, dietaryTags: ['vegetarian'] },

  // ===== Drinks (sample) =====
  // Soft drinks
  { id: 'dr-still', name: 'Still water', description: '750ml', categoryId: 'drinks-soft', priceCents: 400, dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'dr-sparkling', name: 'Sparkling water', description: '750ml', categoryId: 'drinks-soft', priceCents: 400, dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'dr-coke', name: 'Coca-Cola', categoryId: 'drinks-soft', priceCents: 400, dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'dr-lemonade', name: 'House lemonade', description: 'Yuzu & ginger', categoryId: 'drinks-soft', priceCents: 500, dietaryTags: ['vegan'] },
  { id: 'dr-jasmine', name: 'Jasmine iced tea', categoryId: 'drinks-soft', priceCents: 450, dietaryTags: ['vegan'] },

  // Cocktails
  { id: 'dr-old-fashioned', name: 'Old fashioned', description: 'Bourbon, bitters, orange', categoryId: 'drinks-cocktails', priceCents: 1400 },
  { id: 'dr-negroni', name: 'Negroni', description: 'Gin, Campari, vermouth', categoryId: 'drinks-cocktails', priceCents: 1300, dietaryTags: ['vegan'] },
  { id: 'dr-margarita', name: 'Margarita', description: 'Tequila, lime, agave', categoryId: 'drinks-cocktails', priceCents: 1300, dietaryTags: ['gluten-free'] },
  { id: 'dr-yuzu-spritz', name: 'Yuzu spritz', description: 'Prosecco, yuzu, soda', categoryId: 'drinks-cocktails', priceCents: 1200 },

  // Wines
  { id: 'dr-prosecco', name: 'Prosecco', description: '125ml glass', categoryId: 'drinks-wines', priceCents: 900 },
  { id: 'dr-sauv-blanc', name: 'Sauvignon Blanc', description: '175ml glass', categoryId: 'drinks-wines', priceCents: 1100 },
  { id: 'dr-malbec', name: 'Malbec', description: '175ml glass', categoryId: 'drinks-wines', priceCents: 1200 },
  { id: 'dr-rose', name: 'Provence rosé', description: '175ml glass', categoryId: 'drinks-wines', priceCents: 1100 },
]

const itemById = new Map(MOCK_MENU_ITEMS.map((m) => [m.id, m]))

export function getMenuItemById(id: string): MenuItem | undefined {
  return itemById.get(id)
}

export function menuItemsInCategory(categoryId: MenuItem['categoryId']): MenuItem[] {
  return MOCK_MENU_ITEMS.filter((m) => m.categoryId === categoryId)
}
