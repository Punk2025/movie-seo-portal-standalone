/**
 * 纯静态托管下 Astro 的 `redirects` 未必会为 `/sitemap.xml` 写出文件；
 * 构建完成后复制 `sitemap-index.xml` → `sitemap.xml`，与常见站长习惯及 robots.txt 一致。
 */
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = join(root, 'dist/client');
const indexPath = join(clientDir, 'sitemap-index.xml');
const aliasPath = join(clientDir, 'sitemap.xml');

if (!existsSync(indexPath)) {
	process.exit(0);
}

copyFileSync(indexPath, aliasPath);
