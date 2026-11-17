'use strict';
const fs = require('node:fs/promises');
const {gunzip} = require('node:zlib');
const {promisify} = require('node:util');
const unzip = promisify(gunzip);
const AUR = 'https://aur.archlinux.org';
const INDEX = '/usr/share/kyvex/aur-index.json.gz';
const CACHE_TIME = 5 * 60 * 1000;
let snapshot;
const cache = new Map();

function result(item, installed) {
  const [name, version, description, base] = item;
  return {name, version, description: description || '', base: base || name, installed: installed.has(name)};
}

async function offlineIndex() {
  if (!snapshot) {
    snapshot = fs.readFile(INDEX).then(bytes => unzip(bytes, {maxOutputLength: 48 * 1024 ** 2}))
      .then(bytes => JSON.parse(bytes)).catch(error => {snapshot = null; throw error;});
  }
  return snapshot;
}

async function rpc(url) {
  const now = Date.now();
  const previous = cache.get(url);
  if (previous && previous.until > now) return previous.data;
  const response = await fetch(url, {signal: AbortSignal.timeout(4200), redirect: 'error'});
  if (!response.ok) throw new Error('AUR returned HTTP ' + response.status);
  const data = await response.json();
  if (!Array.isArray(data.results)) throw new Error('AUR catalogue is temporarily unavailable');
  if (cache.size >= 32) cache.delete(cache.keys().next().value);
  cache.set(url, {until: now + CACHE_TIME, data: data.results});
  return data.results;
}

function searchRows(rows, query) {
  const term = query.toLowerCase().trim();
  const matches = rows.filter(([name, , description]) =>
    name.toLowerCase().includes(term) || (description || '').toLowerCase().includes(term));
  matches.sort((a, b) => {
    const rank = name => name === term ? 0 : name.startsWith(term) ? 1 : 2;
    return rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]);
  });
  return matches;
}

async function search(query, installed) {
  const term = query.trim();
  let rows, source;
  if (term.length >= 2) {
    try {
      const data = await rpc(AUR + '/rpc/v5/search/' + encodeURIComponent(term) + '?by=name-desc');
      rows = data.map(p => [p.Name, p.Version, p.Description, p.PackageBase]);
      source = 'online';
    } catch {
      // A downloaded index keeps the catalogue usable in Live without a network.
    }
  }
  if (!rows) {
    rows = await offlineIndex();
    source = 'snapshot';
  }
  const sorted = searchRows(rows, term);
  return {packages: sorted.slice(0, 500).map(item => result(item, installed)),
    total: sorted.length, ready: true, source};
}

async function details(name, installed) {
  const url = AUR + '/packages/' + encodeURIComponent(name);
  let item;
  try {
    [item] = await rpc(AUR + '/rpc/v5/info?' + new URLSearchParams({'arg[]':name}));
  } catch {
    const row = (await offlineIndex()).find(p => p[0] === name);
    if (row) item = {Name:row[0], Version:row[1], Description:row[2], PackageBase:row[3]};
  }
  if (!item) throw new Error('Package was not found in AUR');
  const fields = [
    ['Name', item.Name], ['Version', item.Version], ['Description', item.Description],
    ['Package base', item.PackageBase], ['Maintainer', item.Maintainer],
    ['Dependencies', item.Depends?.join(', ')], ['Votes', item.NumVotes]
  ];
  return {url, installed: installed.has(name), text: [...fields.filter(([,value]) => value != null)
    .map(([key,value]) => key + '  ' + value), '', url].join('\n')};
}

function clearCache() { cache.clear(); snapshot = undefined; }
module.exports = {search, details, clearCache, searchRows};
