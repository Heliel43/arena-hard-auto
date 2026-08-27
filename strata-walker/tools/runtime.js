/*
 * Minimal Twee/Harlowe-subset runtime for previewing StrataWalker.tw in a browser.
 * Supports the subset used by the project: (set:), (print:), (text:), (if:)/(elseif:)/(else:),
 * (goto:), [[links]], (dm:), (a:), the `it` keyword, and datamap property access (`'s`).
 * This is NOT a full Harlowe implementation — it only needs to mirror the pilot + near-future
 * passages. The canonical Twine source (StrataWalker.tw) compiles in the Twine desktop app.
 */
(function (global) {
  function createEngine(PASSAGES) {
    let state = {};
    let pendingGoto = null;

    function getVar(n) { return state[n]; }
    function setVar(n, v) { state[n] = v; }
    function truthy(v) {
      if (typeof v === 'boolean') return v;
      if (v === null || v === undefined) return false;
      if (v === 0 || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    }
    function stringify(v) {
      if (v === null || v === undefined) return '';
      if (typeof v === 'boolean') return v ? 'true' : 'false';
      if (typeof v === 'number') return String(v);
      return String(v);
    }
    function escHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function escAttr(s) { return escHtml(s).replace(/"/g, '&quot;'); }

    // ---- tokenizer for macro expressions ----
    function tokenize(s) {
      const toks = [];
      let i = 0;
      const re = /(\s+)|("(?:[^"\\]|\\.)*")|('s\b)|(\d+(?:\.\d+)?)|(\$[A-Za-z_][A-Za-z0-9_]*)|([A-Za-z_][A-Za-z0-9_]*)|(>=|<=|>|<|=)|(\+|-|\*|\/)|(\()|(\))|(,)|(:)/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        if (m[1] !== undefined) continue; // whitespace
        if (m[2] !== undefined) { toks.push({ t: 'str', v: m[2].slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'") }); continue; }
        if (m[3] !== undefined) { toks.push({ t: 'prop' }); continue; }
        if (m[4] !== undefined) { toks.push({ t: 'num', v: parseFloat(m[4]) }); continue; }
        if (m[5] !== undefined) { toks.push({ t: 'var', v: m[5].slice(1) }); continue; }
        if (m[6] !== undefined) { toks.push({ t: 'id', v: m[6] }); continue; }
        if (m[7] !== undefined) { toks.push({ t: 'op', v: m[7] }); continue; }
        if (m[8] !== undefined) { toks.push({ t: 'op', v: m[8] }); continue; }
        if (m[9] !== undefined) { toks.push({ t: 'lp' }); continue; }
        if (m[10] !== undefined) { toks.push({ t: 'rp' }); continue; }
        if (m[11] !== undefined) { toks.push({ t: 'comma' }); continue; }
        if (m[12] !== undefined) { toks.push({ t: 'colon' }); continue; }
      }
      return toks;
    }

    // ---- recursive-descent expression evaluator ----
    function parseExpr(toks) {
      let p = 0;
      const peek = () => toks[p];
      const next = () => toks[p++];

      function parseOr() {
        let l = parseAnd();
        while (peek() && peek().t === 'id' && peek().v === 'or') { next(); const r = parseAnd(); l = truthy(l) || truthy(r); }
        return l;
      }
      function parseAnd() {
        let l = parseNot();
        while (peek() && peek().t === 'id' && peek().v === 'and') { next(); const r = parseNot(); l = truthy(l) && truthy(r); }
        return l;
      }
      function parseNot() {
        if (peek() && peek().t === 'id' && peek().v === 'not') { next(); return !truthy(parseNot()); }
        return parseComparison();
      }
      function parseComparison() {
        let l = parseAdd();
        while (peek()) {
          const t = peek();
          if (t.t === 'id' && t.v === 'is') {
            next();
            let op = '==';
            if (peek() && peek().t === 'id' && peek().v === 'not') { next(); op = '!='; }
            const r = parseAdd();
            l = (op === '==') ? (l === r) : (l !== r);
            continue;
          }
          if (t.t === 'op' && (t.v === '>' || t.v === '<' || t.v === '>=' || t.v === '<=')) {
            next(); const r = parseAdd();
            const a = Number(l), b = Number(r);
            if (t.v === '>') l = a > b;
            else if (t.v === '<') l = a < b;
            else if (t.v === '>=') l = a >= b;
            else l = a <= b;
            continue;
          }
          break;
        }
        return l;
      }
      function parseAdd() {
        let l = parseMul();
        while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) {
          const op = next().v; const r = parseMul();
          if (op === '+') l = addOp(l, r); else l = (typeof l === 'number' && typeof r === 'number') ? l - r : l - r;
        }
        return l;
      }
      function parseMul() {
        let l = parsePostfix();
        while (peek() && peek().t === 'op' && (peek().v === '*' || peek().v === '/')) {
          const op = next().v; const r = parsePostfix();
          l = (op === '*') ? l * r : l / r;
        }
        return l;
      }
      function parsePostfix() {
        let node = parsePrimary();
        while (peek() && peek().t === 'prop') {
          next();
          let key;
          const k = peek();
          if (k && k.t === 'str') { key = next().v; }
          else if (k && k.t === 'id') { key = next().v; }
          else { key = undefined; }
          node = getProp(node, key);
        }
        return node;
      }
      function parsePrimary() {
        const t = next();
        if (!t) return undefined;
        if (t.t === 'lp') {
          const name = next();
          if (!name || name.t !== 'id') throw new Error('bad macro');
          if (peek() && peek().t === 'colon') next();
          const args = [];
          while (peek() && peek().t !== 'rp') {
            args.push(parseAdd());
            if (peek() && peek().t === 'comma') next();
            else break;
          }
          if (peek() && peek().t === 'rp') next();
          if (name.v === 'dm') {
            const o = {};
            for (let i = 0; i + 1 < args.length; i += 2) o[args[i]] = args[i + 1];
            return o;
          }
          if (name.v === 'a') return args;
          return undefined;
        }
        if (t.t === 'num') return t.v;
        if (t.t === 'str') return t.v;
        if (t.t === 'id' && t.v === 'true') return true;
        if (t.t === 'id' && t.v === 'false') return false;
        if (t.t === 'id' && t.v === 'it') return state._it;
        if (t.t === 'var') return getVar(t.v);
        return undefined;
      }

      const v = parseOr();
      return v;
    }

    function getProp(obj, key) {
      if (obj === null || obj === undefined) return undefined;
      if (Array.isArray(obj) && key !== undefined && !isNaN(Number(key))) return obj[Number(key)];
      if (typeof obj === 'object') return obj[key];
      return undefined;
    }
    function addOp(l, r) {
      if (l && typeof l === 'object' && !Array.isArray(l) && r && typeof r === 'object' && !Array.isArray(r)) {
        return Object.assign({}, l, r);
      }
      if (Array.isArray(l) && Array.isArray(r)) return l.concat(r);
      if (typeof l === 'string' || typeof r === 'string') return String(l) + String(r);
      return l + r;
    }
    function evalStr(s) { return parseExpr(tokenize(s)); }

    // ---- statement: (set: ...) ----
    function splitTopLevel(s, sep) {
      const out = []; let depth = 0; let cur = '';
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === '(' || c === '[') depth++;
        else if (c === ')' || c === ']') depth--;
        if (depth === 0 && c === sep) { out.push(cur); cur = ''; }
        else cur += c;
      }
      out.push(cur);
      return out;
    }
    function executeSet(inner) {
      inner = inner.replace(/^\s*:\s*/, '');
      const parts = splitTopLevel(inner, ',');
      for (let part of parts) {
        part = part.trim();
        if (!part) continue;
        const idx = part.indexOf(' to ');
        if (idx === -1) continue;
        const left = part.slice(0, idx).trim();
        const right = part.slice(idx + 4).trim();
        let name = left;
        if (name[0] === '$') name = name.slice(1);
        state._it = getVar(name);
        setVar(name, evalStr(right));
      }
    }

    // ---- macro / link scanning ----
    function findMatch(str, i, open, close) {
      let depth = 0;
      for (; i < str.length; i++) {
        if (str[i] === open) depth++;
        else if (str[i] === close) { depth--; if (depth === 0) return i; }
      }
      return -1;
    }
    function findBlockEnd(str, openIdx) {
      let depth = 0, i = openIdx;
      while (i < str.length) {
        if (str.startsWith('[[', i)) {
          const e = str.indexOf(']]', i + 2);
          i = e === -1 ? str.length : e + 2; continue;
        }
        if (str[i] === '[') { depth++; i++; continue; }
        if (str[i] === ']') { depth--; if (depth === 0) return i; i++; continue; }
        i++;
      }
      return -1;
    }
    function parseMacroCall(str, i) {
      // str[i] === '('
      let j = i + 1;
      while (j < str.length && /[A-Za-z]/.test(str[j])) j++;
      const name = str.slice(i + 1, j).toLowerCase();
      const colonIdx = (str[j] === ':') ? j : j; // name ends at j; colon expected at j
      const closeP = findMatch(str, i, '(', ')');
      const inner = str.slice(colonIdx + 1, closeP).trim();
      return { name, inner, closeP };
    }
    function parseIfChain(str, i) {
      const ifc = parseMacroCall(str, i);
      const blockOpen = ifc.closeP + 1;
      const blockEnd = findBlockEnd(str, blockOpen);
      const thenNodes = parseNodes(str.slice(blockOpen + 1, blockEnd), 0);
      const elseif = []; let els = null; let k = blockEnd + 1;
      while (k < str.length) {
        if (str.startsWith('(elseif:', k)) {
          const ec = parseMacroCall(str, k);
          const bo = ec.closeP + 1; const be = findBlockEnd(str, bo);
          elseif.push({ cond: ec.inner, then: parseNodes(str.slice(bo + 1, be), 0) });
          k = be + 1; continue;
        }
        if (str.startsWith('(else:', k)) {
          const ec = parseMacroCall(str, k);
          const bo = ec.closeP + 1; const be = findBlockEnd(str, bo);
          els = parseNodes(str.slice(bo + 1, be), 0);
          k = be + 1; continue;
        }
        break;
      }
      return { node: { t: 'if', cond: ifc.inner, then: thenNodes, elseif, else: els }, end: k };
    }

    function parseNodes(str, start) {
      const nodes = [];
      let buf = '';
      const flush = () => { if (buf !== '') { nodes.push({ t: 'text', val: buf }); buf = ''; } };
      let i = start;
      while (i < str.length) {
        const c = str[i];
        if (c === '(') {
          const closeP = findMatch(str, i, '(', ')');
          if (closeP === -1) { buf += str[i]; i++; continue; }
          const j = i + 1;
          let n = j;
          while (n < closeP && /[A-Za-z]/.test(str[n])) n++;
          const name = str.slice(j, n).toLowerCase();
          const inner = str.slice(n + 1, closeP).replace(/^\s*:/, '').trim();
          if (name === 'set') { flush(); executeSet(inner); i = closeP + 1; continue; }
          if (name === 'print' || name === 'text') { flush(); nodes.push({ t: 'text', val: stringify(evalStr(inner)) }); i = closeP + 1; continue; }
          if (name === 'goto') {
            flush();
            let id = inner.replace(/^"|"$/g, '').trim();
            nodes.push({ t: 'goto', id });
            i = closeP + 1; continue;
          }
          if (name === 'if' || name === 'elseif' || name === 'else') {
            const chain = parseIfChain(str, i);
            flush();
            nodes.push(chain.node);
            i = chain.end;
            continue;
          }
          // unknown macro: keep as text
          buf += str.slice(i, closeP + 1); i = closeP + 1; continue;
        }
        if (c === '[' && str[i + 1] === '[') {
          const end = str.indexOf(']]', i);
          if (end === -1) { buf += c; i++; continue; }
          const inner = str.slice(i + 2, end);
          let text, id;
          if (inner.includes('->')) { const parts = inner.split('->'); text = parts[0].trim(); id = parts[1].trim(); }
          else if (inner.includes('|')) { const parts = inner.split('|'); text = parts[0].trim(); id = parts[1].trim(); }
          else { id = inner.trim(); text = inner.trim(); }
          flush();
          nodes.push({ t: 'link', text, id });
          i = end + 2; continue;
        }
        buf += c; i++;
      }
      flush();
      return nodes;
    }

    function renderNodes(nodes) {
      let html = '';
      for (const node of nodes) {
        if (node.t === 'text') html += formatText(node.val);
        else if (node.t === 'link') html += '<a href="#" class="lk" data-id="' + escAttr(node.id) + '">' + escHtml(node.text) + '</a>';
        else if (node.t === 'goto') { pendingGoto = node.id; return html; }
        else if (node.t === 'if') {
          let chosen = null;
          if (truthy(evalStr(node.cond))) chosen = node.then;
          else {
            for (const e of (node.elseif || [])) { if (truthy(evalStr(e.cond))) { chosen = e.then; break; } }
            if (!chosen && node.else) chosen = node.else;
          }
          if (chosen) html += renderNodes(chosen);
        }
      }
      return html;
    }

    function formatText(s) {
      const lines = s.split('\n');
      const out = [];
      for (let line of lines) {
        let t = line.trim();
        if (t === '') continue;
        if (t === '---') { out.push('<hr>'); continue; }
        if (/^#{1,6}\s+/.test(t)) {
          const lvl = t.match(/^#+/)[0].length;
          const txt = escHtml(t.replace(/^#+\s+/, ''));
          out.push('<h' + lvl + '>' + txt + '</h' + lvl + '>');
          continue;
        }
        let h = escHtml(t);
        h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        h = h.replace(/_([^_]+)_/g, '<em>$1</em>');
        out.push('<p>' + h + '</p>');
      }
      return out.join('\n');
    }

    function statusBar() {
      const rank = (n) => {
        const value = Number(state[n]);
        if (!Number.isFinite(value)) return '—';
        return ['—', 'E', 'D', 'C', 'B', 'A'][Math.max(1, Math.min(5, Math.trunc(value)))];
      };
      const relicN = Array.isArray(state.relics) ? state.relics.length : 0;
      let companions = '';
      const cmap = { c_oath: 'Ada', c_mistress: 'June', c_arcanist: 'Mira', c_spirit: 'Sana', c_trick: 'Tom', c_lantern: 'Nell', c_forge: 'Ruth', c_caretaker: 'Madsen', c_president: 'Vey' };
      for (const k in cmap) { const v = state[k]; if (typeof v === 'number' && v !== 0) companions += ' · ' + cmap[k] + ' ' + (v > 0 ? '+' : '') + v; }
      return '<div class="status">Strength ' + rank('strength') + ' · Endurance ' + rank('endurance') +
        ' · Agility ' + rank('agility') + ' · Mana ' + rank('mana') + ' · Luck ' + rank('luck') +
        (relicN ? ' · Relics ' + relicN : '') + companions + '</div>';
    }

    function renderHTML(name) {
      const raw = PASSAGES[name];
      if (raw === undefined) return '<p class="missing">Missing passage: ' + escHtml(name) + '</p>';
      let html = renderNodes(parseNodes(raw, 0));
      if (pendingGoto) { const g = pendingGoto; pendingGoto = null; return renderHTML(g); }
      return '<div class="passage">' + html + '</div>';
    }

    function apply(name) {
      const app = global.document && global.document.getElementById('app');
      if (!app) return renderHTML(name);
      app.innerHTML = renderHTML(name) + statusBar();
      const links = app.querySelectorAll('a.lk');
      links.forEach((a) => {
        a.addEventListener('click', (e) => { e.preventDefault(); apply(a.dataset.id); if (global.window) global.window.scrollTo(0, 0); });
      });
      return app.innerHTML;
    }

    return { renderHTML, apply, evalStr, getState: () => state, createEngine };
  }

  const api = { createEngine };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof global !== 'undefined' && global.window) {
    global.window.__strata = api;
    global.document.addEventListener('DOMContentLoaded', () => {
      const eng = api.createEngine(global.window.PASSAGES || {});
      eng.apply(global.window.START || 'Start');
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
