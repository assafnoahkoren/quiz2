import { defineConfig, presetAttributify, presetIcons, presetTypography } from 'unocss';
import { presetWind3 } from '@unocss/preset-wind3';

export default defineConfig({
  presets: [
    presetWind3(), 
    presetAttributify(),
    presetIcons(),
    presetTypography(),
  ],
}); 