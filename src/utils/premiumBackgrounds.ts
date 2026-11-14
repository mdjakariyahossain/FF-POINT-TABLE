import pinkIndigoSilkImg from '../assets/images/premium_pink_indigo_silk_1794635224192.jpg';
import crimsonObsidianImg from '../assets/images/premium_crimson_obsidian_1794635225066.jpg';
import champagneGoldImg from '../assets/images/premium_champagne_gold_1794635226047.jpg';
import arcticCobaltImg from '../assets/images/premium_arctic_cobalt_1794635225910.jpg';
import emeraldJadeImg from '../assets/images/premium_emerald_jade_1794635509082.jpg';
import sunsetPhoenixImg from '../assets/images/premium_sunset_phoenix_1794635507877.jpg';
import royalAmethystImg from '../assets/images/premium_royal_amethyst_1794635508550.jpg';
import cyberTealImg from '../assets/images/premium_cyber_teal_1794635508947.jpg';
import platinumRoseImg from '../assets/images/premium_platinum_rose_1794635509100.jpg';
import electricVioletImg from '../assets/images/premium_electric_violet_1794635510002.jpg';
import bronzeInfernoImg from '../assets/images/premium_bronze_inferno_1794635509935.jpg';
import sakuraSteelImg from '../assets/images/premium_sakura_steel_1794635510369.jpg';
import glacierMintImg from '../assets/images/premium_glacier_mint_1794635511118.jpg';
import obsidianGoldImg from '../assets/images/premium_obsidian_gold_1794635511884.jpg';

export interface PremiumBackgroundPreset {
  id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  rowStart: string;
  rowEnd: string;
  titleColor: string;
  overlayOpacity: number;
  overlayColor: string;
}

export const PREMIUM_BACKGROUNDS: PremiumBackgroundPreset[] = [
  {
    id: 'pink-indigo-silk',
    name: 'Pink Indigo Silk',
    subtitle: 'Architectural grid · Soft silk',
    imageUrl: pinkIndigoSilkImg,
    rowStart: '#F8C4FF',
    rowEnd: '#8B89E8',
    titleColor: '#0D0E12',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'crimson-obsidian',
    name: 'Crimson Obsidian',
    subtitle: 'Blush highlight · Matte dark',
    imageUrl: crimsonObsidianImg,
    rowStart: '#FFE2E5',
    rowEnd: '#F46A7E',
    titleColor: '#0D0E12',
    overlayOpacity: 0.05,
    overlayColor: '#000000',
  },
  {
    id: 'champagne-gold',
    name: 'Champagne Gold',
    subtitle: 'Brushed gold · Slate marble',
    imageUrl: champagneGoldImg,
    rowStart: '#FFF5DB',
    rowEnd: '#E5BD73',
    titleColor: '#11100D',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'arctic-cobalt',
    name: 'Arctic Cobalt',
    subtitle: 'Ice glow · Electric prism',
    imageUrl: arcticCobaltImg,
    rowStart: '#E2F5FF',
    rowEnd: '#68B5FA',
    titleColor: '#0B1324',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'emerald-jade',
    name: 'Emerald Jade',
    subtitle: 'Mint crystal · Deep forest',
    imageUrl: emeraldJadeImg,
    rowStart: '#D8FFF0',
    rowEnd: '#5CE0A8',
    titleColor: '#071F17',
    overlayOpacity: 0.04,
    overlayColor: '#000000',
  },
  {
    id: 'sunset-phoenix',
    name: 'Sunset Phoenix',
    subtitle: 'Peach glow · Fiery coral',
    imageUrl: sunsetPhoenixImg,
    rowStart: '#FFE8D9',
    rowEnd: '#F97A5B',
    titleColor: '#1A0B08',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    subtitle: 'Lilac pearl · Plum silk',
    imageUrl: royalAmethystImg,
    rowStart: '#F4E8FF',
    rowEnd: '#B784E8',
    titleColor: '#150B24',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'cyber-teal',
    name: 'Cyber Teal',
    subtitle: 'Aqua grid · Carbon navy',
    imageUrl: cyberTealImg,
    rowStart: '#DCFCFF',
    rowEnd: '#4AD4DC',
    titleColor: '#081C24',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'platinum-rose',
    name: 'Platinum Rose',
    subtitle: 'Pearl frame · Rose copper',
    imageUrl: platinumRoseImg,
    rowStart: '#FFF2EE',
    rowEnd: '#E5A998',
    titleColor: '#171110',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'electric-violet',
    name: 'Electric Violet',
    subtitle: 'Lavender dots · Indigo prism',
    imageUrl: electricVioletImg,
    rowStart: '#EFE6FF',
    rowEnd: '#9872F6',
    titleColor: '#110A29',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'bronze-inferno',
    name: 'Bronze Inferno',
    subtitle: 'Warm sand · Basalt stone',
    imageUrl: bronzeInfernoImg,
    rowStart: '#FFF0D6',
    rowEnd: '#DE9D55',
    titleColor: '#1A1208',
    overlayOpacity: 0.04,
    overlayColor: '#000000',
  },
  {
    id: 'sakura-steel',
    name: 'Sakura Steel',
    subtitle: 'Blossom cream · Gunmetal',
    imageUrl: sakuraSteelImg,
    rowStart: '#FFEAF0',
    rowEnd: '#E38CA7',
    titleColor: '#1C0D14',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'glacier-mint',
    name: 'Glacier Mint',
    subtitle: 'Snow glow · Teal glass',
    imageUrl: glacierMintImg,
    rowStart: '#E8FFFB',
    rowEnd: '#68D9CE',
    titleColor: '#081D1C',
    overlayOpacity: 0,
    overlayColor: '#000000',
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian Gold',
    subtitle: 'Dark carbon · 24k gold lines',
    imageUrl: obsidianGoldImg,
    rowStart: '#FFF1CC',
    rowEnd: '#D9AE57',
    titleColor: '#FFFFFF',
    overlayOpacity: 0.06,
    overlayColor: '#000000',
  },
];

export function getPremiumBackgroundById(id: string | null | undefined): PremiumBackgroundPreset | null {
  if (!id) return null;
  return PREMIUM_BACKGROUNDS.find((p) => p.id === id) ?? null;
}
