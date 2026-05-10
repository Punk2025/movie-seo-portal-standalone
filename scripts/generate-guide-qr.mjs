/**
 * 可选：生成 public/guide-qr.svg（无设计稿 PNG 时使用）。
 * 当前线上物料为 `public/guide-qr.png`；更新 URL 后执行：pnpm run generate:guide-qr
 */
import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outPath = path.join(rootDir, 'public', 'guide-qr.svg');

const TARGET_URL = 'https://dydh.m8ktv.top/';

const qrSvg = await QRCode.toString(TARGET_URL, {
	type: 'svg',
	errorCorrectionLevel: 'H',
	margin: 0,
	width: 280,
	color: { dark: '#292524', light: '#fafaf9' },
});

const innerMatch = qrSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
if (!innerMatch) throw new Error('Unexpected QR SVG output');
const qrBody = innerMatch[1].trim();

/** qrcode 默认 viewBox 为模块网格（如 31×31），与 width/height 像素无关 */
const composed = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" width="280" height="280" role="img" aria-label="扫码访问观影导航 ${TARGET_URL}">
  <defs>
    <filter id="badge-shadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="0.08" stdDeviation="0.15" flood-opacity="0.18"/>
    </filter>
  </defs>
  ${qrBody}
  <!-- 约占可视区域约 30%，依赖纠错等级 H -->
  <rect x="8" y="11.7" width="15" height="7.6" rx="1.05" fill="#fffbeb" stroke="#f59e0b" stroke-width="0.42" filter="url(#badge-shadow)"/>
  <text x="15.5" y="16.35" text-anchor="middle" font-family="system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="2.42" font-weight="700" fill="#b45309">免费电影</text>
</svg>
`;

fs.writeFileSync(outPath, composed, 'utf8');
