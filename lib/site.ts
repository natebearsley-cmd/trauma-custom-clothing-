export const DEPOP_DROP_URL = 'https://depop.app.link/RL9TRvCzN6b'
export const DEPOP_SHOP_URL = 'https://www.depop.com/atec911/'
export const TIKTOK_URL = 'https://www.tiktok.com/@nateb19841'
export const REVERSAL_GUIDE_URL = 'https://payhip.com/Thereversal1'

export type Category = 'Tops' | 'Outerwear' | 'Headwear'

export type Product = {
  id: string
  name: string
  category: Category
  image: string
  tags: string[]
  oneOfOne?: boolean
}

{export const PRODUCTS: Product[] = [

  id: 'suffered-in-silence',
    name: '"Suffered In Silence" Heavyweight Graphic Cut',
    category: 'Tops',
    image: '/images/IMG_0914.png',
    tags: ['Still Breathing', 'Survived The Storm'],
  },
  {
    id: 'pressure-makes-diamonds',
    name: '"Pressure Makes Diamonds" Graphic Tee',
    category: 'Tops',
    image: '/images/IMG_0916.png',
    tags: ['Broken CC', 'Flame Heart', 'Devil Graphic'],
    
  

    id: 'see-no-evil',
    name: '"See No Evil, Hear No Evil" Tattoo Angels Tee',
    category: 'Tops',
    image: '/images/IMG_0917.png',
    tags: ['Cherub Trio', 'Los Locos', 'Faith'],
    
  
  
    id: 'pain-made-me',
    name: '"Pain Made Me / Don\'t Tread On Me" Arched Collar Tee',
    category: 'Tops',
    image: '/images/pain-made-me.png',
    tags: ['Collar Print', 'Gothic'],
  },
  {
    id: 'quilted-liner-jacket',
    name: '1-of-1 Handmade Quilted Floral Artisan Liner Jacket',
    category: 'Outerwear',
    image: '/images/quilted-liner-jacket.png',
    tags: ['Vintage Tapestry Lining', 'Antique Brass Buttons'],
    oneOfOne: true,
  },
  {
    id: 'tcc-beanie',
    name: 'TCC Heavyweight Ribbed Knit Beanie',
    category: 'Headwear',
    image: '/images/tcc-beanie.png',
    tags: ['Winter Drop', 'Ribbed Cuff'],
  },
]
